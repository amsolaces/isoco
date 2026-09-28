"use client";

import React, { useEffect, useState } from "react";
import { useReality } from "@/context/RealityThemeContext";

export default function CustomCrosshair() {
  const { reality } = useReality();
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hovered, setHovered] = useState(false);
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest("a, button, [role='button'], .hover-trigger, input, [data-cursor]");
      if (interactive) {
        setHovered(true);
        const customLabel = interactive.getAttribute("data-cursor");
        setHoverLabel(customLabel || "INTERACT");
      } else {
        setHovered(false);
        setHoverLabel(null);
      }
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [visible]);

  if (!visible) return null;

  const strokeColor =
    reality === "lab-light"
      ? "#000000"
      : reality === "horizon-dark"
      ? "#00f0ff"
      : "#38bdf8";

  const boxFill =
    reality === "lab-light"
      ? "#ffffff"
      : reality === "horizon-dark"
      ? "#08090c"
      : "#08172e";

  return (
    <div
      className="fixed pointer-events-none z-[99999] transition-transform duration-75 ease-out select-none hidden md:block"
      style={{
        transform: `translate3d(${pos.x - 10}px, ${pos.y - 10}px, 0)`,
      }}
    >
      <div className="relative flex items-center justify-center">
        {/* Reticle box */}
        <svg
          width="21"
          height="21"
          viewBox="0 0 21 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`transition-all duration-200 ${
            hovered ? "scale-125 rotate-45" : "scale-100 rotate-0"
          }`}
        >
          <rect
            x="0.5"
            y="0.5"
            width="20"
            height="20"
            fill={boxFill}
            stroke={strokeColor}
            strokeWidth="1"
          />
          <line x1="10.5" y1="5" x2="10.5" y2="16" stroke={strokeColor} strokeWidth="1" />
          <line x1="5" y1="10.5" x2="16" y2="10.5" stroke={strokeColor} strokeWidth="1" />
        </svg>

        {/* Hover Pill Label or Live Coordinates */}
        {hovered && hoverLabel && (
          <div
            className="absolute left-[26px] top-[-4px] whitespace-nowrap px-1.5 py-0.5 text-[9px] font-mono tracking-wider uppercase border"
            style={{
              borderColor: strokeColor,
              backgroundColor: boxFill,
              color: strokeColor,
            }}
          >
            {hoverLabel}
          </div>
        )}

        {!hovered && (
          <div
            className="absolute left-[24px] top-[14px] text-[8px] font-mono tracking-widest opacity-60 whitespace-nowrap"
            style={{ color: strokeColor }}
          >
            {Math.round(pos.x)}:{Math.round(pos.y)}
          </div>
        )}
      </div>
    </div>
  );
}
