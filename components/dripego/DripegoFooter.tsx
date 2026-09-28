"use client";

import React, { useState } from "react";
import { useReality } from "@/context/RealityThemeContext";

export default function DripegoFooter() {
  const { reality } = useReality();
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("concierge@dripego.com");
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
          <span>ATELIER: ZURICH / PARIS / TOKYO</span>
        </div>
        <div>
          <span>COORDINATES: 47.3769° N, 8.5417° E</span>
        </div>
      </div>

      {/* Main Transmission & Links */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-16">
        <div className="md:col-span-7">
          <div className="font-mono text-xs uppercase tracking-widest opacity-60 mb-2">
            DIRECT TRANSMISSION // CONCIERGE
          </div>
          <h2 className="font-reality text-4xl sm:text-6xl md:text-7xl leading-none mb-6">
            Own the room.
            <br />
            Demand nothing less.
          </h2>

          <div className="flex items-center gap-3 flex-wrap font-mono text-xs">
            <button
              onClick={handleCopyEmail}
              data-cursor="COPY CONCIERGE"
              className="border px-4 py-2 uppercase font-medium transition-all hover:bg-[var(--accent-color)] hover:text-[var(--bg-color)] active:scale-95"
              style={{ borderColor: "var(--border-color)" }}
            >
              {copied ? "COPIED TO CLIPBOARD! ✓" : "COPY: concierge@dripego.com [⎘]"}
            </button>
            <a
              href="mailto:concierge@dripego.com"
              data-cursor="OPEN MAIL"
              className="border px-4 py-2 uppercase opacity-80 hover:opacity-100 transition-opacity"
              style={{ borderColor: "var(--border-light)" }}
            >
              Open Direct Inquiries ↗
            </a>
          </div>
        </div>

        {/* Channels */}
        <div className="md:col-span-5 flex flex-col justify-between h-full">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest opacity-60 mb-3">
              ATELIER CHANNELS
            </div>
            <div className="flex flex-col gap-2 font-mono text-xs uppercase">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                data-cursor="INSTAGRAM"
                className="py-1 border-b flex justify-between items-center hover:text-[var(--accent-color)] transition-colors"
                style={{ borderColor: "var(--border-light)" }}
              >
                <span>Instagram Lookbook</span>
                <span>↗</span>
              </a>
              <a
                href="#archive"
                data-cursor="ARCHIVE"
                className="py-1 border-b flex justify-between items-center hover:text-[var(--accent-color)] transition-colors"
                style={{ borderColor: "var(--border-light)" }}
              >
                <span>Drop 001 Register</span>
                <span>↗</span>
              </a>
              <a
                href="#waitlist"
                data-cursor="VAULT"
                className="py-1 border-b flex justify-between items-center hover:text-[var(--accent-color)] transition-colors"
                style={{ borderColor: "var(--border-light)" }}
              >
                <span>Private Allocation Vault</span>
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
          DRIPEGO 2025/2026 // PRESENCE BY DESIGN
        </div>
        <div>
          500 GSM HEAVYWEIGHT STREETWEAR ATELIER
        </div>
      </div>
    </footer>
  );
}
