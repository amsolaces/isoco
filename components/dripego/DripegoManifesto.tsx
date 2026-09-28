"use client";

import React, { useState } from "react";
import { useReality } from "@/context/RealityThemeContext";

export default function DripegoManifesto() {
  const { reality } = useReality();
  const [activeWord, setActiveWord] = useState<string | null>(null);

  const keywordTooltips: Record<string, string> = {
    engineer: "Zero synthetic fillers, triple-needle lockstitch, structural seams tested to 780 N/m tensile load.",
    "bodies and spaces": "The garment as an architectural perimeter: asserting physical volume and defining spatial presence.",
    "heavyweight drops": "500 GSM loopback French Terry: substantial drape that hangs cleanly without cling or deform.",
    "architectural silhouettes": "Engineered shoulder drops, boxy torso ratio, and non-collapsing collars.",
    cut: "Precision pattern drafting: balance of fluid movement with upright structural sovereignty.",
    "textile physics": "Custom reactive dye baths, combed long-staple cotton, pre-shrunk for generational longevity.",
    "unapologetic presence": "The non-verbal reality of owning the room before a single word is spoken.",
  };

  return (
    <section id="manifesto" className="relative py-16 md:py-24 px-4 md:px-8 border-t transition-colors duration-400" style={{ borderColor: "var(--border-light)" }}>
      {/* Section Subhead & Breadcrumb */}
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest opacity-60 mb-8 pb-3 border-b" style={{ borderColor: "var(--border-light)" }}>
        <span>02 // PHILOSOPHY & TEXTILE PHYSICS</span>
        <span>ARCHITECTURAL STREETWEAR</span>
      </div>

      {/* Primary Kinetic Statement */}
      <div className="max-w-5xl mb-16">
        <p className="font-reality text-3xl sm:text-5xl md:text-6xl lg:text-[4.2rem] leading-[1.08] tracking-tight">
          We{" "}
          <span
            onMouseEnter={() => setActiveWord("engineer")}
            onMouseLeave={() => setActiveWord(null)}
            className="underline underline-offset-8 decoration-1 decoration-[var(--border-color)] hover:text-[var(--accent-color)] cursor-pointer transition-colors"
          >
            engineer
          </span>{" "}
          garments that shape how{" "}
          <span
            onMouseEnter={() => setActiveWord("bodies and spaces")}
            onMouseLeave={() => setActiveWord(null)}
            className="border px-2 py-0.5 rounded-[4px] border-[var(--border-color)] hover:bg-[var(--accent-color)] hover:text-[var(--bg-color)] cursor-pointer transition-all inline-block"
          >
            bodies and spaces
          </span>{" "}
          connect. From{" "}
          <span
            onMouseEnter={() => setActiveWord("heavyweight drops")}
            onMouseLeave={() => setActiveWord(null)}
            className="italic font-light hover:text-[var(--accent-color)] cursor-pointer transition-colors"
          >
            heavyweight drops
          </span>{" "}
          to{" "}
          <span
            onMouseEnter={() => setActiveWord("architectural silhouettes")}
            onMouseLeave={() => setActiveWord(null)}
            className="border-b-2 border-dashed border-[var(--border-color)] hover:border-[var(--accent-color)] cursor-pointer transition-colors"
          >
            architectural silhouettes,
          </span>{" "}
          our{" "}
          <span
            onMouseEnter={() => setActiveWord("cut")}
            onMouseLeave={() => setActiveWord(null)}
            className="font-medium hover:text-[var(--accent-color)] cursor-pointer transition-colors"
          >
            cut
          </span>{" "}
          lives at the intersection of{" "}
          <span
            onMouseEnter={() => setActiveWord("textile physics")}
            onMouseLeave={() => setActiveWord(null)}
            className="italic font-serif hover:text-[var(--accent-color)] cursor-pointer transition-colors"
          >
            textile physics
          </span>{" "}
          and{" "}
          <span
            onMouseEnter={() => setActiveWord("unapologetic presence")}
            onMouseLeave={() => setActiveWord(null)}
            className="font-mono text-2xl sm:text-4xl md:text-5xl border px-2 py-0.5 border-[var(--border-color)] inline-block hover:bg-[var(--accent-color)] hover:text-[var(--bg-color)] cursor-pointer transition-all"
          >
            unapologetic presence.
          </span>
        </p>

        {/* Dynamic Context Tooltip for Active Keyword */}
        <div className="min-h-[32px] mt-4 font-mono text-xs opacity-75 flex items-center gap-2">
          {activeWord ? (
            <>
              <span className="font-semibold uppercase tracking-wider text-[var(--accent-color)]">
                [{activeWord}]:
              </span>
              <span>{keywordTooltips[activeWord]}</span>
            </>
          ) : (
            <span className="opacity-40 italic text-[11px]">
              ↑ Hover highlighted terms to reveal textile engineering telemetry
            </span>
          )}
        </div>
      </div>

      {/* Grid of Spec Sheets: Essentially + Details */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Essentially Card (Cols 1-7) */}
        <div className="md:col-span-7 border p-6 md:p-8 relative bg-[var(--card-bg)]" style={{ borderColor: "var(--border-color)" }}>
          <div className="flex items-center justify-between pb-3 mb-4 border-b" style={{ borderColor: "var(--border-light)" }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-current" />
              <h3 className="font-mono text-xs uppercase tracking-widest font-semibold">
                Essentially
              </h3>
            </div>
            <span className="font-mono text-[10px] opacity-50">DEF // 01</span>
          </div>

          <p className="text-sm md:text-base leading-relaxed mb-4">
            We don’t make clothes for the background. We craft structural garments for those who stopped asking for permission — where weight, cut, and fabric physics coalesce into pure personal sovereignty.
          </p>
          <p className="text-sm md:text-base leading-relaxed font-semibold italic">
            “That is the meaning of ‘Presence by Design’: when you step into the room, your silhouette commands it before you speak.”
          </p>

          <div className="mt-6 pt-4 border-t flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] opacity-75" style={{ borderColor: "var(--border-light)" }}>
            <span>Engineered luxury streetwear & structural silhouettes</span>
            <span className="border px-2 py-0.5 rounded-[52px]" style={{ borderColor: "var(--border-color)" }}>
              Own The Room 👑
            </span>
          </div>
        </div>

        {/* Tailor Scales & Quality Metrics (Cols 8-12) */}
        <div className="md:col-span-5 space-y-4">
          {/* Finger Tattoo Measuring Tool */}
          <div className="border p-4 bg-[var(--card-bg)]" style={{ borderColor: "var(--border-light)" }}>
            <div className="flex items-center justify-between font-mono text-[10px] uppercase mb-1.5 opacity-60">
              <span>Pattern Calibration</span>
              <span>SCALE / 1:1</span>
            </div>
            <p className="text-xs leading-relaxed opacity-85">
              The tailor’s metric tattoo: 10 precise centimeter increments calibrated to verify collar drops, sleeve cuffs, and hem tolerances instantly on the cutting table.
            </p>
          </div>

          {/* Heavyweight Fabric Stress Test */}
          <div className="border p-4 bg-[var(--card-bg)]" style={{ borderColor: "var(--border-light)" }}>
            <div className="flex items-center justify-between font-mono text-[10px] uppercase mb-1.5 opacity-60">
              <span>Tensile Integrity</span>
              <span>780 N/M RATING</span>
            </div>
            <p className="text-xs leading-relaxed opacity-85">
              Every production bolt undergoes double-tension wash stress testing. Zero torque distortion. The vertical drop stays perpendicular forever.
            </p>
          </div>

          {/* Archival Authenticity */}
          <div className="border p-4 bg-[var(--card-bg)]" style={{ borderColor: "var(--border-color)" }}>
            <div className="flex items-center justify-between font-mono text-[10px] uppercase mb-1.5 opacity-60">
              <span>Archival Integrity</span>
              <span>CRYPTOGRAPHIC NFC</span>
            </div>
            <p className="text-xs leading-relaxed font-medium">
              ↳ Embedded micro-NFC in care tag connects to Dripego Ledger — confirming unit number, owner address, and drop authenticity.
            </p>
          </div>
        </div>
      </div>

      {/* Infinite Ticker Tape Marquee */}
      <div className="mt-16 border-y py-3 overflow-hidden font-mono text-xs uppercase tracking-widest" style={{ borderColor: "var(--border-color)" }}>
        <div className="animate-marquee whitespace-nowrap flex gap-12">
          <span>dripego atelier</span>
          <span className="opacity-40">{"//"}</span>
          <span>own the room</span>
          <span className="opacity-40">{"//"}</span>
          <span>500 gsm heavyweight french terry</span>
          <span className="opacity-40">{"//"}</span>
          <span>archival drop 001</span>
          <span className="opacity-40">{"//"}</span>
          <span>zurich 47.3769° n, 8.5417° e</span>
          <span className="opacity-40">{"//"}</span>
          <span>architectural silhouette</span>
          <span className="opacity-40">{"//"}</span>
          <span>presence by design</span>
          <span className="opacity-40">{"//"}</span>
          <span>dripego atelier</span>
          <span className="opacity-40">{"//"}</span>
          <span>own the room</span>
          <span className="opacity-40">{"//"}</span>
          <span>500 gsm heavyweight french terry</span>
          <span className="opacity-40">{"//"}</span>
          <span>archival drop 001</span>
          <span className="opacity-40">{"//"}</span>
          <span>zurich 47.3769° n, 8.5417° e</span>
          <span className="opacity-40">{"//"}</span>
          <span>architectural silhouette</span>
          <span className="opacity-40">{"//"}</span>
          <span>presence by design</span>
          <span className="opacity-40">{"//"}</span>
        </div>
      </div>
    </section>
  );
}
