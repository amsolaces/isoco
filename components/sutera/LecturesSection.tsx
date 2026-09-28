"use client";

import React from "react";
import { useReality } from "@/context/RealityThemeContext";

export default function LecturesSection() {
  const { reality } = useReality();

  const talks = [
    {
      institution: "ETH Zürich",
      title: "Swiss Federal Institute of Technology",
      topic: "Biomechanical Hand Kinematics & Spatial Ergonomics in Extended Reality",
      type: "Guest Lecture & Workshop",
    },
    {
      institution: "ZHdK",
      title: "Zurich University of the Arts",
      topic: "Designing for Agency: Ethics of Electromyographic (EMG) Intent Prediction",
      type: "Masterclass & Review",
    },
    {
      institution: "RCA",
      title: "Royal College of Art, London",
      topic: "Cybernetic Symbiosis: Human-Machine Embodiment Beyond Flat Glass Screens",
      type: "Keynote & Panel",
    },
  ];

  const publications = [
    {
      title: "Meta Horizon Human Interface Guidelines",
      publisher: "Meta Reality Labs / Horizon OS Developer Docs",
      desc: "Comprehensive spatial computing design framework defining distances, focal planes, hand gestures, and system menus.",
      link: "https://developers.meta.com/horizon",
    },
    {
      title: "Medium: Notes on Cybernetic Symbiosis",
      publisher: "Self-Published Essays",
      desc: "Essays addressing wearable computing, prosthetic embodiment, and the cognitive toll of synthetic feedback.",
      link: "https://medium.com/@sutera.",
    },
  ];

  return (
    <section id="lectures" className="relative py-16 md:py-24 px-4 md:px-8 border-t transition-colors duration-400" style={{ borderColor: "var(--border-light)" }}>
      {/* Header Bar */}
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest opacity-60 mb-8 pb-3 border-b" style={{ borderColor: "var(--border-light)" }}>
        <span>05 // KNOWLEDGE & PEDAGOGY</span>
        <span>TALKS, WORKSHOPS & WRITING</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
        <div className="lg:col-span-5">
          <div className="inline-block border px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase mb-3 bg-[var(--card-bg)]">
            SHARING FOUNDATIONS
          </div>
          <h2 className="font-reality text-4xl sm:text-6xl leading-[0.95] mb-4">
            Lectures,
            <br />
            Talks & Writing
          </h2>
          <p className="text-xs font-mono leading-relaxed opacity-75 max-w-md">
            “In 2016, I taught myself from the few resources I could find — ever since, sharing knowledge, frameworks, and tools has meant everything to me.”
          </p>
        </div>

        {/* Guest Teaching Institutions */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-mono text-xs uppercase tracking-widest font-semibold opacity-70 mb-2">
            Guest Teaching & Public Speaking
          </h3>
          <div className="space-y-3">
            {talks.map((t, idx) => (
              <div
                key={idx}
                className="border p-4 md:p-5 bg-[var(--card-bg)] flex flex-col justify-between transition-all hover:scale-[1.01]"
                style={{ borderColor: "var(--border-light)" }}
              >
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-reality text-2xl tracking-wide">
                    {t.institution}
                  </h4>
                  <span className="font-mono text-[9px] uppercase border px-1.5 py-0.5" style={{ borderColor: "var(--border-light)" }}>
                    {t.type}
                  </span>
                </div>
                <div className="font-mono text-[11px] opacity-60 mb-2">
                  {t.title}
                </div>
                <p className="text-xs opacity-85 leading-relaxed font-mono">
                  ↳ {t.topic}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Publications */}
      <div className="border-t pt-8" style={{ borderColor: "var(--border-light)" }}>
        <h3 className="font-mono text-xs uppercase tracking-widest font-semibold opacity-70 mb-6">
          Publications & Open Guidelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {publications.map((pub, idx) => (
            <a
              key={idx}
              href={pub.link}
              target="_blank"
              rel="noreferrer"
              data-cursor="READ"
              className="border p-5 md:p-6 bg-[var(--card-bg)] block group no-underline text-inherit hover:border-[var(--accent-color)] transition-colors"
              style={{ borderColor: "var(--border-color)" }}
            >
              <div className="font-mono text-[10px] uppercase opacity-50 mb-2">
                {pub.publisher}
              </div>
              <h4 className="font-reality text-2xl mb-2 group-hover:text-[var(--accent-color)] transition-colors">
                {pub.title} ↗
              </h4>
              <p className="text-xs opacity-80 leading-relaxed">
                {pub.desc}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
