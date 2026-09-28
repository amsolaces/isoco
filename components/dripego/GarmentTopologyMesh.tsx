"use client";

import React, { useEffect, useRef, useState } from "react";
import { useReality } from "@/context/RealityThemeContext";

export default function GarmentTopologyMesh() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { reality } = useReality();
  const [rotationSpeed, setRotationSpeed] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    let angleX = 0.15;
    let angleY = 0;
    let targetAngleX = 0.15;
    let targetAngleY = 0;
    let pulseTime = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;
      targetAngleY = (mouseX / rect.width) * 1.5;
      targetAngleX = -(mouseY / rect.height) * 1.5;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const getColors = () => {
      if (reality === "horizon-dark") {
        return {
          primary: "rgba(0, 240, 255, 0.85)",
          secondary: "rgba(0, 240, 255, 0.35)",
          accent: "#00f0ff",
          silhouette: "rgba(5, 255, 161, 0.4)",
          fill: "rgba(0, 240, 255, 0.03)",
        };
      }
      if (reality === "blueprint-cad") {
        return {
          primary: "rgba(56, 189, 248, 0.9)",
          secondary: "rgba(56, 189, 248, 0.4)",
          accent: "#38bdf8",
          silhouette: "rgba(250, 204, 21, 0.5)",
          fill: "rgba(56, 189, 248, 0.04)",
        };
      }
      // lab-light (Sutera canonical)
      return {
        primary: "rgba(18, 18, 18, 0.9)",
        secondary: "rgba(18, 18, 18, 0.28)",
        accent: "#121212",
        silhouette: "rgba(115, 115, 115, 0.5)",
        fill: "rgba(0, 0, 0, 0.02)",
      };
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      angleX += (targetAngleX - angleX) * 0.05;
      angleY += (targetAngleY - angleY) * 0.05;
      angleY += 0.005 * rotationSpeed;
      pulseTime += 0.02;

      const colors = getColors();
      const cx = width / 2;
      const cy = height / 2;
      const baseScale = Math.min(width, height) * 0.38;

      const project = (x: number, y: number, z: number) => {
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        const scale = 400 / (400 + z2);
        return {
          x: cx + x1 * scale,
          y: cy + y2 * scale,
          z: z2,
          scale,
        };
      };

      // Outer Tailor Measurement Ring
      ctx.beginPath();
      ctx.arc(cx, cy, baseScale * 1.25, 0, Math.PI * 2);
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Garment Cross-sections: Collar, Chest, Waist, Hem (Boxy silhouette)
      const slices = [
        { y: -baseScale * 0.85, rx: baseScale * 0.38, rz: baseScale * 0.32, label: "COLLAR_42CM" },
        { y: -baseScale * 0.55, rx: baseScale * 0.88, rz: baseScale * 0.52, label: "SHOULDER_DROP_58CM" },
        { y: -baseScale * 0.15, rx: baseScale * 0.78, rz: baseScale * 0.48, label: "CHEST_124CM" },
        { y: baseScale * 0.25, rx: baseScale * 0.74, rz: baseScale * 0.44, label: "WAIST_120CM" },
        { y: baseScale * 0.75, rx: baseScale * 0.76, rz: baseScale * 0.46, label: "WEIGHTED_HEM_74CM" },
      ];

      // Draw horizontal cross-section rings
      slices.forEach((slice, sIdx) => {
        ctx.beginPath();
        const steps = 40;
        for (let j = 0; j <= steps; j++) {
          const theta = (j / steps) * Math.PI * 2;
          const x = slice.rx * Math.cos(theta);
          const z = slice.rz * Math.sin(theta);
          const p = project(x, slice.y, z);
          if (j === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = sIdx === 1 || sIdx === 4 ? colors.primary : colors.secondary;
        ctx.lineWidth = sIdx === 1 ? 1.5 : 0.8;
        ctx.stroke();
      });

      // Draw vertical seam lines connecting slices
      const seamCount = 12;
      for (let s = 0; s < seamCount; s++) {
        const theta = (s / seamCount) * Math.PI * 2;
        ctx.beginPath();
        slices.forEach((slice, idx) => {
          const x = slice.rx * Math.cos(theta);
          const z = slice.rz * Math.sin(theta);
          const p = project(x, slice.y, z);
          if (idx === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.strokeStyle = s % 3 === 0 ? colors.primary : colors.secondary;
        ctx.lineWidth = s % 3 === 0 ? 1 : 0.6;
        ctx.stroke();
      }

      // Draw seam construction measurement nodes
      slices.forEach((slice, i) => {
        [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].forEach((th) => {
          const x = slice.rx * Math.cos(th);
          const z = slice.rz * Math.sin(th);
          const p = project(x, slice.y, z);

          // Node square
          const size = 3 * p.scale;
          ctx.beginPath();
          ctx.rect(p.x - size, p.y - size, size * 2, size * 2);
          ctx.fillStyle = colors.accent;
          ctx.fill();

          // Small cross
          ctx.beginPath();
          ctx.moveTo(p.x - 4, p.y);
          ctx.lineTo(p.x + 4, p.y);
          ctx.moveTo(p.x, p.y - 4);
          ctx.lineTo(p.x, p.y + 4);
          ctx.strokeStyle = colors.primary;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        });
      });

      // Vertical Center Plumb Line
      const topPlumb = project(0, -baseScale * 1.1, 0);
      const botPlumb = project(0, baseScale * 1.1, 0);
      ctx.beginPath();
      ctx.moveTo(topPlumb.x, topPlumb.y);
      ctx.lineTo(botPlumb.x, botPlumb.y);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 0.8;
      ctx.setLineDash([2, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [reality, rotationSpeed]);

  return (
    <div
      className="relative w-full h-full min-h-[340px] md:min-h-[500px] flex items-center justify-center select-none"
      onMouseEnter={() => setRotationSpeed(2.2)}
      onMouseLeave={() => setRotationSpeed(1)}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Real-time Garment Telemetry HUD */}
      <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 text-[9px] font-mono tracking-wider opacity-70 pointer-events-none uppercase">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
        PATTERN_TOPOLOGY: OVERSIZED_DROP_001 [500 GSM]
      </div>

      <div className="absolute top-2 right-2 md:top-4 md:right-4 text-[9px] font-mono tracking-widest opacity-60 pointer-events-none uppercase">
        SEAM_TOLERANCE: 0.2MM // DRAPE: STRUCTURAL
      </div>
    </div>
  );
}
