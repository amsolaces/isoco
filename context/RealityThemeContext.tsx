"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type RealityMode = "lab-light" | "horizon-dark" | "blueprint-cad";

interface RealityContextType {
  reality: RealityMode;
  setReality: (mode: RealityMode) => void;
  cycleReality: () => void;
  realityLabel: string;
  realityIndex: string;
}

const RealityContext = createContext<RealityContextType | undefined>(undefined);

export function RealityProvider({ children }: { children: React.ReactNode }) {
  const [reality, setRealityState] = useState<RealityMode>("lab-light");

  useEffect(() => {
    const saved = localStorage.getItem("sutera-reality") as RealityMode;
    if (saved && (saved === "lab-light" || saved === "horizon-dark" || saved === "blueprint-cad")) {
      setRealityState(saved);
      document.documentElement.setAttribute("data-reality", saved);
    } else {
      document.documentElement.setAttribute("data-reality", "lab-light");
    }
  }, []);

  const setReality = (mode: RealityMode) => {
    setRealityState(mode);
    localStorage.setItem("sutera-reality", mode);
    document.documentElement.setAttribute("data-reality", mode);
  };

  const cycleReality = () => {
    const modes: RealityMode[] = ["lab-light", "horizon-dark", "blueprint-cad"];
    const nextIdx = (modes.indexOf(reality) + 1) % modes.length;
    setReality(modes[nextIdx]);
  };

  const getRealityLabel = () => {
    switch (reality) {
      case "lab-light":
        return "Lab Reality";
      case "horizon-dark":
        return "Horizon Void";
      case "blueprint-cad":
        return "Blueprint CAD";
    }
  };

  const getRealityIndex = () => {
    switch (reality) {
      case "lab-light":
        return "01/03";
      case "horizon-dark":
        return "02/03";
      case "blueprint-cad":
        return "03/03";
    }
  };

  return (
    <RealityContext.Provider
      value={{
        reality,
        setReality,
        cycleReality,
        realityLabel: getRealityLabel(),
        realityIndex: getRealityIndex(),
      }}
    >
      {children}
    </RealityContext.Provider>
  );
}

export function useReality() {
  const context = useContext(RealityContext);
  if (!context) {
    throw new Error("useReality must be used within a RealityProvider");
  }
  return context;
}
