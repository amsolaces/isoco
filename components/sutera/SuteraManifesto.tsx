"use client";

import React, { useState } from "react";
import { useReality } from "@/context/RealityThemeContext";

export default function SuteraManifesto() {
  const { reality } = useReality();
  const [activeWord, setActiveWord] = useState<string | null>(null);

  const keywordTooltips: Record<string, string> = {
    design: "Intentional architecture: shaping form, behavior, and interaction rules.",
    "humans and machines": "Co-evolving systems: blurring the divide between biological agency and computational power.",
    connect: "Low-latency neural, gestural, voice, and haptic multimodal channels.",
    "perceptual interfaces": "Interfaces that speak to our perceptual apparatus rather than forcing us to adapt to silicon.",
    work: "Applied research across Meta Reality Labs, academic institutions, and open developer SDKs.",
    intersection: "Where ergonomics, biomechanics, cognitive psychology, and firmware converge.",
    biology: "Human anatomy, proprioception, motor control, and sensory perception.",
    technology: "XR spatial computing, machine learning, robotics, and tactile transducers.",
  };

  return (
    <section id="manifesto" className="relative py-16 md:py-24 px-4 md:px-8 border-t transition-colors duration-400" style={{ borderColor: "var(--border-light)" }}>
      {/* Section Subhead & Breadcrumb */}
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest opacity-60 mb-8 pb-3 border-b" style={{ borderColor: "var(--border-light)" }}>
        <span>02 // PHILOSOPHY & MANIFESTO</span>
        <span>CYBERNETIC SYMBIOSIS</span>
      </div>

      {/* Primary Kinetic Statement */}
      <div className="max-w-5xl mb-16">
        <p className="font-reality text-3xl sm:text-5xl md:text-6xl lg:text-[4.2rem] leading-[1.08] tracking-tight">
          I{" "}
          <span
            onMouseEnter={() => setActiveWord("design")}
            onMouseLeave={() => setActiveWord(null)}
            className="underline underline-offset-8 decoration-1 decoration-[var(--border-color)] hover:text-[var(--accent-color)] cursor-pointer transition-colors"
          >
            design
          </span>{" "}
          systems that shape how{" "}
          <span
            onMouseEnter={() => setActiveWord("humans and machines")}
            onMouseLeave={() => setActiveWord(null)}
            className="border px-2 py-0.5 rounded-[4px] border-[var(--border-color)] hover:bg-[var(--accent-color)] hover:text-[var(--bg-color)] cursor-pointer transition-all inline-block"
          >
            humans and machines
          </span>{" "}
          <span
            onMouseEnter={() => setActiveWord("connect")}
            onMouseLeave={() => setActiveWord(null)}
            className="italic font-light hover:text-[var(--accent-color)] cursor-pointer transition-colors"
          >
            connect.
          </span>{" "}
          From robotic extensions to{" "}
          <span
            onMouseEnter={() => setActiveWord("perceptual interfaces")}
            onMouseLeave={() => setActiveWord(null)}
            className="border-b-2 border-dashed border-[var(--border-color)] hover:border-[var(--accent-color)] cursor-pointer transition-colors"
          >
            perceptual interfaces,
          </span>{" "}
          my{" "}
          <span
            onMouseEnter={() => setActiveWord("work")}
            onMouseLeave={() => setActiveWord(null)}
            className="font-medium hover:text-[var(--accent-color)] cursor-pointer transition-colors"
          >
            work
          </span>{" "}
          lives at the{" "}
          <span
            onMouseEnter={() => setActiveWord("intersection")}
            onMouseLeave={() => setActiveWord(null)}
            className="hover:text-[var(--accent-color)] cursor-pointer transition-colors"
          >
            intersection
          </span>{" "}
          of{" "}
          <span
            onMouseEnter={() => setActiveWord("biology")}
            onMouseLeave={() => setActiveWord(null)}
            className="italic font-serif hover:text-[var(--accent-color)] cursor-pointer transition-colors"
          >
            biology
          </span>{" "}
          and{" "}
          <span
            onMouseEnter={() => setActiveWord("technology")}
            onMouseLeave={() => setActiveWord(null)}
            className="font-mono text-2xl sm:text-4xl md:text-5xl border px-2 py-0.5 border-[var(--border-color)] inline-block hover:bg-[var(--accent-color)] hover:text-[var(--bg-color)] cursor-pointer transition-all"
          >
            technology.
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
              ↑ Hover highlighted terms to reveal perceptual engineering notes
            </span>
          )}
        </div>
      </div>

      {/* Grid of Spec Sheets: Essentially + Biomechanical Details */}
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
            My passion is to support living beings in developing new abilities or regaining lost abilities, while at the same time providing them with the means to achieve this for themselves or for others.
          </p>
          <p className="text-sm md:text-base leading-relaxed font-semibold italic">
            “That is the meaning of ‘Reality by Design’: each of us can actively shape their own reality.”
          </p>

          <div className="mt-6 pt-4 border-t flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] opacity-75" style={{ borderColor: "var(--border-light)" }}>
            <span>Designing connections between humans and machines</span>
            <span className="border px-2 py-0.5 rounded-[52px]" style={{ borderColor: "var(--border-color)" }}>
              Cybernetic Symbiosis 🤝
            </span>
          </div>
        </div>

        {/* Anchors & Personal Scales (Cols 8-12) */}
        <div className="md:col-span-5 space-y-4">
          {/* Finger Tattoo Measuring Tool */}
          <div className="border p-4 bg-[var(--card-bg)]" style={{ borderColor: "var(--border-light)" }}>
            <div className="flex items-center justify-between font-mono text-[10px] uppercase mb-1.5 opacity-60">
              <span>Physical Reference</span>
              <span>SCALE / 1:1</span>
            </div>
            <p className="text-xs leading-relaxed opacity-85">
              I’ve got a tattoo on my finger that doubles as a measuring tool. It helps me keep a sense of scale when I’m in CAD or crafting physical spatial rigs.
            </p>
          </div>

          {/* Reset Button Note */}
          <div className="border p-4 bg-[var(--card-bg)]" style={{ borderColor: "var(--border-light)" }}>
            <div className="flex items-center justify-between font-mono text-[10px] uppercase mb-1.5 opacity-60">
              <span>Reset Button</span>
              <span>ATLANTIC COAST</span>
            </div>
            <p className="text-xs leading-relaxed opacity-85">
              At least once a year, I head to the Atlantic coast of France. Surfing, French bistros, and time with family and friends recharge my batteries to the fullest — guaranteed.
            </p>
          </div>

          {/* Supervisor Yuki Note */}
          <div className="border p-4 bg-[var(--card-bg)]" style={{ borderColor: "var(--border-color)" }}>
            <div className="flex items-center justify-between font-mono text-[10px] uppercase mb-1.5 opacity-60">
              <span>Supervisor</span>
              <span>CANINE LEAD</span>
            </div>
            <p className="text-xs leading-relaxed font-medium">
              ↳ Supervised by <strong className="font-bold">Yuki</strong> 🐕 — maintaining healthy human-dog symbiosis.
            </p>
          </div>
        </div>
      </div>

      {/* Infinite Ticker Tape Marquee */}
      <div className="mt-16 border-y py-3 overflow-hidden font-mono text-xs uppercase tracking-widest" style={{ borderColor: "var(--border-color)" }}>
        <div className="animate-marquee whitespace-nowrap flex gap-12">
          <span>lab reality</span>
          <span className="opacity-40">{"//"}</span>
          <span>human-machine symbiosis</span>
          <span className="opacity-40">{"//"}</span>
          <span>reality by design</span>
          <span className="opacity-40">{"//"}</span>
          <span>zurich 47.3769° n, 8.5417° e</span>
          <span className="opacity-40">{"//"}</span>
          <span>perceptual interfaces</span>
          <span className="opacity-40">{"//"}</span>
          <span>embodied intelligence</span>
          <span className="opacity-40">{"//"}</span>
          <span>meta reality labs</span>
          <span className="opacity-40">{"//"}</span>
          <span>lab reality</span>
          <span className="opacity-40">{"//"}</span>
          <span>human-machine symbiosis</span>
          <span className="opacity-40">{"//"}</span>
          <span>reality by design</span>
          <span className="opacity-40">{"//"}</span>
          <span>zurich 47.3769° n, 8.5417° e</span>
          <span className="opacity-40">{"//"}</span>
          <span>perceptual interfaces</span>
          <span className="opacity-40">{"//"}</span>
          <span>embodied intelligence</span>
          <span className="opacity-40">{"//"}</span>
          <span>meta reality labs</span>
          <span className="opacity-40">{"//"}</span>
        </div>
      </div>
    </section>
  );
}
