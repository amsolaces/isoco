"use client";

import React, { useEffect, useState } from "react";
import { useReality } from "@/context/RealityThemeContext";

export default function SuteraHeader() {
  const { reality, cycleReality, realityLabel, realityIndex } = useReality();
  const [zurichTime, setZurichTime] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format time in Zurich (Europe/Zurich) timezone
      const formatted = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Zurich",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now);
      setZurichTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-4 md:px-8 py-3.5 flex justify-between items-center transition-colors duration-400 bg-opacity-70 backdrop-blur-md">
      {/* Brand Mark */}
      <div className="flex items-center gap-3">
        <a
          href="#"
          data-cursor="HOME"
          className="group flex items-baseline gap-2.5 text-inherit no-underline"
        >
          <span className="font-reality text-2xl md:text-3xl tracking-tight font-medium">
            Sutéra
          </span>
          <span className="text-[10px] font-mono tracking-widest uppercase opacity-60 hidden sm:inline-block">
            Reality By Design
          </span>
        </a>
      </div>

      {/* Center: Change Reality Interactive Switcher */}
      <div className="flex items-center">
        <button
          onClick={cycleReality}
          data-cursor="CYCLE REALITY"
          className="group relative flex items-center gap-2 border px-3 py-1.5 text-xs font-mono tracking-wider uppercase transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
          style={{
            borderColor: "var(--border-color)",
            backgroundColor: "var(--card-bg)",
            color: "var(--text-primary)",
          }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse-subtle bg-current opacity-80" />
          <span className="font-medium">Change Reality</span>
          <span className="text-[10px] opacity-60 border-l pl-2 ml-1" style={{ borderColor: "var(--border-color)" }}>
            {realityIndex}
          </span>
        </button>
      </div>

      {/* Right: Local Zurich Time & Telemetry */}
      <div className="flex items-center gap-6">
        <div className="hidden sm:flex flex-col text-right leading-tight font-mono text-[11px]">
          <span className="text-[9px] uppercase tracking-widest opacity-50">Local Time</span>
          <span className="font-medium flex items-center justify-end gap-1.5">
            <span className="opacity-70">ZUR</span>
            <span>{zurichTime || "--:--:--"}</span>
          </span>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-1.5 border text-xs font-mono uppercase"
          style={{ borderColor: "var(--border-color)" }}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div
          className="absolute top-full left-0 w-full border-b p-6 flex flex-col gap-4 font-mono text-xs uppercase bg-[var(--card-bg)] backdrop-blur-xl md:hidden"
          style={{ borderColor: "var(--border-color)" }}
        >
          <a
            href="#threads"
            onClick={() => setMenuOpen(false)}
            className="py-1 border-b border-dashed"
            style={{ borderColor: "var(--border-light)" }}
          >
            01. Core Threads
          </a>
          <a
            href="#manifesto"
            onClick={() => setMenuOpen(false)}
            className="py-1 border-b border-dashed"
            style={{ borderColor: "var(--border-light)" }}
          >
            02. Manifesto
          </a>
          <a
            href="#projects"
            onClick={() => setMenuOpen(false)}
            className="py-1 border-b border-dashed"
            style={{ borderColor: "var(--border-light)" }}
          >
            03. Selected Projects
          </a>
          <a
            href="#lectures"
            onClick={() => setMenuOpen(false)}
            className="py-1 border-b border-dashed"
            style={{ borderColor: "var(--border-light)" }}
          >
            04. Lectures & Writing
          </a>
          <a
            href="#contact"
            onClick={() => setMenuOpen(false)}
            className="py-1"
          >
            05. Transmit / Contact
          </a>
        </div>
      )}
    </header>
  );
}
