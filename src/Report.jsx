
import React, { useEffect, useState } from "react";
import styles from "./FleetOwnerTripPaymentForm.module.css";
// Use the environment variable for SheetDB API URL
const APPS_SCRIPT_URL = "https://sheetdb.io/api/v1/hbm0l5jjta0ls";
  // Save last day's report to SheetDB (if not already present)
  async function saveLastDayReport() {
    if (!data.length) return alert("No data to save.");
    // Get the most recent (last day) record
    const lastDay = data[0];
    if (!lastDay) return alert("No last day record found.");
    // Check if already present in SheetDB (by date and driver)
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}/search?date=${encodeURIComponent(lastDay.date)}&driver=${encodeURIComponent(lastDay.driver)}`);
      const existing = await res.json();
      if (existing && existing.length > 0) {
        alert("Last day report already exists in SheetDB.");
        return;
      }
    } catch (err) {
      // If error, allow save anyway
    }
    // Save last day record
    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [lastDay] }),
      });
      const result = await response.json();
      if (result.created || result.result === "success") {
        alert("✅ Last day report saved to SheetDB!");
      } else {
        alert("❌ Error: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      alert("❌ Failed to save last day report.");
    }
  }

const PERIODS = [
  { label: "Last Day", value: 1 },
  { label: "Last 7 Days", value: 7 },
  { label: "1 Month", value: 30 },
  { label: "3 Months", value: 90 },
];
const DRIVERS = ["All", "Vivek Bali", "Vikash Yadav", "Chhotelal Yadav"];

export default function Report() {
  // Helpers for daily API quota and cache
  function getReportApiQuota() {
    const key = `report_api_quota_${new Date().toLocaleDateString('en-GB')}`;
    return Number(localStorage.getItem(key) || 0);
  }
  function incrementReportApiQuota() {
    const key = `report_api_quota_${new Date().toLocaleDateString('en-GB')}`;
    const val = getReportApiQuota() + 1;
    localStorage.setItem(key, val);
  }
  function setReportCache(data) {
    const key = `report_cache_${new Date().toLocaleDateString('en-GB')}`;
    localStorage.setItem(key, JSON.stringify(data));
  }
  function getReportCache(dateStr) {
    const key = `report_cache_${dateStr}`;
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  }
  function getYesterdayStr() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toLocaleDateString('en-GB');
  }

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState(PERIODS[0].value);
  const [driver, setDriver] = useState(DRIVERS[0]);

  useEffect(() => {
    // Only fetch from API if not already cached for today
    const todayKey = new Date().toLocaleDateString('en-GB');
    const cached = getReportCache(todayKey);
    if (cached && cached.length) {
      setData(cached);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(APPS_SCRIPT_URL)
      .then((res) => res.json())
      .then((json) => {
        let rows = json.data || json;
        // Sort by date (dd/mm/yyyy) descending
        rows = rows.slice().sort((a, b) => {
          const [da, ma, ya] = (a.date || "").split("/").map(Number);
          const [db, mb, yb] = (b.date || "").split("/").map(Number);
          return new Date(yb, mb - 1, db) - new Date(ya, ma - 1, da);
        });
        setData(rows);
        setReportCache(rows);
        incrementReportApiQuota();
        setLoading(false);
      })
      .catch(() => {
        // On error, fallback to yesterday's cache if available
        const cachedY = getReportCache(getYesterdayStr());
        if (cachedY && cachedY.length) {
          setData(cachedY);
        } else {
          setData([]);
        }
        setLoading(false);
      });
  }, []);

  // Helper to get filtered data for a period
  function getFiltered(periodValue) {
    return data.slice(0, periodValue).filter((row) => driver === "All" || row.driver === driver);
  }

  // Helper to get totals for a period
  function getTotals(filtered) {
    const totalEarnings = filtered.reduce((sum, row) => sum + Number(row.earnings || 0), 0);
    const totalExpenses = filtered.reduce((sum, row) => sum + Number(row.fuel || 0) + Number(row.yatri_commission || 0) + Number(row.uber_commission || 0) + Number(row.other_expenses || 0), 0);
    const totalProfit = filtered.reduce((sum, row) => sum + Number(row.owner_profit || 0), 0);
    return { totalEarnings, totalExpenses, totalProfit };
  }

  // State for selected period tab
  const [activeTab, setActiveTab] = useState(PERIODS[0].value);

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      background: '#f6f9fc',
      padding: '40px 0',
      overflow: 'hidden',
    }}>
      {/* SVG background image for extra aesthetics */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
          opacity: 0.18,
        }}
        viewBox="0 0 800 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <ellipse cx="650" cy="80" rx="180" ry="60" fill="#fda085" />
        <ellipse cx="200" cy="520" rx="160" ry="50" fill="#a1c4fd" />
        <ellipse cx="400" cy="300" rx="320" ry="120" fill="#f6d365" fillOpacity="0.5" />
      </svg>
      {/* Aesthetic blurred gradient blobs */}
      <div style={{
        position: 'absolute',
        top: '-120px',
        left: '-120px',
        width: 320,
        height: 320,
        background: 'radial-gradient(circle at 60% 40%, #fda085 0%, #f6d365 80%)',
        filter: 'blur(60px)',
        opacity: 0.55,
        zIndex: 0,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-100px',
        right: '-100px',
        width: 260,
        height: 260,
        background: 'radial-gradient(circle at 40% 60%, #a1c4fd 0%, #c2e9fb 80%)',
        filter: 'blur(60px)',
        opacity: 0.5,
        zIndex: 0,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'relative',
        maxWidth: 1000,
        margin: '0 auto',
        background: 'linear-gradient(120deg,#fff 70%,#f6f9fc 100%)',
        borderRadius: 24,
        boxShadow: '0 8px 32px rgba(37,99,235,0.10)',
        padding: '36px 40px 32px 40px',
        zIndex: 1,
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <span style={{ fontSize: 32, color: '#2563eb', background: '#e0e7ff', borderRadius: 12, padding: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>📊</span>
          <span style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', letterSpacing: 1 }}>Fleet Earnings Report</span>
        </div>
        <div style={{ color: '#64748b', fontSize: 18, marginBottom: 32, fontWeight: 500 }}>Overview of earnings, expenses, and profit</div>
        <div style={{ display: 'flex', gap: 32, marginBottom: 32, flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <label style={{ fontWeight: 700, marginRight: 10, color: '#374151', fontSize: 16 }}>Period:</label>
            <select value={period} onChange={e => setPeriod(Number(e.target.value))} style={{ padding: '10px 18px', borderRadius: 10, border: '1.5px solid #a5b4fc', fontSize: 16, background: '#f3f4f6', fontWeight: 600, color: '#374151', outline: 'none', transition: 'border 0.2s' }}>
              {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 700, marginRight: 10, color: '#374151', fontSize: 16 }}>Driver:</label>
            <select value={driver} onChange={e => setDriver(e.target.value)} style={{ padding: '10px 18px', borderRadius: 10, border: '1.5px solid #a5b4fc', fontSize: 16, background: '#f3f4f6', fontWeight: 600, color: '#374151', outline: 'none', transition: 'border 0.2s' }}>
              {DRIVERS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              style={{
                padding: '10px 24px',
                background: activeTab === p.value ? 'linear-gradient(90deg,#2563eb,#1d4ed8)' : '#e0e7ff',
                color: activeTab === p.value ? '#fff' : '#2563eb',
                borderRadius: 10,
                border: 'none',
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
                transition: 'background 0.2s',
              }}
              onClick={() => setActiveTab(p.value)}
            >
              {p.label}
            </button>
          ))}
          {/* Save Last Day Report button removed as per user request */}
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', fontSize: 20, color: '#64748b', fontWeight: 600, padding: '40px 0' }}>Loading...</div>
        ) : error ? (
          <div style={{ color: "#f43f5e", fontWeight: 700, fontSize: 18, textAlign: 'center', padding: '40px 0' }}>{error}</div>
        ) : (
          <>
            <div style={{ overflowX: 'auto', borderRadius: 14, boxShadow: '0 2px 8px rgba(37,99,235,0.04)', marginBottom: 32 }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 17, background: '#fff' }}>
                <thead>
                  <tr style={{ background: "#f3f4f6" }}>
                    <th style={{ padding: "14px 10px", fontWeight: 700, color: '#374151', borderRadius: "12px 0 0 0" }}>Date</th>
                    <th style={{ padding: "14px 10px", fontWeight: 700, color: '#374151' }}>Driver</th>
                    <th style={{ padding: "14px 10px", fontWeight: 700, color: '#374151' }}>Earnings</th>
                    <th style={{ padding: "14px 10px", fontWeight: 700, color: '#374151' }}>Fuel</th>
                    <th style={{ padding: "14px 10px", fontWeight: 700, color: '#374151' }}>Uber</th>
                    <th style={{ padding: "14px 10px", fontWeight: 700, color: '#374151' }}>Yatri</th>
                    <th style={{ padding: "14px 10px", fontWeight: 700, color: '#374151' }}>Other</th>
                    <th style={{ padding: "14px 10px", fontWeight: 700, color: '#374151', borderRadius: "0 12px 0 0" }}>Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filtered = getFiltered(activeTab);
                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', color: '#64748b', fontWeight: 600, padding: '32px 0' }}>No data available for this period/driver.</td>
                        </tr>
                      );
                    }
                    return filtered.map((row, idx) => (
                      <tr key={idx} style={{ background: idx % 2 ? "#f8fafc" : "#fff" }}>
                        <td style={{ padding: "12px 10px", borderRadius: idx === filtered.length - 1 ? "0 0 0 12px" : "0" }}>{row.date}</td>
                        <td style={{ padding: "12px 10px" }}>{row.driver}</td>
                        <td style={{ padding: "12px 10px" }}>₹{Number(row.earnings || 0).toFixed(2)}</td>
                        <td style={{ padding: "12px 10px" }}>₹{Number(row.fuel || 0).toFixed(2)}</td>
                        <td style={{ padding: "12px 10px" }}>₹{Number(row.uber_commission || 0).toFixed(2)}</td>
                        <td style={{ padding: "12px 10px" }}>₹{Number(row.yatri_commission || 0).toFixed(2)}</td>
                        <td style={{ padding: "12px 10px" }}>₹{Number(row.other_expenses || 0).toFixed(2)}</td>
                        <td style={{ padding: "12px 10px", fontWeight: 700, color: "#22c55e", borderRadius: idx === filtered.length - 1 ? "0 0 12px 0" : "0" }}>₹{Number(row.owner_profit || 0).toFixed(2)}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
            {(() => {
              const filtered = getFiltered(activeTab);
              const { totalEarnings, totalExpenses, totalProfit } = getTotals(filtered);
              return (
                <div style={{ display: "flex", gap: "2rem", justifyContent: "center", marginBottom: "1rem" }}>
                  <div style={{ background: "#e0e7ff", borderRadius: 14, padding: "1.4rem 2.2rem", fontWeight: 800, color: "#2563eb", fontSize: "1.25rem", boxShadow: '0 2px 8px rgba(37,99,235,0.06)' }}>
                    💰 Total Earnings: ₹{totalEarnings.toFixed(2)}
                  </div>
                  <div style={{ background: "#fee2e2", borderRadius: 14, padding: "1.4rem 2.2rem", fontWeight: 800, color: "#f43f5e", fontSize: "1.25rem", boxShadow: '0 2px 8px rgba(244,63,94,0.06)' }}>
                    🧾 Total Expenses: ₹{totalExpenses.toFixed(2)}
                  </div>
                  <div style={{ background: "#d1fae5", borderRadius: 14, padding: "1.4rem 2.2rem", fontWeight: 800, color: "#22c55e", fontSize: "1.25rem", boxShadow: '0 2px 8px rgba(34,197,94,0.06)' }}>
                    💼 Total Profit: ₹{totalProfit.toFixed(2)}
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}
