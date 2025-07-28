import React from "react";
import FleetOwnerTripPaymentForm from "./FleetOwnerTripPaymentForm";
import Navbar from "./Navbar";
import Report from "./Report";
import CashManager from "./CashManager";

function App() {
  const [route, setRoute] = React.useState(window.location.pathname);
  React.useEffect(() => {
    const onPopState = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleNav = (path) => {
    window.history.pushState({}, '', path);
    setRoute(path);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8fafc",
      fontFamily: "'Inter', sans-serif"
    }}>
      <Navbar onNavigate={handleNav} />
      <main style={{
        maxWidth: "900px",
        margin: "2rem auto",
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        padding: "2.5rem 2rem",
        display: "flex",
        flexDirection: "column",
        gap: "2rem"
      }}>
        {route === "/report" ? <Report /> : route === "/cash" ? <CashManager /> : <FleetOwnerTripPaymentForm />}
      </main>
    </div>
  );
}

export default App;
