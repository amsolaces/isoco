"use client";

import React, { useEffect, useState } from "react";
import { useReality } from "@/context/RealityThemeContext";

export default function DripegoLoader() {
  const { reality } = useReality();
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const hasLoaded = sessionStorage.getItem("dripego-loaded");
    if (hasLoaded) {
      setIsFinished(true);
      setHidden(true);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsFinished(true);
            sessionStorage.setItem("dripego-loaded", "true");
            setTimeout(() => setHidden(true), 600);
          }, 250);
          return 100;
        }
        const increment = Math.max(1, Math.floor(Math.random() * 14) + 2);
        return Math.min(100, prev + increment);
      });
    }, 45);

    return () => clearInterval(interval);
  }, []);

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[100000] flex flex-col justify-between p-6 md:p-12 transition-all duration-700 select-none bg-[var(--bg-color)] text-[var(--text-primary)] ${
        isFinished ? "opacity-0 pointer-events-none -translate-y-full" : "opacity-100"
      }`}
    >
      {/* Top Bar */}
      <div className="flex justify-between items-center font-mono text-xs uppercase tracking-widest opacity-60">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          <span>DRIPEGO ATELIER</span>
        </div>
        <div>DROP 001 CALIBRATION // 2025-2026</div>
      </div>

      {/* Center Branding & Meaning */}
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="font-reality text-6xl sm:text-8xl md:text-9xl tracking-tight mb-2">
          DRIPEGO
        </h1>
        <div className="font-mono text-xs md:text-sm uppercase tracking-widest opacity-70 mb-4">
          Presence, By Design
        </div>
        <p className="font-mono text-[11px] opacity-50 max-w-xs">
          drip (style / presence) + ego (identity) → unapologetic sovereignty
        </p>
      </div>

      {/* Bottom Progress Bar & Counter */}
      <div className="w-full max-w-md mx-auto">
        <div className="flex justify-between items-center font-mono text-xs uppercase mb-2">
          <span className="opacity-60">CALIBRATING FABRIC TENSION</span>
          <span className="font-bold">{progress}%</span>
        </div>
        <div className="w-full h-1.5 border p-[1px]" style={{ borderColor: "var(--border-color)" }}>
          <div
            className="h-full bg-[var(--accent-color)] transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
