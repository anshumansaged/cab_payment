import React, { useState, useEffect } from "react";

const SHEETDB_CASH_URL = "https://sheetdb.io/api/v1/9w2v6v7w2v6v7";
const drivers = ["Vivek Bali", "Vikash Yadav", "Chhotelal Yadav"];


export default function CashManager() {
  // Section selector
  const [section, setSection] = useState("driver");
  // Driver section
  const [selectedDriver, setSelectedDriver] = useState(drivers[0]);
  const [driverAmount, setDriverAmount] = useState("");
  const [driverEntries, setDriverEntries] = useState([]); // {driver, amount}
  const [driverLoading, setDriverLoading] = useState(false);
  const [driverMsg, setDriverMsg] = useState("");
  // Accountant section
  const [accountantType, setAccountantType] = useState("online");
  const [accountantAmount, setAccountantAmount] = useState("");
  const [accountantLoading, setAccountantLoading] = useState(false);
  const [accountantMsg, setAccountantMsg] = useState("");
  const [totalCash, setTotalCash] = useState(() => {
    const cached = localStorage.getItem("cab_total_cash");
    return cached ? Number(cached) : 0;
  });

  // Fetch total cash from SheetDB only after a driver/accountant action
  async function fetchAndUpdateTotalCash() {
    try {
      const res = await fetch(SHEETDB_CASH_URL + "?sheet=cash");
      const data = await res.json();
      let driverTotal = 0;
      let accountantTotal = 0;
      data.forEach(row => {
        if (row.type === "driver") driverTotal += Number(row.amount) || 0;
        if (row.type === "accountant") accountantTotal += Number(row.amount) || 0;
      });
      const total = driverTotal - accountantTotal;
      setTotalCash(total);
      localStorage.setItem("cab_total_cash", total);
    } catch (err) {
      setTotalCash(0);
      localStorage.setItem("cab_total_cash", 0);
    }
  }

  // Add driver entry to batch
  function handleAddDriverEntry(e) {
    e.preventDefault();
    if (!driverAmount || isNaN(driverAmount) || Number(driverAmount) <= 0) return;
    setDriverEntries(prev => [
      ...prev,
      {
        type: "driver",
        driver: selectedDriver,
        amount: driverAmount,
        date: new Date().toLocaleDateString("en-GB"),
      },
    ]);
    setDriverAmount("");
  }

  // Submit all driver entries in one API call
  async function handleDriverBatchSubmit(e) {
    e.preventDefault();
    if (driverEntries.length === 0) return;
    setDriverLoading(true);
    setDriverMsg("");
    try {
      const res = await fetch(SHEETDB_CASH_URL + "?sheet=cash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: driverEntries }),
      });
      const result = await res.json();
      if (result.created || result.result === "success") {
        setDriverMsg("✅ Saved successfully!");
        setDriverEntries([]);
        await fetchAndUpdateTotalCash();
      } else {
        setDriverMsg("❌ Error saving cash");
      }
    } catch {
      setDriverMsg("❌ Network error");
    }
    setDriverLoading(false);
  }

  // Save accountant cash
  async function handleAccountantSubmit(e) {
    e.preventDefault();
    setAccountantLoading(true);
    setAccountantMsg("");
    try {
      const payload = {
        type: "accountant",
        accountant_type: accountantType,
        amount: accountantAmount,
        note: accountantType === "online" ? "Money Sent Online" : "Expenditure",
        date: new Date().toLocaleDateString("en-GB"),
      };
      const res = await fetch(SHEETDB_CASH_URL + "?sheet=cash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [payload] }),
      });
      const result = await res.json();
      if (result.created || result.result === "success") {
        setAccountantMsg("✅ Saved successfully!");
        setAccountantAmount("");
        await fetchAndUpdateTotalCash();
      } else {
        setAccountantMsg("❌ Error saving cash");
      }
    } catch {
      setAccountantMsg("❌ Network error");
    }
    setAccountantLoading(false);
  }

  return (
    <div style={{
      position: 'relative',
      background: '#f6f9fc',
      padding: '32px 0',
      overflow: 'hidden',
      minHeight: 'unset',
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
        maxWidth: 520,
        margin: '24px auto',
        background: 'linear-gradient(120deg,#fff 70%,#f6f9fc 100%)',
        borderRadius: 24,
        boxShadow: '0 8px 32px 0 rgba(30,42,120,0.10), 0 1.5px 8px 0 #e9f0ff',
        padding: 20,
        fontFamily: 'Sora, Inter, Poppins, sans-serif',
        zIndex: 1,
        minHeight: 'unset',
      }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1e2a78', marginBottom: 18, letterSpacing: '-1px' }}>💸 Cash Management</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        <button
          onClick={() => setSection('driver')}
          style={{
            padding: '10px 22px',
            borderRadius: 14,
            background: section === 'driver' ? 'linear-gradient(90deg,#6159ec,#ef476f)' : '#f6f9fc',
            color: section === 'driver' ? '#fff' : '#1e2a78',
            fontWeight: 700,
            border: 'none',
            fontSize: 16,
            boxShadow: section === 'driver' ? '0 2px 8px #e9f0ff' : 'none',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          Driver
        </button>
        <button
          onClick={() => setSection('accountant')}
          style={{
            padding: '10px 22px',
            borderRadius: 14,
            background: section === 'accountant' ? 'linear-gradient(90deg,#ef476f,#6159ec)' : '#f6f9fc',
            color: section === 'accountant' ? '#fff' : '#1e2a78',
            fontWeight: 700,
            border: 'none',
            fontSize: 16,
            boxShadow: section === 'accountant' ? '0 2px 8px #e9f0ff' : 'none',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          Accountant
        </button>
      </div>
      {section === 'driver' && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ color: '#6159ec', fontWeight: 700, fontSize: 20, marginBottom: 10 }}>Driver Section</h3>
          <form onSubmit={handleAddDriverEntry} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
            <select value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)} style={{ borderRadius: 12, border: '1.5px solid #b2b7ff', padding: 10, fontSize: 16, background: '#f6f9fc', color: '#1e2a78', fontWeight: 600 }}>
              {drivers.map(d => <option key={d}>{d}</option>)}
            </select>
            <input type="number" placeholder="Amount given" value={driverAmount} onChange={e => setDriverAmount(e.target.value)} style={{ borderRadius: 12, border: '1.5px solid #b2b7ff', padding: 10, fontSize: 16, background: '#f6f9fc', color: '#1e2a78', width: 140 }} required />
            <button
              type="submit"
              disabled={driverLoading}
              style={{
                padding: '10px 22px',
                borderRadius: 16,
                background: driverLoading
                  ? 'linear-gradient(90deg,#b2b7ff,#b2b7ff)'
                  : 'linear-gradient(90deg,#6159ec,#ef476f)',
                color: '#fff',
                fontWeight: 800,
                border: 'none',
                fontSize: 17,
                boxShadow: '0 4px 16px 0 #e9f0ff',
                cursor: driverLoading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s, box-shadow 0.2s, transform 0.1s',
                letterSpacing: 0.5,
                transform: driverLoading ? 'scale(0.98)' : 'scale(1)',
              }}
            >
              {driverLoading ? 'Saving...' : 'Add'}
            </button>
          </form>
          {driverEntries.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <ul style={{ paddingLeft: 0, margin: 0 }}>
                {driverEntries.map((entry, idx) => (
                  <li key={idx} style={{ listStyle: 'none', color: '#1e2a78', fontWeight: 500, fontSize: 15, marginBottom: 2 }}>
                    {entry.driver} - ₹{entry.amount} ({entry.date})
                  </li>
                ))}
              </ul>
              <button
                onClick={handleDriverBatchSubmit}
                disabled={driverLoading}
                style={{
                  marginTop: 6,
                  padding: '10px 28px',
                  borderRadius: 18,
                  background: driverLoading
                    ? 'linear-gradient(90deg,#b2b7ff,#b2b7ff)'
                    : 'linear-gradient(90deg,#ef476f,#6159ec)',
                  color: '#fff',
                  fontWeight: 900,
                  border: 'none',
                  fontSize: 17,
                  boxShadow: '0 4px 16px 0 #e9f0ff',
                  cursor: driverLoading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s, box-shadow 0.2s, transform 0.1s',
                  letterSpacing: 0.5,
                  transform: driverLoading ? 'scale(0.98)' : 'scale(1)',
                  textShadow: '0 2px 8px #ef476f22',
                }}
              >
                {driverLoading ? 'Saving...' : 'Submit All'}
              </button>
            </div>
          )}
          {driverMsg && <div style={{ color: driverMsg.startsWith('✅') ? '#22c55e' : '#ef476f', fontWeight: 600 }}>{driverMsg}</div>}
        </div>
      )}
      {section === 'accountant' && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ color: '#6159ec', fontWeight: 700, fontSize: 20, marginBottom: 10 }}>Accountant Section</h3>
          <form onSubmit={handleAccountantSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start', marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <select value={accountantType} onChange={e => setAccountantType(e.target.value)} style={{ borderRadius: 12, border: '1.5px solid #b2b7ff', padding: 10, fontSize: 16, background: '#f6f9fc', color: '#1e2a78', fontWeight: 600 }}>
                <option value="online">Money Sent Online</option>
                <option value="expenditure">Expenditure</option>
              </select>
              <input type="number" placeholder="Amount" value={accountantAmount} onChange={e => setAccountantAmount(e.target.value)} style={{ borderRadius: 12, border: '1.5px solid #b2b7ff', padding: 10, fontSize: 16, background: '#f6f9fc', color: '#1e2a78', width: 140 }} required />
            </div>
            <button
              type="submit"
              disabled={accountantLoading}
              style={{
                padding: '10px 22px',
                borderRadius: 16,
                background: accountantLoading
                  ? 'linear-gradient(90deg,#b2b7ff,#b2b7ff)'
                  : 'linear-gradient(90deg,#ef476f,#6159ec)',
                color: '#fff',
                fontWeight: 800,
                border: 'none',
                fontSize: 17,
                boxShadow: '0 4px 16px 0 #e9f0ff',
                cursor: accountantLoading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s, box-shadow 0.2s, transform 0.1s',
                letterSpacing: 0.5,
                transform: accountantLoading ? 'scale(0.98)' : 'scale(1)',
              }}
            >
              {accountantLoading ? 'Saving...' : 'Submit'}
            </button>
          </form>
          {accountantMsg && <div style={{ color: accountantMsg.startsWith('✅') ? '#22c55e' : '#ef476f', fontWeight: 600 }}>{accountantMsg}</div>}
        </div>
      )}
        <div style={{ background: '#f6f9fc', borderRadius: 14, padding: 18, color: '#1e2a78', fontWeight: 700, fontSize: 18, boxShadow: '0 1.5px 8px 0 #e9f0ff', textAlign: 'center' }}>
          <span>💰 Total Cash (Driver - Accountant): </span>
          <span style={{ color: totalCash >= 0 ? '#22c55e' : '#ef476f' }}>₹{totalCash.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
