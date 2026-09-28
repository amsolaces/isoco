"use client";

import React, { useEffect, useRef, useState } from "react";
import { useReality } from "@/context/RealityThemeContext";

export default function BiomechanicalMesh() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { reality } = useReality();
  const [isHovered, setIsHovered] = useState(false);
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

    let angleX = 0.25;
    let angleY = 0;
    let targetAngleX = 0.25;
    let targetAngleY = 0;
    let pulseTime = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;
      targetAngleY = (mouseX / rect.width) * 1.6;
      targetAngleX = -(mouseY / rect.height) * 1.6;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Color definitions based on reality
    const getColors = () => {
      if (reality === "horizon-dark") {
        return {
          primary: "rgba(0, 240, 255, 0.85)",
          secondary: "rgba(0, 240, 255, 0.35)",
          tertiary: "rgba(5, 255, 161, 0.5)",
          nodes: "#00f0ff",
          glow: "rgba(0, 240, 255, 0.2)",
        };
      }
      if (reality === "blueprint-cad") {
        return {
          primary: "rgba(56, 189, 248, 0.9)",
          secondary: "rgba(56, 189, 248, 0.4)",
          tertiary: "rgba(250, 204, 21, 0.6)",
          nodes: "#38bdf8",
          glow: "rgba(56, 189, 248, 0.2)",
        };
      }
      // lab-light (Sutera canonical)
      return {
        primary: "rgba(18, 18, 18, 0.9)",
        secondary: "rgba(18, 18, 18, 0.28)",
        tertiary: "rgba(115, 115, 115, 0.4)",
        nodes: "#121212",
        glow: "rgba(0, 0, 0, 0.05)",
      };
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth camera interpolation
      angleX += (targetAngleX - angleX) * 0.05;
      angleY += (targetAngleY - angleY) * 0.05;
      angleY += 0.004 * rotationSpeed;
      pulseTime += 0.02;

      const colors = getColors();
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.36;

      // Project 3D point (x, y, z) to 2D
      const project = (x: number, y: number, z: number) => {
        // Rotate around Y
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        // Rotate around X
        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        // Perspective scale
        const scale = 380 / (380 + z2);
        return {
          x: cx + x1 * scale,
          y: cy + y2 * scale,
          z: z2,
          scale,
        };
      };

      // Draw outer horizon ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.18, 0, Math.PI * 2);
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw latitude rings (horizontals)
      const latCount = 5;
      for (let i = -latCount; i <= latCount; i++) {
        const phi = (i / latCount) * (Math.PI / 2) * 0.85;
        const rLat = radius * Math.cos(phi);
        const yLat = radius * Math.sin(phi);

        ctx.beginPath();
        const steps = 48;
        for (let j = 0; j <= steps; j++) {
          const theta = (j / steps) * Math.PI * 2;
          const x = rLat * Math.cos(theta);
          const z = rLat * Math.sin(theta);
          const p = project(x, yLat, z);

          if (j === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = i === 0 ? colors.primary : colors.secondary;
        ctx.lineWidth = i === 0 ? 1.4 : 0.8;
        ctx.stroke();
      }

      // Draw longitude rings (meridians)
      const lonCount = 6;
      for (let i = 0; i < lonCount; i++) {
        const thetaOffset = (i / lonCount) * Math.PI;

        ctx.beginPath();
        const steps = 48;
        for (let j = 0; j <= steps; j++) {
          const phi = (j / steps) * Math.PI * 2;
          const x = radius * Math.sin(phi) * Math.cos(thetaOffset);
          const y = radius * Math.cos(phi);
          const z = radius * Math.sin(phi) * Math.sin(thetaOffset);
          const p = project(x, y, z);

          if (j === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = colors.secondary;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Central core & orbiting telemetry nodes
      const nodeCount = 14;
      for (let n = 0; n < nodeCount; n++) {
        const t = pulseTime * 0.8 + (n / nodeCount) * Math.PI * 2;
        const orbitR = radius * (0.8 + 0.35 * Math.sin(t * 1.5 + n));
        const nx = orbitR * Math.cos(t);
        const ny = (radius * 0.5) * Math.sin(t * 2);
        const nz = orbitR * Math.sin(t);
        const p = project(nx, ny, nz);

        // Radial connector trace to center
        if (n % 2 === 0) {
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = colors.tertiary;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }

        // Draw node
        ctx.beginPath();
        const nodeSize = 3 * p.scale;
        ctx.arc(p.x, p.y, nodeSize, 0, Math.PI * 2);
        ctx.fillStyle = colors.nodes;
        ctx.fill();

        // Node technical cross
        ctx.beginPath();
        ctx.moveTo(p.x - 5, p.y);
        ctx.lineTo(p.x + 5, p.y);
        ctx.moveTo(p.x, p.y - 5);
        ctx.lineTo(p.x, p.y + 5);
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Central axis marker
      const topP = project(0, -radius * 1.25, 0);
      const botP = project(0, radius * 1.25, 0);
      ctx.beginPath();
      ctx.moveTo(topP.x, topP.y);
      ctx.lineTo(botP.x, botP.y);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 1;
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
      onMouseEnter={() => {
        setIsHovered(true);
        setRotationSpeed(2.2);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setRotationSpeed(1);
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Interactive Micro Telemetry HUD overlay */}
      <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 text-[9px] font-mono tracking-wider opacity-70 pointer-events-none uppercase">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
        TOPOLOGY: BIOMECHANICAL ARMILLARY [3D.MESH]
      </div>

      <div className="absolute top-2 right-2 md:top-4 md:right-4 text-[9px] font-mono tracking-widest opacity-60 pointer-events-none uppercase">
        AXIS: ROT_Y 360° // PARALLAX: ACTIVE
      </div>
    </div>
  );
}
