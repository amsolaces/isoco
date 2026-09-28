"use client";

import React, { useEffect } from "react";
import { useReality } from "@/context/RealityThemeContext";

export interface ProjectData {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  role: string;
  overview: string;
  specifications: {
    latency?: string;
    dof?: string;
    modalities?: string;
    platform?: string;
    status: string;
  };
  keyInnovations: string[];
  systemFlow: string;
}

interface ProjectModalProps {
  project: ProjectData | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const { reality } = useReality();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (project) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto border p-6 md:p-8 bg-[var(--card-bg)] text-[var(--text-primary)] shadow-2xl transition-all"
        style={{ borderColor: "var(--border-color)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b" style={{ borderColor: "var(--border-light)" }}>
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="font-bold border px-1.5 py-0.5" style={{ borderColor: "var(--border-color)" }}>
              {project.num}
            </span>
            <span className="uppercase tracking-widest opacity-60">
              {project.category} // {project.year}
            </span>
          </div>

          <button
            onClick={onClose}
            data-cursor="CLOSE"
            className="border px-2 py-1 font-mono text-xs uppercase hover:bg-current hover:text-[var(--bg-color)] transition-colors"
            style={{ borderColor: "var(--border-color)" }}
          >
            ESC [✕]
          </button>
        </div>

        {/* Title & Role */}
        <div className="mb-6">
          <h2 className="font-reality text-3xl sm:text-4xl md:text-5xl leading-tight mb-2">
            {project.title}
          </h2>
          <p className="font-mono text-xs uppercase tracking-wider opacity-70">
            {project.subtitle} • <span className="font-semibold">{project.role}</span>
          </p>
        </div>

        {/* System Architecture Flow Diagram */}
        <div className="border p-4 mb-6 bg-[var(--bg-color)] font-mono text-xs" style={{ borderColor: "var(--border-light)" }}>
          <div className="flex items-center justify-between text-[10px] uppercase opacity-50 mb-2">
            <span>System Data Flow</span>
            <span>PIPELINE_ARCHITECTURE</span>
          </div>
          <div className="p-3 border border-dashed text-center font-bold tracking-wider" style={{ borderColor: "var(--border-color)", color: "var(--accent-color)" }}>
            {project.systemFlow}
          </div>
        </div>

        {/* Overview */}
        <div className="mb-6">
          <h4 className="font-mono text-[10px] uppercase tracking-widest opacity-60 mb-2">
            Concept & Spatial Logic
          </h4>
          <p className="text-sm leading-relaxed opacity-90">
            {project.overview}
          </p>
        </div>

        {/* Technical Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border mb-6 bg-[var(--bg-color)] font-mono text-xs" style={{ borderColor: "var(--border-light)" }}>
          <div>
            <span className="text-[9px] uppercase opacity-50 block">Target Latency</span>
            <span className="font-bold">{project.specifications.latency || "< 12ms"}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase opacity-50 block">Degrees of Freedom</span>
            <span className="font-bold">{project.specifications.dof || "6-DoF + Biomechanics"}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase opacity-50 block">Input Modalities</span>
            <span className="font-bold">{project.specifications.modalities || "Hand / Gaze / EMG"}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase opacity-50 block">Ecosystem Status</span>
            <span className="font-bold text-[var(--accent-color)]">{project.specifications.status}</span>
          </div>
        </div>

        {/* Key Innovations */}
        <div className="mb-6">
          <h4 className="font-mono text-[10px] uppercase tracking-widest opacity-60 mb-2">
            Key Engineering & Ergonomic Innovations
          </h4>
          <ul className="space-y-1.5 font-mono text-xs opacity-85">
            {project.keyInnovations.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[var(--accent-color)] font-bold">↳</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer actions */}
        <div className="flex justify-between items-center pt-4 border-t font-mono text-xs" style={{ borderColor: "var(--border-light)" }}>
          <span className="opacity-50 text-[10px]">
            SUTÉRA ARCHIVE SPEC // ID: {project.id}
          </span>
          <button
            onClick={onClose}
            className="border px-4 py-1.5 uppercase font-medium hover:bg-[var(--accent-color)] hover:text-[var(--bg-color)] transition-colors"
            style={{ borderColor: "var(--border-color)" }}
          >
            Close Spec [✕]
          </button>
        </div>
      </div>
    </div>
  );
}
