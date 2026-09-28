"use client";

import React, { useState } from "react";
import ProjectModal, { ProjectData } from "./ProjectModal";
import { useReality } from "@/context/RealityThemeContext";

export default function ProjectsSection() {
  const { reality } = useReality();
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const projects: ProjectData[] = [
    {
      id: "meta-interaction-sdk",
      num: "01.",
      title: "Meta Interaction SDK",
      subtitle: "Software For XR Devs",
      category: "SDK / DEV FOUNDATION",
      year: "2023 - Present",
      role: "Lead Interaction Designer",
      overview: "A unified, production-grade interaction framework powering thousands of spatial computing apps. Designed canonical interaction primitives including synthetic hand poses, direct touch/poke, distant raycasts, and grab affordances that feel natural without physical resistance.",
      systemFlow: "OPTICAL SENSORS → BIOMECHANICAL KINEMATICS → GESTURE CLASSIFIER → SYNTHETIC HAPTIC INTENT → HORIZON RUNTIME",
      specifications: {
        latency: "< 9.2ms tracking loop",
        dof: "26-DoF Hand Skeleton",
        modalities: "Direct Touch / Distant Ray / Pinch / Poke",
        platform: "Meta Quest 2 / Pro / 3 / Horizon OS",
        status: "Production Standard (Millions of Users)",
      },
      keyInnovations: [
        "Synthetic Hand Snapping with ergonomic boundary constraints",
        "Velocity-aware pinch activation eliminating false-positive selection",
        "Open API architecture allowing custom modifier stacks for spatial developers",
      ],
    },
    {
      id: "meta-horizon-os-hig",
      num: "02.",
      title: "Meta Horizon OS",
      subtitle: "Human Interface Guidelines",
      category: "SPATIAL DESIGN SYSTEM",
      year: "2023 - 2024",
      role: "Spatial System Architect",
      overview: "Authored foundational Human Interface Guidelines for Meta's spatial operating system. Defined optimal viewing distances, ergonomically neutral arm angles, typographic legibility thresholds under stereo displays, and multi-window spatial layouts.",
      systemFlow: "STEREO VIEWPORT → PERCEPTUAL COMFORT ENVELOPE → SYSTEM UI GRIDS → ADAPTIVE Z-LAYERING",
      specifications: {
        latency: "Real-time Compositor Synchronized",
        dof: "Omnidirectional Spatial Canvas",
        modalities: "Hands / Controllers / Stylus / Gaze",
        platform: "Meta Horizon OS",
        status: "Published Worldwide",
      },
      keyInnovations: [
        "Ergonomic Arm Fatigue Metric mitigating gorilla-arm syndrome",
        "Spatial Depth Hierarchy balancing occlusion and stereo rivalry",
        "Universal Accessibility guidelines for low-mobility spatial users",
      ],
    },
    {
      id: "meta-reality-labs-input",
      num: "03.",
      title: "Meta Reality Labs",
      subtitle: "Input & Interaction Team",
      category: "ADVANCED R&D",
      year: "2022 - Present",
      role: "Interaction Design Lead",
      overview: "Pioneering the future of human-computer interaction at Meta Reality Labs. Investigating electromyographic (EMG) wristbands that translate neural motor signals into spatial commands before physical movement even occurs.",
      systemFlow: "MOTOR NEURONS → SURFACE EMG ARRAY → NEURAL INTENT DECODER → SPATIAL COMMAND",
      specifications: {
        latency: "Sub-visual motor intent detection (< 5ms)",
        dof: "Micro-finger pressure & micro-clicks",
        modalities: "Neural EMG + Gaze + Audio",
        platform: "Future Neural Interfaces",
        status: "Active Advanced R&D",
      },
      keyInnovations: [
        "Zero-effort micro-gestural click requiring less than 1mm physical movement",
        "Contextual intent prediction preserving user agency and veto power",
        "Wearable all-day ergonomic wrist form factor",
      ],
    },
    {
      id: "hands-research",
      num: "04.",
      title: "Hands",
      subtitle: "Research, Explorations & Design",
      category: "BIOMECHANICS",
      year: "2021 - 2023",
      role: "Lead Researcher",
      overview: "Deep biomechanical and perceptual investigation into human hand kinematics. Creating synthetic feedback mechanisms in mid-air spatial computing that compensate for the absence of physical tactile resistance.",
      systemFlow: "CAMERA POSE CAPTURE → KINEMATIC MODEL → AUDIO-VISUAL PERCEPTUAL SYNTHESIS",
      specifications: {
        latency: "Frame-accurate feedback (< 11ms)",
        dof: "Full 27-joint anatomical skeleton",
        modalities: "Optical tracking + Pseudo-haptics",
        platform: "XR Headsets & Lab Rigs",
        status: "Published Research",
      },
      keyInnovations: [
        "Audio-visual pseudo-haptic illusion simulating physical surface contact",
        "Micro-finger tremor compensation algorithms",
        "Natural grasp cylinder alignment for virtual objects",
      ],
    },
    {
      id: "afca-mr-cloud",
      num: "05.",
      title: "afca.ag",
      subtitle: "MR & Cloud Computing Custom Solutions",
      category: "ENTERPRISE XR",
      year: "2019 - 2022",
      role: "Senior Spatial Designer",
      overview: "Architected enterprise mixed reality solutions connecting cloud computing with spatial interfaces in Switzerland. Deployed digital twin visualizations, architectural holographic models, and remote collaborative industrial teleoperation.",
      systemFlow: "AZURE SPATIAL ANCHORS → CLOUD DIGITAL TWIN → HOLOLENS 2 REAL-TIME MESH",
      specifications: {
        latency: "Cloud synchronized spatial anchors",
        dof: "Full millimeter-scale room spatial mapping",
        modalities: "Hand gestures / Voice / HoloLens 2",
        platform: "Microsoft HoloLens & Azure MR",
        status: "Commercial Deployment",
      },
      keyInnovations: [
        "Real-time millimeter spatial alignment over massive physical industrial facilities",
        "Multi-user collaborative digital twin inspection",
        "Intuitive spatial data dashboards overlaying live machinery",
      ],
    },
    {
      id: "extending-abilities",
      num: "06.",
      title: "Extending Abilities",
      subtitle: "Robotic Limbs & Sensory Augmentation",
      category: "CYBERNETIC SYSTEMS",
      year: "2020 - 2022",
      role: "Systems Designer",
      overview: "Design research on supernumerary robotic limbs and sensory extensions. Exploring how the human motor cortex adapts to controlling a third thumb or additional robotic manipulator in physical space.",
      systemFlow: "FOOT SENSOR / EMG → ROBOTIC MOTOR CONTROLLER → PROPRIOCEPTIVE FEEDBACK",
      specifications: {
        latency: "Low-latency wireless CAN-bus",
        dof: "3-DoF Supernumerary Robotic Thumb",
        modalities: "Foot pressure / Surface EMG",
        platform: "Custom Wearable Robotics",
        status: "Academic / Lab Prototype",
      },
      keyInnovations: [
        "Neuroplastic embodiment: users adapted to the robotic limb within 30 minutes",
        "Dual-task cognitive load management preserving primary hand agility",
        "Wearable compliance mechanics ensuring physical safety",
      ],
    },
    {
      id: "restoring-abilities",
      num: "07.",
      title: "Restoring Abilities",
      subtitle: "Neural & Adaptive Prosthetics",
      category: "ACCESSIBILITY & BIO-HCI",
      year: "2019 - 2021",
      role: "HCI & Accessibility Designer",
      overview: "Assistive spatial interfaces designed to restore agency to individuals with motor impairments or limb loss. Developing intuitive mapping that translates residual muscle activation into fluid digital control.",
      systemFlow: "RESIDUAL MUSCLE SIGNALS → MACHINE LEARNING CLASSIFIER → ADAPTIVE ASSISTIVE INTERFACE",
      specifications: {
        latency: "Adaptive filtering (< 15ms)",
        dof: "Variable patient-tuned DoF",
        modalities: "Residual EMG / Sip-and-puff / Eye gaze",
        platform: "Adaptive Assistive Suites",
        status: "Clinical Trials & Testing",
      },
      keyInnovations: [
        "Dynamic tolerance tuning: interface adapts to patient fatigue over time",
        "Empowerment-first design: human remains active decision maker",
        "Minimal sensor footprint avoiding clinical stigma",
      ],
    },
    {
      id: "mr-dali",
      num: "08.",
      title: "MR Dali",
      subtitle: "MR Multimodal Interaction Design",
      category: "MULTIMODAL AI",
      year: "2023",
      role: "Interaction Prototyper",
      overview: "A speculative spatial computing canvas exploring multimodal generative AI. Combines real-time natural language voice prompting with 3D spatial hand gesture sculpting to create living spatial artifacts in mixed reality.",
      systemFlow: "VOICE STREAM + SPATIAL 3D GESTURES → MULTIMODAL LLM → DIFFUSION MESH GENERATOR → MR SCENE",
      specifications: {
        latency: "Real-time streaming generation",
        dof: "Freeform volumetric 3D sculpting",
        modalities: "Voice Prompting + Direct Hand Shaping",
        platform: "Meta Quest 3 Passthrough",
        status: "Experimental Spatial Demo",
      },
      keyInnovations: [
        "Deictic referencing: understanding phrases like 'make that bigger and float it there'",
        "Seamless spatial boundary clipping in room-scale passthrough",
        "Tactile sonic feedback for volumetric creation",
      ],
    },
    {
      id: "stolus-hardware",
      num: "09.",
      title: "Stolus",
      subtitle: "Hardware Tool for XR Prototyping",
      category: "PHYSICAL COMPUTING",
      year: "2018 - 2020",
      role: "Hardware & Ergonomic Designer",
      overview: "A tangible physical hardware tool designed for XR spatial designers. Bridges physical clay sculpting with digital parametric spatial computing via embedded IMUs, rotary encoders, and capacitive sensors.",
      systemFlow: "PHYSICAL ENCODERS + IMU → MICROCONTROLLER → WEBSOCKET STREAM → UNITY XR ENGINE",
      specifications: {
        latency: "1000Hz USB / Wireless telemetry",
        dof: "Physical tactile rotary & linear encoders",
        modalities: "Physical dials / Force feedback",
        platform: "Custom CNC Aluminum Tooling",
        status: "Physical Hardware Prototype",
      },
      keyInnovations: [
        "Physical muscle memory preserved in spatial 3D design workflows",
        "Modular magnetic toolheads for various interaction primitives",
        "Precision sub-millimeter encoder feedback",
      ],
    },
  ];

  const filteredProjects =
    filter === "all"
      ? projects
      : projects.filter((p) => p.category.toLowerCase().includes(filter.toLowerCase()));

  return (
    <section id="projects" className="relative py-16 md:py-24 px-4 md:px-8 border-t transition-colors duration-400" style={{ borderColor: "var(--border-light)" }}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 font-mono text-[10px] uppercase tracking-widest opacity-60 mb-8 pb-3 border-b" style={{ borderColor: "var(--border-light)" }}>
        <span>04 // SOME PROJECT EXAMPLES</span>
        <span>(HAVE FUN EXPLORING)</span>
      </div>

      {/* Title & Filter Pills */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h2 className="font-reality text-4xl sm:text-6xl md:text-7xl tracking-tight leading-none">
            Selected Works
          </h2>
          <p className="font-mono text-xs opacity-70 mt-2">
            Click any project to inspect technical blueprint & system telemetry.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 font-mono text-[10px] uppercase">
          {["all", "sdk", "spatial", "biomechanics", "cybernetic"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              data-cursor="FILTER"
              className={`border px-3 py-1 rounded-[52px] transition-all ${
                filter === f ? "bg-[var(--accent-color)] text-[var(--bg-color)] font-bold" : "hover:border-[var(--accent-color)]"
              }`}
              style={{ borderColor: "var(--border-color)" }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid / List View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((proj) => (
          <div
            key={proj.id}
            onClick={() => setSelectedProject(proj)}
            data-cursor="VIEW SPEC"
            className="group border p-5 md:p-6 flex flex-col justify-between min-h-[260px] bg-[var(--card-bg)] hover:shadow-lg transition-all duration-300 hover:scale-[1.015] cursor-pointer relative"
            style={{ borderColor: "var(--border-color)" }}
          >
            {/* Top metadata */}
            <div>
              <div className="flex justify-between items-center font-mono text-[10px] pb-2 mb-3 border-b" style={{ borderColor: "var(--border-light)" }}>
                <span className="font-bold text-xs">{proj.num}</span>
                <span className="opacity-60">{proj.year}</span>
              </div>

              <div className="inline-block border px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider mb-2 opacity-75" style={{ borderColor: "var(--border-light)" }}>
                {proj.category}
              </div>

              <h3 className="font-reality text-2xl sm:text-3xl leading-tight mb-1 group-hover:text-[var(--accent-color)] transition-colors">
                {proj.title}
              </h3>
              <p className="font-mono text-[11px] opacity-70 mb-3">
                {proj.subtitle}
              </p>
            </div>

            {/* Bottom telemetry & inspect pill */}
            <div className="pt-3 border-t flex justify-between items-center font-mono text-[10px]" style={{ borderColor: "var(--border-light)" }}>
              <span className="opacity-50">{proj.role}</span>
              <span className="group-hover:translate-x-1 transition-transform font-bold text-[var(--accent-color)]">
                INSPECT SPEC →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Project Blueprint Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}
