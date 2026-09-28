"use client";

import React, { useState } from "react";
import { useReality } from "@/context/RealityThemeContext";

export default function SuteraFooter() {
  const { reality } = useReality();
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("stella@sutera.ch");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="contact" className="relative pt-16 pb-12 px-4 md:px-8 border-t transition-colors duration-400 bg-[var(--card-bg)]" style={{ borderColor: "var(--border-color)" }}>
      {/* Top Coordinate Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 font-mono text-[10px] uppercase tracking-widest opacity-60 mb-12 pb-4 border-b" style={{ borderColor: "var(--border-light)" }}>
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>CURRENTLY IN ZURICH, SWITZERLAND</span>
        </div>
        <div>
          <span>COORDINATES: 47.3769° N, 8.5417° E</span>
        </div>
      </div>

      {/* Main Transmission & Links */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-16">
        <div className="md:col-span-7">
          <div className="font-mono text-xs uppercase tracking-widest opacity-60 mb-2">
            DIRECT TRANSMISSION // REACH OUT
          </div>
          <h2 className="font-reality text-4xl sm:text-6xl md:text-7xl leading-none mb-6">
            Let’s shape reality together.
          </h2>

          <div className="flex items-center gap-3 flex-wrap font-mono text-xs">
            <button
              onClick={handleCopyEmail}
              data-cursor="COPY EMAIL"
              className="border px-4 py-2 uppercase font-medium transition-all hover:bg-[var(--accent-color)] hover:text-[var(--bg-color)] active:scale-95"
              style={{ borderColor: "var(--border-color)" }}
            >
              {copied ? "COPIED TO CLIPBOARD! ✓" : "COPY: stella@sutera.ch [⎘]"}
            </button>
            <a
              href="mailto:stella@sutera.ch"
              data-cursor="OPEN MAIL"
              className="border px-4 py-2 uppercase opacity-80 hover:opacity-100 transition-opacity"
              style={{ borderColor: "var(--border-light)" }}
            >
              Open Mail Client ↗
            </a>
          </div>
        </div>

        {/* Channels */}
        <div className="md:col-span-5 flex flex-col justify-between h-full">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest opacity-60 mb-3">
              EXTERNAL CHANNELS
            </div>
            <div className="flex flex-col gap-2 font-mono text-xs uppercase">
              <a
                href="https://www.linkedin.com/in/stellamuehlhaus/"
                target="_blank"
                rel="noreferrer"
                data-cursor="LINKEDIN"
                className="py-1 border-b flex justify-between items-center hover:text-[var(--accent-color)] transition-colors"
                style={{ borderColor: "var(--border-light)" }}
              >
                <span>LinkedIn Profile</span>
                <span>↗</span>
              </a>
              <a
                href="https://medium.com/@sutera."
                target="_blank"
                rel="noreferrer"
                data-cursor="MEDIUM"
                className="py-1 border-b flex justify-between items-center hover:text-[var(--accent-color)] transition-colors"
                style={{ borderColor: "var(--border-light)" }}
              >
                <span>Medium Publications</span>
                <span>↗</span>
              </a>
              <a
                href="https://www.instagram.com/stellamuehlhaus/"
                target="_blank"
                rel="noreferrer"
                data-cursor="INSTAGRAM"
                className="py-1 border-b flex justify-between items-center hover:text-[var(--accent-color)] transition-colors"
                style={{ borderColor: "var(--border-light)" }}
              >
                <span>Instagram Archive</span>
                <span>↗</span>
              </a>
            </div>
          </div>

          <div className="mt-8 pt-4">
            <button
              onClick={scrollToTop}
              data-cursor="WARP TO TOP"
              className="font-mono text-xs uppercase tracking-widest border px-3 py-1.5 hover:bg-current hover:text-[var(--bg-color)] transition-all flex items-center gap-2"
              style={{ borderColor: "var(--border-color)" }}
            >
              <span>RETURN TO TOP</span>
              <span>[↑]</span>
            </button>
          </div>
        </div>
      </div>

      {/* Colophon & Status Bottom Bar */}
      <div className="pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-3 font-mono text-[10px] opacity-60 uppercase" style={{ borderColor: "var(--border-light)" }}>
        <div>
          SUTÉRA 2025/2026 // REALITY BY DESIGN
        </div>
        <div>
          ORIGINALLY DESIGNED BY OKEY STUDIO • INSPIRED REMAKE
        </div>
      </div>
    </footer>
  );
}
