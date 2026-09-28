"use client";

import React from "react";
import { useReality } from "@/context/RealityThemeContext";

export default function TechnicalGridBackground() {
  const { reality } = useReality();

  const strokeColor =
    reality === "lab-light"
      ? "#d2d2d2"
      : reality === "horizon-dark"
      ? "rgba(255, 255, 255, 0.24)"
      : "rgba(56, 189, 248, 0.35)";

  const crosshairStroke =
    reality === "lab-light"
      ? "#444444"
      : reality === "horizon-dark"
      ? "#ffffff"
      : "#38bdf8";

  const boxFill =
    reality === "lab-light"
      ? "#ffffff"
      : reality === "horizon-dark"
      ? "#000000"
      : "#08172e";

  return (
    <div className="fixed inset-0 w-screen h-screen -z-10 pointer-events-none select-none overflow-hidden transition-colors duration-500">
      {/* Desktop 4-column coordinate grid */}
      <svg
        className="w-full h-full object-cover hidden md:block"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1728 958"
        preserveAspectRatio="xMidYMid slice"
      >
        <line x1="432" x2="432" y1="0" y2="958" stroke={strokeColor} strokeWidth="1" />
        <line x1="864" x2="864" y1="0" y2="958" stroke={strokeColor} strokeWidth="1" />
        <line x1="1296" x2="1296" y1="0" y2="958" stroke={strokeColor} strokeWidth="1" />
        <line y1="319" y2="319" x1="0" x2="1728" stroke={strokeColor} strokeWidth="1" />
        <line y1="638" y2="638" x1="0" x2="1728" stroke={strokeColor} strokeWidth="1" />

        {/* Intersection Crosshairs */}
        {[
          { x: 432, y: 319 },
          { x: 864, y: 319 },
          { x: 1296, y: 319 },
          { x: 432, y: 638 },
          { x: 864, y: 638 },
          { x: 1296, y: 638 },
        ].map((pt, i) => (
          <g key={i}>
            <rect
              x={pt.x - 10}
              y={pt.y - 10}
              width="20"
              height="20"
              fill={boxFill}
              stroke={strokeColor}
              strokeWidth="1"
            />
            <line
              x1={pt.x}
              y1={pt.y - 6}
              x2={pt.x}
              y2={pt.y + 6}
              stroke={crosshairStroke}
              strokeWidth="1"
            />
            <line
              x1={pt.x - 6}
              y1={pt.y}
              x2={pt.x + 6}
              y2={pt.y}
              stroke={crosshairStroke}
              strokeWidth="1"
            />
          </g>
        ))}
      </svg>

      {/* Mobile 2-column coordinate grid */}
      <svg
        className="w-full h-full object-cover md:hidden"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 393 852"
        preserveAspectRatio="xMidYMid slice"
      >
        <line x1="131" x2="131" y1="0" y2="852" stroke={strokeColor} strokeWidth="1" />
        <line x1="262" x2="262" y1="0" y2="852" stroke={strokeColor} strokeWidth="1" />
        <line y1="284" y2="284" x1="0" x2="393" stroke={strokeColor} strokeWidth="1" />
        <line y1="568" y2="568" x1="0" x2="393" stroke={strokeColor} strokeWidth="1" />

        {[
          { x: 131, y: 284 },
          { x: 262, y: 284 },
          { x: 131, y: 568 },
          { x: 262, y: 568 },
        ].map((pt, i) => (
          <g key={i}>
            <rect
              x={pt.x - 8}
              y={pt.y - 8}
              width="16"
              height="16"
              fill={boxFill}
              stroke={strokeColor}
              strokeWidth="1"
            />
            <line
              x1={pt.x}
              y1={pt.y - 4}
              x2={pt.x}
              y2={pt.y + 4}
              stroke={crosshairStroke}
              strokeWidth="1"
            />
            <line
              x1={pt.x - 4}
              y1={pt.y}
              x2={pt.x + 4}
              y2={pt.y}
              stroke={crosshairStroke}
              strokeWidth="1"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
