import React, { useState, useEffect } from "react";
import styles from "./Navbar.module.css";

const navLinks = [
  { name: "Dashboard", href: "/", icon: "🧾" },
  { name: "Report", href: "/report", icon: "📊" },
  { name: "Cash", href: "/cash", icon: "🔓" },
];


export default function Navbar({ onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState(() => {
    const path = window.location.pathname;
    if (path === "/report") return "Report";
    if (path === "/cash") return "Cash";
    return "Dashboard";
  });

  useEffect(() => {
    const syncActive = () => {
      const path = window.location.pathname;
      if (path === "/report") setActive("Report");
      else if (path === "/cash") setActive("Cash");
      else setActive("Dashboard");
    };
    window.addEventListener("popstate", syncActive);
    return () => window.removeEventListener("popstate", syncActive);
  }, []);

  const handleNavClick = (name, href) => {
    setActive(name);
    setMenuOpen(false);
    if (onNavigate) onNavigate(href);
  };

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        background: 'linear-gradient(90deg,rgba(24,24,27,0.85) 60%,rgba(30,41,59,0.85) 100%)',
        boxShadow: '0 8px 32px 0 rgba(30,42,120,0.18)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1.5px solid rgba(251,191,36,0.08)',
        transition: 'background 0.4s, box-shadow 0.3s',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'flex-start',
          height: 80,
          padding: '0 2rem',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 90 }}>
          <span style={{ fontFamily: 'Poppins, Inter, sans-serif', fontWeight: 800, fontSize: 28, color: '#fff', letterSpacing: 2, textShadow: '0 2px 12px #000, 0 1px 0 #fff', cursor: 'pointer', lineHeight: 1 }}>MVLT</span>
          <span style={{ fontFamily: 'Poppins, Inter, sans-serif', fontWeight: 600, fontSize: 13, color: '#fbbf24', letterSpacing: 1, marginTop: 2, textShadow: '0 1px 4px #1e3a8a44', lineHeight: 1 }}>Maa Vaibhav Laxami Transport</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 24 }}>
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              style={{
                position: 'relative',
                fontFamily: 'Inter, Poppins, sans-serif',
                color: active === link.name ? '#fbbf24' : '#e0e7ff',
                fontWeight: 600,
                fontSize: 17,
                textDecoration: 'none',
                padding: '0.5rem 1.2rem',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
                boxShadow: active === link.name ? '0 2px 12px #fbbf2422' : 'none',
                transition: 'color 0.3s, font-weight 0.2s, transform 0.2s, background 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                overflow: 'hidden',
              }}
              onMouseOver={e => {
                e.target.style.color = '#fbbf24';
                e.target.style.boxShadow = '0 2px 12px #fbbf2422';
              }}
              onMouseOut={e => {
                e.target.style.color = active === link.name ? '#fbbf24' : '#e0e7ff';
                e.target.style.boxShadow = active === link.name ? '0 2px 12px #fbbf2422' : 'none';
              }}
              onClick={e => { e.preventDefault(); handleNavClick(link.name, link.href); }}
            >
              <span style={{ fontSize: 20 }}>{link.icon}</span>
              <span>{link.name}</span>
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  bottom: 0,
                  width: active === link.name ? '100%' : 0,
                  height: 3,
                  background: 'linear-gradient(90deg,#fbbf24 0%,#1e3a8a 100%)',
                  borderRadius: 2,
                  transition: 'width 0.3s',
                  boxShadow: active === link.name ? '0 2px 8px #fbbf2422' : 'none',
                }}
              />
            </a>
          ))}
        </div>
        {/* Hamburger for mobile */}
        <button
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginLeft: 16,
            zIndex: 101,
          }}
          aria-label="Menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <div style={{ width: 28, height: 3, background: '#fff', margin: '6px 0', borderRadius: 2, transition: 'background 0.3s' }}></div>
          <div style={{ width: 28, height: 3, background: '#fff', margin: '6px 0', borderRadius: 2, transition: 'background 0.3s' }}></div>
          <div style={{ width: 28, height: 3, background: '#fff', margin: '6px 0', borderRadius: 2, transition: 'background 0.3s' }}></div>
        </button>
      </div>
      {/* Mobile menu (hidden for now, can be implemented with media queries) */}
    </nav>
  );
}
