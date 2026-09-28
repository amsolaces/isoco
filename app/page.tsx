"use client";

import DripegoHeader from "@/components/dripego/DripegoHeader";
import DripegoHero from "@/components/dripego/DripegoHero";
import DripegoManifesto from "@/components/dripego/DripegoManifesto";
import DripegoNorthStar from "@/components/dripego/DripegoNorthStar";
import DripegoShowcase from "@/components/dripego/DripegoShowcase";
import DripegoWaitlist from "@/components/dripego/DripegoWaitlist";
import DripegoFooter from "@/components/dripego/DripegoFooter";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col font-main selection:bg-black selection:text-white">
      {/* Header with live Zurich time, Reality Switcher, and Capsule Bag trigger */}
      <DripegoHeader />

      <main className="flex-1 w-full overflow-hidden">
        {/* Hero: "Presence, By Design" + 3D Garment Topology Canvas + Core Threads */}
        <DripegoHero />

        {/* Manifesto: Kinetic textile physics + "Own The Room" statement + Marquee */}
        <DripegoManifesto />

        {/* North Star: Streetwear philosophy matrix + Revelio Vault unlock */}
        <DripegoNorthStar />

        {/* Garment Showcase: Real Dripego Drop 001 pieces with high-res photos & Technical Blueprint drawers */}
        <DripegoShowcase />

        {/* Private Drop Waitlist: Allocation vault registration */}
        <DripegoWaitlist />
      </main>

      {/* Atelier Footer: Multi-city telemetry, concierge contact, and return to top */}
      <DripegoFooter />
    </div>
  );
}
