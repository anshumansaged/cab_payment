import React from "react";
import { FaRobot, FaChartLine, FaMoneyCheckAlt } from "react-icons/fa";

// If using Tailwind, ensure it's set up in your project. Otherwise, replace className with style objects.

export default function Homepage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f9fc] to-[#e9f0ff] font-sora flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 md:px-16 md:py-5 bg-white/60 backdrop-blur-xl rounded-b-3xl border-b border-[#e9f0ff] shadow-[0_4px_32px_0_rgba(97,89,236,0.06)]" style={{
        boxShadow: '0 8px 32px 0 rgba(97,89,236,0.08), 0 1.5px 8px 0 #e9f0ff',
      }}>
        <div className="flex items-center gap-3">
          <span className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#6159ec] to-[#1e2a78] bg-clip-text text-transparent drop-shadow-lg flex items-center gap-2">
            <span className="inline-block text-[#ef476f]">🚖</span> MVLT
          </span>
        </div>
        <div className="hidden md:flex gap-10 text-[#1e2a78] font-semibold text-lg">
          <a href="#services" className="hover:text-[#6159ec] transition-colors duration-150 px-2 py-1 rounded-lg hover:bg-[#f6f9fc]">Services</a>
          <a href="#reports" className="hover:text-[#6159ec] transition-colors duration-150 px-2 py-1 rounded-lg hover:bg-[#f6f9fc]">Reports</a>
          <a href="#contact" className="hover:text-[#6159ec] transition-colors duration-150 px-2 py-1 rounded-lg hover:bg-[#f6f9fc]">Contact</a>
        </div>
        <a
          href="#contact"
          className="ml-4 px-7 py-2.5 rounded-full bg-gradient-to-r from-[#ef476f] via-[#ff6a88] to-[#6159ec] text-white font-extrabold shadow-lg hover:shadow-pink-200/60 hover:scale-105 transition-all duration-200 text-lg border-2 border-[#fff] focus:outline-none focus:ring-4 focus:ring-[#ef476f]/30"
          style={{
            boxShadow: '0 4px 24px 0 #ef476f33',
            textShadow: '0 2px 8px #ef476f22',
          }}
        >
          Talk to us
        </a>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between flex-1 px-6 md:px-20 py-12 md:py-24 gap-10 md:gap-0">
        {/* Left: Text */}
        <div className="flex-1 flex flex-col items-start justify-center max-w-xl">
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#1e2a78] leading-tight mb-6 drop-shadow-lg">
            Modern Payments for <span className="text-[#6159ec]">Fleet Owners</span>
          </h1>
          <p className="text-lg md:text-2xl text-[#374151] font-light mb-8">
            Calculate and manage daily driver payouts, cash flow, and profit—instantly.
          </p>
          <a
            href="/form"
            className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-[#6159ec] to-[#ef476f] text-white font-bold text-xl shadow-lg hover:shadow-[#ef476f]/40 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#ef476f]/30 animate-bounce"
          >
            Get Started
          </a>
          <div className="flex gap-6 mt-8">
            <div className="flex items-center gap-2 bg-white rounded-xl shadow-md px-4 py-2">
              <FaChartLine className="text-[#6159ec] text-2xl" />
              <span className="font-semibold text-[#1e2a78]">Reports</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-xl shadow-md px-4 py-2">
              <FaMoneyCheckAlt className="text-[#ef476f] text-2xl" />
              <span className="font-semibold text-[#1e2a78]">Instant Payouts</span>
            </div>
          </div>
        </div>
        {/* Right: Illustration */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-[320px] h-[320px] md:w-[400px] md:h-[400px] flex items-center justify-center">
            {/* Futuristic robot icon with animated glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#6159ec]/30 to-[#ef476f]/20 blur-2xl animate-pulse"></div>
            <FaRobot className="relative text-[180px] md:text-[220px] text-[#6159ec] drop-shadow-2xl animate-float" />
          </div>
        </div>
      </section>

      {/* Responsive nav for mobile */}
      <div className="md:hidden flex justify-center gap-8 pb-4 text-[#1e2a78] font-medium text-lg bg-white/80 rounded-t-2xl shadow-inner">
        <a href="#services" className="hover:text-[#6159ec] transition">Services</a>
        <a href="#reports" className="hover:text-[#6159ec] transition">Reports</a>
        <a href="#contact" className="hover:text-[#6159ec] transition">Contact</a>
      </div>
    </div>
  );
}

// Tailwind custom animation (add to tailwind.config.js):
// theme: { extend: { keyframes: { float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-16px)' } } }, animation: { float: 'float 3s ease-in-out infinite' } } }
// fontFamily: { sora: ['Sora', 'Inter', 'Poppins', 'sans-serif'] }
