"use client";

import React, { useState } from "react";
import BiomechanicalMesh from "./BiomechanicalMesh";
import { useReality } from "@/context/RealityThemeContext";

export default function SuteraHero() {
  const { reality } = useReality();
  const [activeThread, setActiveThread] = useState<number | null>(null);

  const threads = [
    {
      id: 1,
      tag: "01.(XR/MR/VR)",
      title: "Perceptual Interfaces",
      desc: "Designing the multimodal interfaces (voice, sight, gesture, spatial) where intent is understood, agency is preserved, and trust can grow over time.",
      metric: "MULTIMODAL / SPATIAL",
    },
    {
      id: 2,
      tag: "02.",
      title: "Embodiment",
      desc: "Designing how beings inhabit space, perceive each other, and act through the forms they take. Extending or restoring humans physical abilities through HMD, exoskeletons, prosthetics, and accessibility-driven design making it truly part of you.",
      metric: "HMD / PROSTHETICS",
    },
    {
      id: 3,
      tag: "03.",
      title: "IA & AI",
      desc: "Designing for both intelligence augmentation (IA) and artificial intelligence (AI) — keeping human agency at the center, with AI extending what we can do, know, and create.",
      metric: "AGENCY / COGNITION",
    },
    {
      id: 4,
      tag: "04.",
      title: "System and Tools",
      desc: "Designing alongside engineers — frameworks, SDKs, and human interface guidelines that become foundations developers trust, adopt, and build ecosystems on. Democratize knowledge.",
      metric: "SDK / FRAMEWORKS",
    },
  ];

  return (
    <section className="relative min-h-screen pt-20 md:pt-24 pb-12 px-4 md:px-8 flex flex-col justify-between overflow-hidden">
      {/* Top Banner Tag & Heading */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-baseline">
        <div className="relative">
          <div className="inline-block border px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase mb-3 bg-[var(--card-bg)]">
            LAB REALITY
          </div>
          <h1 className="font-reality text-5xl sm:text-7xl md:text-8xl lg:text-[7.2rem] leading-[0.88] tracking-tight">
            Reality,
            <br />
            <span className="italic font-light">By Design</span>
          </h1>
        </div>

        {/* Etymology & Roots Callout (Top Right in Desktop) */}
        <div className="mt-6 md:mt-0 relative max-w-xs md:text-right font-mono text-[11px] leading-relaxed">
          <div className="inline-flex items-center gap-2 border px-2.5 py-1 mb-2 bg-[var(--card-bg)]">
            <span className="font-bold">SUTÉRA</span>
            <span className="opacity-60">/25</span>
          </div>
          <div className="opacity-80">
            <p className="text-[10px] uppercase tracking-wider">
              su (underneath) + tera (earth)
            </p>
            <p className="font-semibold text-xs tracking-wide">
              → underneath the earth
            </p>
            <p className="text-[10px] opacity-60 mt-1">
              Where imagination branches into a landscape of endless diversity.
            </p>
          </div>
        </div>
      </div>

      {/* Central Interactive Biomechanical Mesh + Branching Traces */}
      <div className="relative z-0 my-4 md:my-0 flex-1 flex items-center justify-center min-h-[360px] md:min-h-[480px]">
        {/* Branching SVG Schematic Annotation Lines (Desktop) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none hidden lg:block"
          viewBox="0 0 1200 600"
          preserveAspectRatio="none"
        >
          {/* Path 1: Top-Left to Center */}
          <path
            d="M 180 120 L 320 120 L 390 220 L 480 220"
            fill="none"
            stroke="var(--border-color)"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="opacity-40"
          />
          <rect x="175" y="115" width="10" height="10" fill="var(--card-bg)" stroke="var(--border-color)" strokeWidth="1" />

          {/* Path 2: Bottom-Right from Center */}
          <path
            d="M 720 380 L 820 380 L 890 460 L 1020 460"
            fill="none"
            stroke="var(--border-color)"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="opacity-40"
          />
          <rect x="1015" y="455" width="10" height="10" fill="var(--card-bg)" stroke="var(--border-color)" strokeWidth="1" />
        </svg>

        {/* 3D Wireframe Canvas */}
        <div className="w-full max-w-xl aspect-square relative">
          <BiomechanicalMesh />
        </div>

        {/* Floating Technical Pill (Left) */}
        <div className="hidden xl:block absolute left-8 top-1/3 max-w-[210px] font-mono text-[10px] leading-tight border p-3 bg-[var(--card-bg)] backdrop-blur-md">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b" style={{ borderColor: "var(--border-light)" }}>
            <span className="font-semibold uppercase tracking-wider">Root Logic</span>
            <span className="opacity-50">NODE_01</span>
          </div>
          <p className="opacity-80">
            From deep roots, creativity draws its strength. Foundation engineered for organic growth.
          </p>
        </div>

        {/* Floating Technical Pill (Right) */}
        <div className="hidden xl:block absolute right-8 bottom-1/4 max-w-[220px] font-mono text-[10px] leading-tight border p-3 bg-[var(--card-bg)] backdrop-blur-md">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b" style={{ borderColor: "var(--border-light)" }}>
            <span className="font-semibold uppercase tracking-wider">Sub-Surface</span>
            <span className="opacity-50">NODE_02</span>
          </div>
          <p className="opacity-80">
            Designing systems that shape how humans and machines connect at the perceptual frontier.
          </p>
        </div>
      </div>

      {/* Bottom Section: Core Threads (Left) + Profile Bio (Right) */}
      <div id="threads" className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 border-t" style={{ borderColor: "var(--border-light)" }}>
        {/* Core Threads (Cols 1-7) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 bg-current" />
              <h2 className="font-mono text-xs uppercase tracking-widest font-semibold">
                Core threads of my work
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {threads.map((t) => (
                <div
                  key={t.id}
                  onMouseEnter={() => setActiveThread(t.id)}
                  onMouseLeave={() => setActiveThread(null)}
                  data-cursor="EXPAND"
                  className={`border p-3 transition-all duration-300 relative group cursor-pointer ${
                    activeThread === t.id ? "scale-[1.02] shadow-sm" : ""
                  }`}
                  style={{
                    backgroundColor: "var(--card-bg)",
                    borderColor: activeThread === t.id ? "var(--accent-color)" : "var(--border-light)",
                  }}
                >
                  <div className="flex items-center justify-between font-mono text-[10px] mb-1.5">
                    <span className="font-bold opacity-70">{t.tag}</span>
                    <span className="opacity-50 text-[9px]">{t.metric}</span>
                  </div>
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-wide mb-1">
                    {t.title}
                  </h3>
                  <p className="text-[11px] leading-relaxed opacity-75 line-clamp-2 group-hover:line-clamp-none transition-all">
                    {t.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Card & Scale Note (Cols 8-12) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="border p-4 md:p-5 relative bg-[var(--card-bg)]" style={{ borderColor: "var(--border-color)" }}>
            <div className="inline-block border text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 mb-2.5" style={{ backgroundColor: "var(--accent-color)", color: "var(--bg-color)" }}>
              Not a studio — just me
            </div>

            <p className="text-xs md:text-sm leading-relaxed mb-4">
              I’m <strong className="font-semibold">Stella Mühlhaus</strong> and I currently work at Meta Reality Labs. On the side I give talks, workshops, and mentor, as well as writing on design and technology. This site is simply a collection of what I do and share info along the way.
            </p>

            {/* Social Pills */}
            <div className="flex flex-wrap gap-2 pt-2 border-t font-mono text-[10px] uppercase" style={{ borderColor: "var(--border-light)" }}>
              <a
                href="https://www.linkedin.com/in/stellamuehlhaus/"
                target="_blank"
                rel="noreferrer"
                data-cursor="LINKEDIN"
                className="border px-2.5 py-1 rounded-[52px] hover:bg-current hover:text-[var(--bg-color)] transition-colors"
                style={{ borderColor: "var(--border-color)" }}
              >
                LinkedIn ↗
              </a>
              <a
                href="https://medium.com/@sutera."
                target="_blank"
                rel="noreferrer"
                data-cursor="MEDIUM"
                className="border px-2.5 py-1 rounded-[52px] hover:bg-current hover:text-[var(--bg-color)] transition-colors"
                style={{ borderColor: "var(--border-color)" }}
              >
                Medium ↗
              </a>
              <a
                href="https://www.instagram.com/stellamuehlhaus/"
                target="_blank"
                rel="noreferrer"
                data-cursor="INSTAGRAM"
                className="border px-2.5 py-1 rounded-[52px] hover:bg-current hover:text-[var(--bg-color)] transition-colors"
                style={{ borderColor: "var(--border-color)" }}
              >
                Instagram ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
