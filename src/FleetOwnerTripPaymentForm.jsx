import React, { useState, useEffect } from "react";
// --- API Quota Helpers ---
function getMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}`;
}
function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}
function getApiQuota(type) {
  // type: 'save' or 'report'
  const key = `api_quota_${type}_${getMonthKey()}`;
  return Number(localStorage.getItem(key) || 0);
}
function incrementApiQuota(type) {
  const key = `api_quota_${type}_${getMonthKey()}`;
  const val = getApiQuota(type) + 1;
  localStorage.setItem(key, val);
}
function canCallSave() {
  return getApiQuota('save') < 100;
}
function canCallReport() {
  return getApiQuota('report') < 350;
}
function setReportCache(data) {
  localStorage.setItem(`report_cache_${getTodayKey()}`, JSON.stringify(data));
}
function getReportCache() {
  const val = localStorage.getItem(`report_cache_${getTodayKey()}`);
  return val ? JSON.parse(val) : null;
}
import styles from "./FleetOwnerTripPaymentForm.module.css";

// Fetch records from SheetDB, sorted by date descending, and filter for last day
export async function fetchRecordsLastDayFirst() {
  try {
    const response = await fetch("https://sheetdb.io/api/v1/hbm0l5jjta0ls");
    const data = await response.json();
    // Sort by date descending (assuming 'date' is DD/MM/YYYY)
    const sorted = data.sort((a, b) => {
      const [da, ma, ya] = a.date.split('/').map(Number);
      const [db, mb, yb] = b.date.split('/').map(Number);
      const dateA = new Date(ya, ma - 1, da);
      const dateB = new Date(yb, mb - 1, db);
      return dateB - dateA;
    });
    // Filter for last day's record
    const today = new Date();
    const lastDayStr = today.toLocaleDateString("en-GB");
    const lastDayRecords = sorted.filter(r => r.date === lastDayStr);
    // Return last day records if found, else all sorted
    return lastDayRecords.length ? lastDayRecords : sorted;
  } catch (err) {
    console.error("Fetch error:", err);
    return [];
  }
}

const drivers = [
  { name: "Vivek Bali", percent: 0.3 },
  { name: "Vikash Yadav", percent: 0.5 },
  { name: "Chhotelal Yadav", percent: 0.35 },
];

const initialEarnings = {
  uber: "",
  indrive: "",
  yatri: "",
  rapido: "",
  offline: "",
};

const initialCash = {
  uber: "",
  indrive: "",
  yatri: "",
  rapido: "",
  offline: "",
};

export default function FleetOwnerTripPaymentForm() {
  const [showToast, setShowToast] = useState(false);
  const [driver, setDriver] = useState(drivers[0]);
  const [startKm, setStartKm] = useState("");
  const [endKm, setEndKm] = useState("");
  const [earnings, setEarnings] = useState(initialEarnings);
  const [yatriTrips, setYatriTrips] = useState("");
  // Always show yatri sathi trip input
  const [onlinePayment, setOnlinePayment] = useState("No");
  const [onlineAmount, setOnlineAmount] = useState("");
  const [cash, setCash] = useState(initialCash);
  const [fuelEnabled, setFuelEnabled] = useState("No");
  const [fuelEntries, setFuelEntries] = useState([]);
  const [uberDeduction, setUberDeduction] = useState("No");
  const [uberCommission, setUberCommission] = useState(0);
  const [otherExpensesEnabled, setOtherExpensesEnabled] = useState("No");
  const [otherExpenses, setOtherExpenses] = useState([]);
  const [cashGiven, setCashGiven] = useState("");
  const [summary, setSummary] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [driverWithdrawalEnabled, setDriverWithdrawalEnabled] = useState("No");
  const [driverWithdrawalAmount, setDriverWithdrawalAmount] = useState("");
  const [calculatedCashCollection, setCalculatedCashCollection] = useState(0);

  // Derived values
  const totalKm =
    startKm && endKm && !isNaN(startKm) && !isNaN(endKm)
      ? Math.max(0, Number(endKm) - Number(startKm))
      : "";

  const totalEarnings = Object.values(earnings)
    .map((v) => Number(v) || 0)
    .reduce((a, b) => a + b, 0);

  const totalCashCollected = Object.values(cash)
    .map((v) => Number(v) || 0)
    .reduce((a, b) => a + b, 0);

  const totalFuel = fuelEntries
    .map((entry) => Number(entry.value) || 0)
    .reduce((a, b) => a + b, 0);

  const yatriCommission =
    earnings.yatri && Number(earnings.yatri) > 0 && yatriTrips
      ? Number(yatriTrips) * 10
      : 0;

  const totalOtherExpenses = otherExpenses
    .map((exp) => Number(exp.value) || 0)
    .reduce((a, b) => a + b, 0);

  useEffect(() => {
    setUberCommission(uberDeduction === "Yes" ? 117 : 0);
  }, [uberDeduction]);

  // Remove showYatriTrips logic, always show yatri trips input

  function handleCalculate() {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2200);
    // Calculate commissions
    const yatriComm = Number(yatriTrips) * 10;
    const uberComm = uberDeduction === "Yes" ? 117 : 0;

    // Ensure all cash and earnings inputs are numbers
    const cashValues = Object.fromEntries(Object.entries(cash).map(([k, v]) => [k, Number(v) || 0]));
    const earningsValues = Object.fromEntries(Object.entries(earnings).map(([k, v]) => [k, Number(v) || 0]));
    const onlineAmt = Number(onlineAmount) || 0;
    const cashGivenNum = Number(cashGiven) || 0;
    const driverWithdrawalAmt = Number(driverWithdrawalAmount) || 0;

    // Raw sum of all apps (including offline)
    const rawTotalEarn = Object.values(earningsValues).reduce((a, b) => a + b, 0);

    let totalEarn = rawTotalEarn - uberComm - yatriComm;
    let driverPay = 0;
    let ownerProfit = 0;
    let cashCollection = 0;
    if (driver.name === "Vikash Yadav") {
      // Total earning = rawTotalEarn - uberComm - yatriComm
      totalEarn = rawTotalEarn - uberComm - yatriComm;
      // Driver pay = (totalEarn - totalFuel) / 2
      driverPay = (totalEarn - totalFuel) / 2;
      ownerProfit = driverPay;
      // Total cash = cash.uber + cash.indrive + cash.yatri + cash.rapido + cash.offline - totalFuel - onlineAmt + uberComm
      cashCollection = cashValues.uber + cashValues.indrive + cashValues.yatri + cashValues.rapido + cashValues.offline - totalFuel - onlineAmt + uberComm;
    } else {
      // Earning calculation for other drivers
      driverPay = totalEarn * driver.percent;
      ownerProfit = totalEarn - totalFuel - totalOtherExpenses - driverPay;
      cashCollection =
        cashValues.uber +
        cashValues.yatri +
        cashValues.indrive +
        cashValues.offline +
        cashValues.rapido
        - totalFuel
        - onlineAmt
        - driverPay
    }

    // Update state with calculated values
    setCalculatedCashCollection(cashCollection);
    setSummary(`Total Earnings: ₹${totalEarn.toFixed(2)} | Driver Pay: ₹${driverPay.toFixed(2)} | Owner Profit: ₹${ownerProfit.toFixed(2)} | Total Cash: ₹${cashCollection.toFixed(2)}`);
    setShowSummary(true);
  }

  async function handleSendWhatsApp() {
    const message = `*Trip Payment Summary*%0A%0A*Driver:* ${driver.name}%0A*Date:* ${new Date().toLocaleDateString("en-GB")}%0A*Total KM:* ${totalKm}%0A*Earnings:* ₹${totalEarnings}%0A*Cash Collected:* ₹${totalCashCollected}%0A*Fuel Cost:* ₹${totalFuel}%0A*Uber Commission:* ₹${uberCommission}%0A*Yatri Commission:* ₹${yatriCommission}%0A*Driver Pay:* ₹${summary.match(/Driver Pay: ₹([0-9.]+)/)?.[1] || ""}%0A*Owner Profit:* ₹${summary.match(/Owner Profit: ₹([0-9.]+)/)?.[1] || ""}%0A*Remaining Cash:* ₹${summary.match(/Remaining Cash Due: ₹([0-9.]+)/)?.[1] || ""}%0A%0A*Thank you!* 🚖`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  }

const SHEETDB_API_URL = process.env.REACT_APP_SHEETDB_EARNINGS_URL;
  async function handleSaveSheetDB() {
    if (!canCallSave()) {
      alert("❌ Monthly save quota reached (100 calls). Please try again next month.");
      return;
    }
    const payload = {
      date: new Date().toLocaleDateString("en-GB"),
      driver: driver.name,
      km: totalKm,
      earnings: totalEarnings.toFixed(2),
      cash_collected: totalCashCollected.toFixed(2),
      fuel: totalFuel.toFixed(2),
      uber_commission: uberCommission.toFixed(2),
      yatri_commission: yatriCommission.toFixed(2),
      driver_pay: (() => {
        const rawTotalEarn = Object.values(earnings).reduce((a, b) => a + (Number(b) || 0), 0);
        const totalEarn = rawTotalEarn - uberCommission - yatriCommission;
        if (driver.name === "Vikash Yadav") {
          return ((totalEarn - totalFuel) / 2).toFixed(2);
        } else {
          return (totalEarn * driver.percent).toFixed(2);
        }
      })(),
      owner_profit: (() => {
        const rawTotalEarn = Object.values(earnings).reduce((a, b) => a + (Number(b) || 0), 0);
        const totalEarn = rawTotalEarn - uberCommission - yatriCommission;
        if (driver.name === "Vikash Yadav") {
          return ((totalEarn - totalFuel) / 2).toFixed(2);
        } else {
          const driverPay = totalEarn * driver.percent;
          return (totalEarn - totalFuel - totalOtherExpenses - driverPay).toFixed(2);
        }
      })(),
      remaining_cash: (() => {
        let remaining = calculatedCashCollection;
        if (driverWithdrawalEnabled === "Yes" && driverWithdrawalAmount) {
          remaining -= Number(driverWithdrawalAmount);
        }
        if (cashGiven) {
          remaining -= Number(cashGiven);
        }
        return remaining.toFixed(2);
      })(),
    };
    try {
      const response = await fetch(SHEETDB_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [payload] }),
      });
      const result = await response.json();
      if (result.created || result.result === "success") {
        incrementApiQuota('save');
        alert("✅ Data saved to SheetDB successfully!");
      } else {
        alert("❌ Error: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      alert("❌ Failed to connect to SheetDB backend. Please check your network or SheetDB URL.");
      console.error("Save Error:", err);
    }
  }

  function addFuelEntry() {
    setFuelEntries([...fuelEntries, { id: Date.now(), value: "" }]);
  }
  function removeFuelEntry(id) {
    setFuelEntries(fuelEntries.filter((entry) => entry.id !== id));
  }
  function updateFuelEntry(id, value) {
    setFuelEntries(
      fuelEntries.map((entry) =>
        entry.id === id ? { ...entry, value } : entry
      )
    );
  }

  function addOtherExpense() {
    setOtherExpenses([
      ...otherExpenses,
      { id: Date.now(), label: "", value: "" },
    ]);
  }
  function removeOtherExpense(id) {
    setOtherExpenses(otherExpenses.filter((exp) => exp.id !== id));
  }
  function updateOtherExpense(id, field, value) {
    setOtherExpenses(
      otherExpenses.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    );
  }

  return (
    <div
      className={styles.pageBg + ' ' + styles.scrollSmooth}
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: '#f6f9fc',
        fontFamily: 'Sora, Inter, Poppins, sans-serif',
        overflow: 'hidden',
      }}
    >
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
      <div
        className={styles.formCard + ' ' + styles.totalFade + ' max-w-2xl mx-auto p-6 sm:p-8'}
        style={{
          position: 'relative',
          background: 'rgba(255,255,255,0.85)',
          borderRadius: 32,
          boxShadow: '0 12px 48px 0 rgba(30,42,120,0.18), 0 2px 12px 0 #1e3a8a22',
          margin: '48px auto',
          zIndex: 1,
          overflow: 'hidden',
        }}
      >
        {/* Gradient Ribbon/Header */}
        <div className="pb-4 border-b border-b-gray-200" style={{
          width: '100%',
          background: 'linear-gradient(90deg,#1e3a8a 0%,#fbbf24 100%)',
          padding: '1.2rem 2rem 1.2rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 24px #1e3a8a22',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 32, color: '#fff', filter: 'drop-shadow(0 2px 8px #1e3a8a88)' }}>🚕</span>
            <span style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: 1, fontFamily: 'Poppins, Inter, sans-serif', textShadow: '0 2px 8px #1e3a8a44' }}>Fleet Owner Trip Payment</span>
          </div>
          <div style={{ fontSize: 15, color: '#fbbf24', fontWeight: 600, marginTop: 4, letterSpacing: 1, textShadow: '0 1px 4px #1e3a8a44' }}>Maa Vaibhav Laxami Transport</div>
        </div>
        <div className={styles.subtitle + ' mb-6'} style={{ color: '#64748b', fontWeight: 500, fontSize: 16, margin: '1.5rem 0 1.5rem 0', textAlign: 'center' }}>
          <span style={{ fontWeight: 700, color: '#1e3a8a' }}>Professional dashboard for transport owner — trusted, simple, delightful.</span>
        </div>
        {/* Driver Selection */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}><span>👤</span>Driver Name</div>
          <select
            className={styles.select}
            value={driver.name}
            onChange={(e) =>
              setDriver(
                drivers.find((d) => d.name === e.target.value) || drivers[0]
              )
            }
          >
            {drivers.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.divider} style={{ borderBottom: '2px solid #e9f0ff', margin: '18px 0' }}></div>
        {/* KM Inputs */}
        <div className={styles.section}>
          <div className={styles.sectionHeader} style={{ color: '#1e2a78', fontWeight: 700, fontSize: 18, marginBottom: 6 }}><span>🚗</span>Trip Distance</div>
          <div className={styles.inputGroup} style={{ display: 'flex', gap: 18 }}>
            <div className={styles.inputField}>
              <span className={styles.inputIcon}>📍</span>
              <input
                type="number"
                className={styles.input}
                style={{
                  borderRadius: 14,
                  border: '1.5px solid #b2b7ff',
                  padding: 14,
                  fontSize: 17,
                  background: 'linear-gradient(90deg,#f6f9fc 60%,#e9f0ff 100%)',
                  color: '#1e2a78',
                  fontWeight: 600,
                  boxShadow: '0 1.5px 8px 0 #e9f0ff',
                  outline: 'none',
                }}
                value={startKm}
                placeholder="Start KM e.g. 12000 📍"
                onChange={(e) => setStartKm(e.target.value)}
              />
            </div>
            <div className={styles.inputField}>
              <span className={styles.inputIcon}>🏁</span>
              <input
                type="number"
                className={styles.input}
                style={{
                  borderRadius: 14,
                  border: '1.5px solid #b2b7ff',
                  padding: 14,
                  fontSize: 17,
                  background: 'linear-gradient(90deg,#f6f9fc 60%,#e9f0ff 100%)',
                  color: '#1e2a78',
                  fontWeight: 600,
                  boxShadow: '0 1.5px 8px 0 #e9f0ff',
                  outline: 'none',
                }}
                value={endKm}
                placeholder="End KM e.g. 12200 🏁"
                onChange={(e) => setEndKm(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className={styles.divider} style={{ borderBottom: '2px solid #e9f0ff', margin: '18px 0' }}></div>
        {/* Uber Deduction (Commission) - moved here after total KM driven */}
        <div style={{ marginBottom: 28, background: 'linear-gradient(90deg,#f6f9fc 60%,#e9f0ff 100%)', borderRadius: 14, boxShadow: '0 1.5px 8px 0 #e9f0ff', padding: 16 }}>
          <label style={{ fontWeight: 700, marginBottom: 8, display: 'block', fontSize: 16, color: '#374151' }}>
            Uber Deduction (Commission)?
          </label>
          <select
            style={{ width: '100%', borderRadius: 10, border: '1.5px solid #a5b4fc', padding: 12, fontSize: 16, background: '#f3f4f6', transition: 'border 0.2s, box-shadow 0.2s', boxShadow: '0 0 0 0 rgba(37,99,235,0)', outline: 'none' }}
            value={uberDeduction}
            onChange={(e) => setUberDeduction(e.target.value)}
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
          {uberDeduction === "Yes" && (
            <div style={{ marginTop: 8, color: '#2563eb', fontWeight: 700, fontSize: 16, textAlign: 'center', background: '#e0e7ff', borderRadius: 8, padding: 8 }}>
              🏦 Uber Commission Applied: ₹117.00
            </div>
          )}
        </div>
        {/* Trip Earnings */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ fontWeight: 700, marginBottom: 10, display: 'block', fontSize: 18, color: '#374151' }}>Trip Earnings</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {Object.keys(earnings).map((key) => (
              <div key={key} style={{ marginBottom: 10, flex: '1 1 160px' }}>
                <label style={{ marginRight: 8, textTransform: 'capitalize', fontWeight: 500 }}>{key}</label>
                <input
                  type="number"
                  style={{ borderRadius: 10, border: '1.5px solid #a5b4fc', padding: 12, width: 120, fontSize: 16, background: '#f3f4f6', transition: 'border 0.2s, box-shadow 0.2s', boxShadow: '0 0 0 0 rgba(37,99,235,0)', outline: 'none' }}
                  value={earnings[key]}
                  onChange={(e) =>
                    setEarnings({ ...earnings, [key]: e.target.value })
                  }
                />
              </div>
            ))}
          </div>
          {/* Show commissions after earnings input */}
          <div style={{ marginTop: 12, display: 'flex', gap: 16 }}>
            <div style={{ color: '#f43f5e', fontWeight: 700, fontSize: 16, background: '#fee2e2', borderRadius: 8, padding: 8 }}>
              🏦 Uber Commission: ₹{uberDeduction === "Yes" ? "117.00" : "0.00"}
            </div>
            {earnings.yatri && Number(earnings.yatri) > 0 && (
              <div style={{ color: '#f43f5e', fontWeight: 700, fontSize: 16, background: '#fee2e2', borderRadius: 8, padding: 8 }}>
                🛺 Yatri Commission: ₹{(Number(yatriTrips) * 10).toFixed(2)}
              </div>
            )}
          </div>
          {/* Show total earning after commission */}
          <div style={{ marginTop: 12, color: '#2563eb', fontWeight: 700, fontSize: 18, textAlign: 'center', background: '#e0e7ff', borderRadius: 8, padding: 8 }}>
            💰 Total Earning (after commission): ₹{(() => {
              const rawTotalEarn = Object.values(earnings).map((v) => Number(v) || 0).reduce((a, b) => a + b, 0);
              const uberComm = uberDeduction === "Yes" ? 117 : 0;
              const yatriComm = earnings.yatri && Number(earnings.yatri) > 0 && yatriTrips ? Number(yatriTrips) * 10 : 0;
              return (rawTotalEarn - uberComm - yatriComm).toFixed(2);
            })()}
          </div>
        </div>
        {/* Yatri Sathi Trips (show only if yatri earning is entered) */}
        {earnings.yatri && Number(earnings.yatri) > 0 && (
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontWeight: 700, marginBottom: 8, display: 'block', fontSize: 16, color: '#374151' }}>
              Number of Yatri Sathi Trips
            </label>
            <input
              type="number"
              style={{ width: '100%', borderRadius: 10, border: '1.5px solid #a5b4fc', padding: 12, fontSize: 16, background: '#f3f4f6', transition: 'border 0.2s, box-shadow 0.2s', boxShadow: '0 0 0 0 rgba(37,99,235,0)', outline: 'none' }}
              value={yatriTrips}
              onChange={(e) => setYatriTrips(e.target.value)}
            />
          </div>
        )}
        {/* Online Payment */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ fontWeight: 700, marginBottom: 8, display: 'block', fontSize: 16, color: '#374151' }}>Online Payment?</label>
          <select
            style={{ width: '100%', borderRadius: 10, border: '1.5px solid #a5b4fc', padding: 12, fontSize: 16, background: '#f3f4f6', transition: 'border 0.2s, box-shadow 0.2s', boxShadow: '0 0 0 0 rgba(37,99,235,0)', outline: 'none' }}
            value={onlinePayment}
            onChange={(e) => setOnlinePayment(e.target.value)}
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
          {onlinePayment === "Yes" && (
            <div style={{ marginTop: 12 }}>
              <label style={{ fontWeight: 700, marginBottom: 8, display: 'block', fontSize: 16, color: '#374151' }}>
                Total Online Payment
              </label>
              <input
                type="number"
                style={{ width: '100%', borderRadius: 10, border: '1.5px solid #a5b4fc', padding: 12, fontSize: 16, background: '#f3f4f6', transition: 'border 0.2s, box-shadow 0.2s', boxShadow: '0 0 0 0 rgba(37,99,235,0)', outline: 'none' }}
                value={onlineAmount}
                onChange={(e) => setOnlineAmount(e.target.value)}
              />
            </div>
          )}
        </div>
        {/* Cash Collected (now Total Cash) */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ fontWeight: 700, marginBottom: 10, display: 'block', fontSize: 18, color: '#374151' }}>Total Cash</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {Object.keys(cash).map((key) => (
              <div key={key} style={{ marginBottom: 10, flex: '1 1 160px' }}>
                <label style={{ marginRight: 8, textTransform: 'capitalize', fontWeight: 500 }}>{key}</label>
                <input
                  type="number"
                  style={{ borderRadius: 10, border: '1.5px solid #a5b4fc', padding: 12, width: 120, fontSize: 16, background: '#f3f4f6', transition: 'border 0.2s, box-shadow 0.2s', boxShadow: '0 0 0 0 rgba(37,99,235,0)', outline: 'none' }}
                  value={cash[key]}
                  onChange={(e) => setCash({ ...cash, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, color: '#2563eb', fontWeight: 700, fontSize: 18, textAlign: 'center', background: '#e0e7ff', borderRadius: 8, padding: 8 }}>
            💵 Total Cash: ₹{totalCashCollected.toFixed(2)}
          </div>
        </div>
        {/* Fuel/CNG/Petrol Cost */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ fontWeight: 700, marginBottom: 8, display: 'block', fontSize: 16, color: '#374151' }}>Fuel/CNG/Petrol Used?</label>
          <select
            style={{ width: '100%', borderRadius: 10, border: '1.5px solid #a5b4fc', padding: 12, fontSize: 16, background: '#f3f4f6', transition: 'border 0.2s, box-shadow 0.2s', boxShadow: '0 0 0 0 rgba(37,99,235,0)', outline: 'none' }}
            value={fuelEnabled}
            onChange={(e) => {
              setFuelEnabled(e.target.value);
              if (e.target.value === "Yes" && fuelEntries.length === 0) setFuelEntries([{ id: Date.now(), value: "" }]);
              if (e.target.value === "No") setFuelEntries([]);
            }}
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
          {fuelEnabled === "Yes" && (
            <div style={{ marginTop: 12 }}>
              <label style={{ fontWeight: 700, marginBottom: 8, display: 'block', fontSize: 16, color: '#374151' }}>Enter Fuel/CNG/Petrol Amounts</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                {fuelEntries.map((entry, idx) => (
                  <div key={entry.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                    <input
                      type="number"
                      style={{ borderRadius: 10, border: '1.5px solid #a5b4fc', padding: 12, width: 120, fontSize: 16, background: '#f3f4f6', transition: 'border 0.2s, box-shadow 0.2s', boxShadow: '0 0 0 0 rgba(37,99,235,0)', outline: 'none' }}
                      value={entry.value}
                      onChange={(e) => updateFuelEntry(entry.id, e.target.value)}
                      placeholder={`Entry ${idx + 1}`}
                    />
                    {fuelEntries.length > 1 && (
                      <button
                        type="button"
                        style={{ marginLeft: 8, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 15, padding: '4px 10px', borderRadius: 6, transition: 'background 0.2s' }}
                        onMouseOver={e => e.target.style.background = '#fee2e2'}
                        onMouseOut={e => e.target.style.background = 'none'}
                        onClick={() => removeFuelEntry(entry.id)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                style={{ marginTop: 8, padding: '8px 20px', background: 'linear-gradient(90deg,#22c55e,#16a34a)', color: '#fff', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16, boxShadow: '0 2px 8px rgba(34,197,94,0.08)', transition: 'background 0.2s' }}
                onMouseOver={e => e.target.style.background = '#16a34a'}
                onMouseOut={e => e.target.style.background = 'linear-gradient(90deg,#22c55e,#16a34a)'}
                onClick={addFuelEntry}
              >
                + Add Fuel Entry
              </button>
            </div>
          )}
          <div style={{ marginTop: 12, color: '#2563eb', fontWeight: 700, fontSize: 18, textAlign: 'center', background: '#e0e7ff', borderRadius: 8, padding: 8 }}>
            ⛽ Total Fuel Cost: ₹{totalFuel.toFixed(2)}
          </div>
        </div>
        {/* Driver Payment Withdrawal */}
        {(driver.name === "Vivek Bali" || driver.name === "Vikash Yadav") && (
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontWeight: 700, marginBottom: 8, display: 'block', fontSize: 16, color: '#374151' }}>Driver Payment Withdrawal?</label>
            <select
              style={{ width: '100%', borderRadius: 10, border: '1.5px solid #a5b4fc', padding: 12, fontSize: 16, background: '#f3f4f6', transition: 'border 0.2s, box-shadow 0.2s', boxShadow: '0 0 0 0 rgba(37,99,235,0)', outline: 'none' }}
              value={driverWithdrawalEnabled}
              onChange={(e) => setDriverWithdrawalEnabled(e.target.value)}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
            {driverWithdrawalEnabled === "Yes" && (
              <div style={{ marginTop: 12 }}>
                <label style={{ fontWeight: 700, marginBottom: 8, display: 'block', fontSize: 16, color: '#374151' }}>Withdrawal Amount</label>
                <input
                  type="number"
                  style={{ width: '100%', borderRadius: 10, border: '1.5px solid #a5b4fc', padding: 12, fontSize: 16, background: '#f3f4f6', transition: 'border 0.2s, box-shadow 0.2s', boxShadow: '0 0 0 0 rgba(37,99,235,0)', outline: 'none' }}
                  value={driverWithdrawalAmount}
                  onChange={(e) => setDriverWithdrawalAmount(e.target.value)}
                  placeholder="Enter withdrawal amount"
                />
              </div>
            )}
          </div>
        )}
        {/* Other Expenses */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ fontWeight: 700, marginBottom: 8, display: 'block', fontSize: 16, color: '#374151' }}>Other Expenses?</label>
          <select
            style={{ width: '100%', borderRadius: 10, border: '1.5px solid #a5b4fc', padding: 12, fontSize: 16, background: '#f3f4f6', transition: 'border 0.2s, box-shadow 0.2s', boxShadow: '0 0 0 0 rgba(37,99,235,0)', outline: 'none' }}
            value={otherExpensesEnabled}
            onChange={(e) => setOtherExpensesEnabled(e.target.value)}
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
          {otherExpensesEnabled === "Yes" && (
            <div style={{ marginTop: 12 }}>
              {otherExpenses.map((exp, idx) => (
                <div key={exp.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                  <input
                    type="text"
                    style={{ borderRadius: 10, border: '1.5px solid #a5b4fc', padding: 12, width: 120, marginRight: 8, fontSize: 16, background: '#f3f4f6', transition: 'border 0.2s, box-shadow 0.2s', boxShadow: '0 0 0 0 rgba(37,99,235,0)', outline: 'none' }}
                    value={exp.label}
                    onChange={(e) =>
                      updateOtherExpense(exp.id, "label", e.target.value)
                    }
                    placeholder="Label"
                  />
                  <input
                    type="number"
                    style={{ borderRadius: 10, border: '1.5px solid #a5b4fc', padding: 12, width: 120, fontSize: 16, background: '#f3f4f6', transition: 'border 0.2s, box-shadow 0.2s', boxShadow: '0 0 0 0 rgba(37,99,235,0)', outline: 'none' }}
                    value={exp.value}
                    onChange={(e) =>
                      updateOtherExpense(exp.id, "value", e.target.value)
                    }
                    placeholder="Amount"
                  />
                  <button
                    type="button"
                    style={{ marginLeft: 8, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 15, padding: '4px 10px', borderRadius: 6, transition: 'background 0.2s' }}
                    onMouseOver={e => e.target.style.background = '#fee2e2'}
                    onMouseOut={e => e.target.style.background = 'none'}
                    onClick={() => removeOtherExpense(exp.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                style={{ marginTop: 8, padding: '8px 20px', background: 'linear-gradient(90deg,#22c55e,#16a34a)', color: '#fff', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16, boxShadow: '0 2px 8px rgba(34,197,94,0.08)', transition: 'background 0.2s' }}
                onMouseOver={e => e.target.style.background = '#16a34a'}
                onMouseOut={e => e.target.style.background = 'linear-gradient(90deg,#22c55e,#16a34a)'}
                onClick={addOtherExpense}
              >
                + Add Expense
              </button>
              <div style={{ marginTop: 12, color: '#2563eb', fontWeight: 700, fontSize: 18, textAlign: 'center', background: '#e0e7ff', borderRadius: 8, padding: 8 }}>
                🧾 Total Other Expenses: ₹{totalOtherExpenses.toFixed(2)}
              </div>
            </div>
          )}
        </div>
        {/* Cash Given to Accountant */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ fontWeight: 700, marginBottom: 8, display: 'block', fontSize: 16, color: '#374151' }}>
            Cash Given to Accountant (₹)
          </label>
          <input
            type="number"
            style={{ width: '100%', borderRadius: 10, border: '1.5px solid #a5b4fc', padding: 12, fontSize: 16, background: '#f3f4f6', transition: 'border 0.2s, box-shadow 0.2s', boxShadow: '0 0 0 0 rgba(37,99,235,0)', outline: 'none' }}
            value={cashGiven}
            onChange={(e) => setCashGiven(e.target.value)}
          />
        </div>
        {/* Buttons */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 32, justifyContent: 'center' }}>
          <button
            type="button"
            style={{ padding: '14px 32px', background: 'linear-gradient(90deg,#2563eb,#1d4ed8)', color: '#fff', borderRadius: 12, border: 'none', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.08)', transition: 'background 0.2s' }}
            onMouseOver={e => e.target.style.background = '#1d4ed8'}
            onMouseOut={e => e.target.style.background = 'linear-gradient(90deg,#2563eb,#1d4ed8)'}
            onClick={handleCalculate}
          >
            Calculate Payment
          </button>
          {showSummary && (
            <>
              <button
                type="button"
                style={{ padding: '14px 32px', background: 'linear-gradient(90deg,#22c55e,#16a34a)', color: '#fff', borderRadius: 12, border: 'none', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px rgba(34,197,94,0.08)', transition: 'background 0.2s' }}
                onMouseOver={e => e.target.style.background = '#16a34a'}
                onMouseOut={e => e.target.style.background = 'linear-gradient(90deg,#22c55e,#16a34a)'}
                onClick={handleSendWhatsApp}
              >
                Send to WhatsApp
              </button>
              <button
                type="button"
                style={{ padding: '14px 32px', background: 'linear-gradient(90deg,#6b7280,#374151)', color: '#fff', borderRadius: 12, border: 'none', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px rgba(107,114,128,0.08)', transition: 'background 0.2s' }}
                onMouseOver={e => e.target.style.background = '#374151'}
                onMouseOut={e => e.target.style.background = 'linear-gradient(90deg,#6b7280,#374151)'}
                onClick={handleSaveSheetDB}
              >
                Save to Google Sheet
              </button>
            </>
          )}
        </div>
        {/* Output Summary */}
        {showSummary && (
          <div style={{
            background: 'linear-gradient(135deg,#e9f0ff 0%,#f6f9fc 100%)',
            borderRadius: 24,
            padding: 36,
            marginTop: 36,
            fontFamily: 'Sora, Inter, Poppins, sans-serif',
            fontSize: 18,
            color: '#1e2a78',
            boxShadow: '0 8px 32px 0 rgba(30,42,120,0.10), 0 1.5px 8px 0 #e9f0ff',
            maxWidth: 650,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#2563eb', letterSpacing: 1 }}>Trip Summary</span>
              <span style={{ display: 'block', fontSize: 15, color: '#6b7280', marginTop: 4 }}>({new Date().toLocaleDateString('en-GB')})</span>
            </div>
            <div style={{ display: 'grid', rowGap: 14 }}>
              <div><span style={{ fontWeight: 600 }}>🧑‍💼 Cash Given to Accountant:</span> <span style={{ fontWeight: 700, color: '#f43f5e' }}>₹{Number(cashGiven).toFixed(2)}</span></div>
              <div><span style={{ fontWeight: 600, color: '#374151' }}>👤 Driver:</span> <span style={{ fontWeight: 700, color: '#2563eb' }}>{driver.name}</span></div>
              <div><span style={{ fontWeight: 600 }}>🚗 Km Driven:</span> <span style={{ fontWeight: 700, color: '#22c55e' }}>{totalKm}</span></div>
              <div><span style={{ fontWeight: 600 }}>💰 Earnings:</span> <span style={{ fontWeight: 700, color: '#2563eb' }}>₹{(() => {
                // Earning calculation is same for everyone
                const rawTotalEarn = Object.values(earnings).map((v) => Number(v) || 0).reduce((a, b) => a + b, 0);
                const uberComm = uberDeduction === "Yes" ? 117 : 0;
                const yatriComm = Number(yatriTrips) * 10;
                return (rawTotalEarn - uberComm - yatriComm).toFixed(2);
              })()}</span></div>
              <div style={{ fontWeight: 600 }}>💳 Online Payment: <span style={{ fontWeight: 700, color: '#2563eb' }}>₹{Number(onlineAmount).toFixed(2)}</span></div>
              <div style={{ marginLeft: 18, fontSize: 15, color: '#6b7280' }}>
                {Object.entries(earnings).filter(([_, v]) => v).map(([k, v]) => (
                  <span key={k} style={{ marginRight: 12 }}>{k.charAt(0).toUpperCase() + k.slice(1)}: <span style={{ color: '#374151', fontWeight: 600 }}>₹{Number(v).toFixed(2)}</span></span>
                ))}
              </div>
              <div><span style={{ fontWeight: 600 }}>💵 Total Cash:</span> <span style={{ fontWeight: 700, color: '#2563eb' }}>₹{calculatedCashCollection.toFixed(2)}</span></div>
              <div style={{ marginLeft: 18, fontSize: 15, color: '#6b7280' }}>
                {Object.entries(cash).filter(([_, v]) => v).map(([k, v]) => (
                  <span key={k} style={{ marginRight: 12 }}>{k.charAt(0).toUpperCase() + k.slice(1)}: <span style={{ color: '#374151', fontWeight: 600 }}>₹{Number(v).toFixed(2)}</span></span>
                ))}
              </div>
              <div style={{ marginLeft: 18, fontSize: 15, color: '#374151', fontWeight: 600 }}>
                {(() => {
                  // Show calculation formula for Total Cash
                  let formula = "";
                  if (driver.name === "Vikash Yadav") {
                    formula = `(${cash.uber || 0} + ${cash.indrive || 0} + ${cash.yatri || 0} + ${cash.rapido || 0} + ${cash.offline || 0} - ${totalFuel} - ${onlineAmount || 0} + ${(uberDeduction === "Yes" ? 117 : 0)})`;
                  } else {
                    const rawTotalEarn = Object.values(earnings).map((v) => Number(v) || 0).reduce((a, b) => a + b, 0);
                    const uberComm = uberDeduction === "Yes" ? 117 : 0;
                    const yatriComm = Number(yatriTrips) * 10;
                    const totalEarn = rawTotalEarn - uberComm - yatriComm;
                    const driverPay = Math.round(totalEarn * driver.percent * 100) / 100;
                    formula = `(${cash.uber || 0} + ${cash.yatri || 0} + ${cash.indrive || 0} + ${cash.offline || 0} + ${cash.rapido || 0}` +
                      ` - ${totalFuel} - ${onlineAmount || 0} - ${driverPay.toFixed(2)} - ${totalOtherExpenses})`;
                  }
                  return <span>Formula: <span style={{ color: '#2563eb' }}>{formula}</span></span>;
                })()}
              </div>
              <div><span style={{ fontWeight: 600 }}>⛽ Fuel/CNG Cost:</span> <span style={{ fontWeight: 700, color: '#f59e42' }}>₹{totalFuel.toFixed(2)}</span></div>
              <div><span style={{ fontWeight: 600 }}>🏦 Uber Deduction:</span> <span style={{ fontWeight: 700, color: '#f43f5e' }}>₹{uberDeduction === "Yes" ? "117.00" : "0.00"}</span></div>
              <div><span style={{ fontWeight: 600 }}>🛺 Yatri Commission:</span> <span style={{ fontWeight: 700, color: '#f43f5e' }}>₹{(Number(yatriTrips) * 10).toFixed(2)}</span></div>
              <div><span style={{ fontWeight: 600 }}>🧾 Other Expenses:</span> <span style={{ fontWeight: 700, color: '#f43f5e' }}>₹{totalOtherExpenses.toFixed(2)}</span></div>
              <div><span style={{ fontWeight: 600 }}>👨‍✈️ Driver Pay:</span> <span style={{ fontWeight: 700, color: '#22c55e' }}>₹{(() => {
                let pay = 0;
                const rawTotalEarn = Object.values(earnings).map((v) => Number(v) || 0).reduce((a, b) => a + b, 0);
                const uberComm = uberDeduction === "Yes" ? 117 : 0;
                const yatriComm = Number(yatriTrips) * 10;
                const totalEarn = rawTotalEarn - uberComm - yatriComm;
                if (driver.name === "Vikash Yadav") {
                  pay = (totalEarn - totalFuel) / 2;
                } else {
                  pay = totalEarn * driver.percent;
                }
                if (driverWithdrawalEnabled === "Yes" && driverWithdrawalAmount) {
                  pay = pay - Number(driverWithdrawalAmount);
                }
                return pay.toFixed(2);
              })()}</span></div>
              {(driverWithdrawalEnabled === "Yes" && driverWithdrawalAmount) && (
                <div><span style={{ fontWeight: 600 }}>💳 Paid to Driver:</span> <span style={{ fontWeight: 700, color: '#22c55e' }}>₹{Number(driverWithdrawalAmount).toFixed(2)}</span></div>
              )}
              <div><span style={{ fontWeight: 600 }}>💸 Remaining:</span> <span style={{ fontWeight: 700, color: '#f43f5e' }}>₹{(() => {
                let remaining = calculatedCashCollection;
                if (driverWithdrawalEnabled === "Yes" && driverWithdrawalAmount) {
                  remaining = calculatedCashCollection - (cashGiven ? Number(cashGiven) : 0) - Number(driverWithdrawalAmount);
                } else {
                  remaining = calculatedCashCollection - (cashGiven ? Number(cashGiven) : 0);
                }
                return remaining.toFixed(2);
              })()}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
