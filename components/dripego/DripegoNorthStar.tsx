"use client";

import React, { useState } from "react";
import { useReality } from "@/context/RealityThemeContext";

export default function DripegoNorthStar() {
  const { reality } = useReality();
  const [revelioActive, setRevelioActive] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState<number>(0);

  const pillars = [
    {
      left: "Presence",
      right: "Sovereignty",
      synthesis: "Clothing is an architectural perimeter. An engineered heavyweight silhouette alters how you occupy physical volume, commanding the room before a single word is spoken.",
      secretNote: "VAULT ACCESS KEY: 'VAULT-EGO-001' // GRANTS LEVEL-1 PRIORITY DROP ALLOCATION",
    },
    {
      left: "Heavyweight Construction",
      right: "Fluid Movement",
      synthesis: "500 GSM loopback French Terry provides the monumental drape of sculpture, balanced by dropped armhole geometry that preserves complete natural freedom of motion.",
      secretNote: "LAB TENSILE METRICS: 780 N/M SEAM REINFORCEMENT // TRIPLE LOCKSTITCH INTEGRITY",
    },
    {
      left: "Exclusivity",
      right: "Democratic Expression",
      synthesis: "Strictly limited, serialized drops of 500 units worldwide protect the collector's provenance, backed by cryptographic NFC verification embedded directly into each garment.",
      secretNote: "LEDGER DATA: 42/500 UNITS RESERVED IN THE ATELIER ARCHIVE VAULT",
    },
  ];

  return (
    <section id="north-star" className="relative py-16 md:py-24 px-4 md:px-8 border-t transition-colors duration-400" style={{ borderColor: "var(--border-light)" }}>
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest opacity-60 mb-8 pb-3 border-b" style={{ borderColor: "var(--border-light)" }}>
        <span>03 // NORTH STAR</span>
        <span>ATELIER PHILOSOPHY & SOVEREIGNTY</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Statement & Revelio Trigger */}
        <div className="lg:col-span-4">
          <div className="inline-block border px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase mb-3 bg-[var(--card-bg)]">
            GUIDING COMPASS
          </div>
          <h2 className="font-reality text-4xl sm:text-5xl leading-tight mb-4">
            Presence isn’t something you ask for — it’s something you engineer.
          </h2>
          <p className="text-xs font-mono leading-relaxed opacity-70 mb-6">
            Luxury streetwear built with architectural discipline. Own the room.
          </p>

          {/* Revelio Button */}
          <button
            onClick={() => setRevelioActive(!revelioActive)}
            data-cursor="REVELIO"
            className="group relative border px-4 py-2 font-mono text-xs uppercase tracking-widest flex items-center gap-3 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
            style={{
              borderColor: "var(--border-color)",
              backgroundColor: revelioActive ? "var(--accent-color)" : "var(--card-bg)",
              color: revelioActive ? "var(--bg-color)" : "var(--text-primary)",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-ping" />
            <span className="font-bold">
              {revelioActive ? "Vault Unveiled [Active]" : "Revelio! ✦"}
            </span>
            <span className="text-[9px] opacity-60 border-l pl-2" style={{ borderColor: "var(--border-color)" }}>
              {revelioActive ? "LOCK VAULT" : "UNVEIL VAULT"}
            </span>
          </button>
        </div>

        {/* Right: Interactive Matrix Switchboard */}
        <div className="lg:col-span-8 space-y-4">
          {pillars.map((pillar, index) => {
            const isSelected = selectedPillar === index;
            return (
              <div
                key={index}
                onClick={() => setSelectedPillar(index)}
                data-cursor="SELECT PILLAR"
                className={`border p-5 md:p-6 transition-all duration-300 cursor-pointer bg-[var(--card-bg)] ${
                  isSelected ? "shadow-md scale-[1.01]" : "opacity-85 hover:opacity-100"
                }`}
                style={{
                  borderColor: isSelected ? "var(--accent-color)" : "var(--border-light)",
                }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                  <div className="flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-wider">
                    <span className="opacity-40">0{index + 1}.</span>
                    <span>{pillar.left}</span>
                    <span className="opacity-40">⟷</span>
                    <span className="italic">{pillar.right}</span>
                  </div>

                  <span className="font-mono text-[9px] uppercase px-2 py-0.5 border" style={{ borderColor: "var(--border-light)" }}>
                    {isSelected ? "EXPANDED" : "SELECT"}
                  </span>
                </div>

                <p className="text-xs md:text-sm leading-relaxed opacity-80">
                  {pillar.synthesis}
                </p>

                {/* Secret Note revealed by Revelio! */}
                {revelioActive && (
                  <div
                    className="mt-4 pt-3 border-t font-mono text-[10px] tracking-wide animate-in fade-in slide-in-from-top-2 duration-300 flex items-start gap-2"
                    style={{
                      borderColor: "var(--border-color)",
                      color: "var(--accent-color)",
                    }}
                  >
                    <span className="font-bold">↳ [ATELIER_VAULT]:</span>
                    <span>{pillar.secretNote}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
