"use client";

import React, { useState } from "react";
import Image from "next/image";
import GarmentBlueprintModal, { GarmentProduct } from "./GarmentBlueprintModal";
import { useReality } from "@/context/RealityThemeContext";
import { useCartStore } from "@/lib/cartStore";

export default function DripegoShowcase() {
  const { reality } = useReality();
  const [selectedProduct, setSelectedProduct] = useState<GarmentProduct | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const { addItem, setIsOpen } = useCartStore();

  const products: (GarmentProduct & { year: string; edition: string })[] = [
    {
      id: 1,
      num: "01.",
      name: "Statement Oversized Tee",
      slug: "statement-tee",
      color: "Washed Obsidian",
      price: 9600.0,
      tag: "Drop 001",
      year: "2025",
      edition: "Season 01",
      availability: "Available Now",
      src: "/products/tee_front.webp",
      hoverSrc: "/products/tee_back.webp",
      alt: "DRIPEGO statement tee front",
      gsm: "500 GSM",
      weave: "Combed Loopback French Terry",
      fit: "Architectural Boxy Cut",
      overview: "The definitive DRIPEGO silhouette. Engineered with heavy dropped shoulders, an upright non-collapsing collar, and high-density 500 GSM combed cotton that creates a monumental drape.",
      keyInnovations: [
        "Reinforced 1.2-inch collar ribbing that resists sagging over 100+ launderings",
        "Triple-needle coverstitch on shoulder seam and hem line",
        "Carbon enzyme washed for velvety matte texture and zero post-wash shrinkage",
        "Discreet cryptographic NFC chip embedded inside side hem label",
      ],
    },
    {
      id: 2,
      num: "02.",
      name: "Signature Back Graphic Tee",
      slug: "signature-back-tee",
      color: "Matte Carbon",
      price: 9600.0,
      tag: "Drop 001",
      year: "2025",
      edition: "Discoball Edition",
      availability: "Available Now",
      src: "/products/tee_back.webp",
      hoverSrc: "/products/tee_front.webp",
      alt: "DRIPEGO statement tee back",
      gsm: "500 GSM",
      weave: "Combed Loopback French Terry",
      fit: "Architectural Boxy Cut",
      overview: "Featuring the high-density reverse architectural typographic stamp. High-solids water-based screenprint fused under high temperature into the fabric grain.",
      keyInnovations: [
        "Zero-feel waterbased pigment ink that breathes with the cotton fibers",
        "Offset shoulder seam engineered to prevent friction with bag straps",
        "Subtle dropped back hem for seamless posture coverage",
        "Individually numbered archival serial stamp",
      ],
    },
    {
      id: 3,
      num: "03.",
      name: "Studio Fold Minimal Tee",
      slug: "studio-fold-minimal-tee",
      color: "Deep Shadow",
      price: 9600.0,
      tag: "Drop 001",
      year: "2025",
      edition: "Dark Glitter",
      availability: "Limited Archive",
      src: "/products/tee_folded.webp",
      hoverSrc: "/products/tee_hanging.webp",
      alt: "DRIPEGO folded tee",
      gsm: "500 GSM",
      weave: "Combed Loopback French Terry",
      fit: "Architectural Boxy Cut",
      overview: "Stripped of external graphics. Pure form, pure silhouette, and pure textile physics. The ultimate stealth luxury streetwear piece for those whose presence is self-evident.",
      keyInnovations: [
        "Unbranded exterior: letting silhouette and fabric weight speak exclusively",
        "Seamless side body construction with integrated tension bar-tacks",
        "Pre-softened handle with zero synthetic softeners",
        "Archival registration number on internal wash ribbon",
      ],
    },
    {
      id: 4,
      num: "04.",
      name: "Campaign Hang Heavyweight Tee",
      slug: "campaign-exclusive-hang-tee",
      color: "Pitch Black",
      price: 9600.0,
      tag: "Drop 001",
      year: "2025",
      edition: "Dark Mode",
      availability: "Available Now",
      src: "/products/tee_hanging.webp",
      hoverSrc: "/products/tee_folded.webp",
      alt: "DRIPEGO hanging tee",
      gsm: "500 GSM",
      weave: "Combed Loopback French Terry",
      fit: "Architectural Boxy Cut",
      overview: "The centerpiece of the Drop 001 campaign. Deep pitch-black reactive dye bath ensuring intense light absorption and maximum silhouette contrast against any background.",
      keyInnovations: [
        "Deep sulfur black dye with ultraviolet degradation protection",
        "Heavy gauge neck tape preventing skin abrasion",
        "Precision balanced weight distribution: hangs strictly perpendicular",
        "Hand-inspected and numbered in Zurich atelier",
      ],
    },
    {
      id: 5,
      num: "05.",
      name: "Sovereign MA-1 Bomber",
      slug: "sovereign-ma1-bomber",
      color: "Obsidian Tech",
      price: 24500.0,
      tag: "Outerwear",
      year: "2024",
      edition: "Las Vegas Special",
      availability: "Waitlist Only",
      src: "/models/men_model.jpg",
      hoverSrc: "/models/hero_model.png",
      alt: "DRIPEGO Sovereign Bomber",
      gsm: "720 GSM",
      weave: "Water-repellent High-Tenacity Twill",
      fit: "Volumetric Cropped Silhouette",
      overview: "A heavyweight outerwear statement combining military aviation heritage with cybernetic tailoring. Cropped body ratio with dramatically elongated sleeves and custom matte gunmetal hardware.",
      keyInnovations: [
        "Custom Cobrax zero-rattle magnetic snaps and heavy two-way zipper",
        "Primaloft gold thermal insulation core rated to -10°C",
        "Concealed internal sling straps for hands-free carry",
        "Modular magnetic interior chest pocket for hardware tokens",
      ],
    },
    {
      id: 6,
      num: "06.",
      name: "CyberCargo Heavyweight Trouser",
      slug: "cybercargo-heavyweight-trouser",
      color: "Industrial Slate",
      price: 16800.0,
      tag: "Trousers",
      year: "2024",
      edition: "Chrome Spec",
      availability: "Waitlist Only",
      src: "/models/women_model.jpg",
      hoverSrc: "/models/hero_model.png",
      alt: "DRIPEGO CyberCargo Trouser",
      gsm: "480 GSM",
      weave: "Japanese Tech Gabardine",
      fit: "Wide-Leg Ergonomic Stance",
      overview: "Engineered lower-body architecture. Articulated knee darts, expandable gusseted utility pockets, and adjustable hem drawstrings allowing rapid transition between wide pooling and tapered cuffs.",
      keyInnovations: [
        "Anatomically mapped knee articulation preserving clean silhouette while seated",
        "Fidlock magnetic pocket quick-releases",
        "Heavyweight Japanese tech gabardine with natural crease memory",
        "Reinforced seat and crotch gusset for lifetime longevity",
      ],
    },
    {
      id: 7,
      num: "07.",
      name: "Porcelain Heavyweight Crewneck",
      slug: "porcelain-crewneck",
      color: "Chalk Bone",
      price: 14200.0,
      tag: "Drop 001",
      year: "2024",
      edition: "Porcelain Edition",
      availability: "Archive",
      src: "/products/tee_folded.webp",
      hoverSrc: "/models/men_model.jpg",
      alt: "DRIPEGO Porcelain Crewneck",
      gsm: "550 GSM",
      weave: "Double-face Combed Cotton",
      fit: "Relaxed Boxy Drop",
      overview: "Inspired by ancient fine porcelain glazes. Natural unbleached organic cotton yarns with subtle raw flecks and double-layered ribbed cuffs.",
      keyInnovations: [
        "Unbleached organic cotton fibers preserving natural oil resistance",
        "Overlocked interior flatlock seams for zero friction against the torso",
        "Subtle embossed tonal monogram on left cuff",
      ],
    },
    {
      id: 8,
      num: "08.",
      name: "Titanium Modular Tech Harness",
      slug: "modular-tech-harness",
      color: "Matte Anodized",
      price: 8400.0,
      tag: "Hardware",
      year: "2023",
      edition: "Silverstone Lab",
      availability: "Limited Archive",
      src: "/products/tee_hanging.webp",
      hoverSrc: "/models/women_model.jpg",
      alt: "DRIPEGO Tech Harness",
      gsm: "N/A",
      weave: "MIL-SPEC Ballistic Webbing",
      fit: "Ergonomic Over-shoulder",
      overview: "Tactical load-bearing accessory bridging street aesthetic with modular utility. Laser-etched aircraft aluminum quick-release buckles.",
      keyInnovations: [
        "Magnetic Cobra buckle rated to 4.5kN load",
        "Pass-through loop system compatible with Dripego bombers & tees",
        "Reflective micro-thread stitching for night visibility",
      ],
    },
  ];

  const filteredProducts =
    activeTab === "all"
      ? products
      : activeTab === "2025"
      ? products.filter((p) => p.year === "2025")
      : activeTab === "2024"
      ? products.filter((p) => p.year === "2024")
      : products.filter((p) => p.tag.toLowerCase().includes(activeTab.toLowerCase()));

  const handleQuickAdd = (e: React.MouseEvent, p: GarmentProduct) => {
    e.stopPropagation();
    addItem({
      id: `${p.id}-M`,
      product_id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      size: "M",
      color: p.color,
      thumbnail: p.src,
    });
    setIsOpen(true);
  };

  return (
    <section
      id="archive"
      className="relative py-16 md:py-24 px-4 md:px-8 border-y-2 bg-[#000000] text-[#ffffff] transition-colors duration-400 overflow-hidden"
      style={{ borderColor: "#ffffff" }}
    >
      {/* High-visibility architectural blueprint coordinate grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.18) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.18) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.12) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.12) 1px, transparent 1px)
          `,
          backgroundSize: "16px 16px",
        }}
      />
      {/* Background subtle radial ambient light */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.12),transparent_75%)]" />

      {/* Top Breadcrumb & Status Bar - High Visibility White */}
      <div
        className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 font-mono text-[11px] uppercase tracking-widest text-white mb-10 pb-4 border-b-2"
        style={{ borderColor: "#ffffff" }}
      >
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
          <span className="font-extrabold tracking-wider">04 // GARMENTS ARCHIVE</span>
          <span className="hidden md:inline-block text-white/70 font-semibold">// [CAD REF: DROP-001]</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block border border-white/60 px-2 py-0.5 bg-black font-semibold text-[10px]">
            COORD: 47.3769° N, 8.5417° E
          </span>
          <span className="font-bold tracking-wider text-white">ATELIER HALL OF FAME // SERIALIZED PIECES</span>
        </div>
      </div>

      {/* Lando Norris-Style Section Title Block */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-14">
        <div className="lg:col-span-7">
          <h2 className="font-reality text-5xl sm:text-7xl md:text-8xl tracking-tight leading-[0.9] text-white font-medium">
            Garments
            <br />
            <span className="italic font-light text-white drop-shadow-[0_0_24px_rgba(255,255,255,0.8)]">
              Hall of Fame
            </span>
          </h2>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-between pt-2">
          <p className="font-mono text-xs md:text-sm leading-relaxed text-neutral-100 mb-6 font-medium">
            From our iconic heavyweight cuts to innovative one-off archival prototypes, DRIPEGO has always been obsessed with designing structural, memorable silhouettes that own the room.
          </p>

          {/* Lando-Style Year / Category Filter Tabs - High Visibility White */}
          <div className="flex flex-wrap gap-2.5 font-mono text-xs uppercase">
            {[
              { id: "all", label: "All Releases" },
              { id: "2025", label: "Season 2025" },
              { id: "2024", label: "Season 2024" },
              { id: "outerwear", label: "Outerwear" },
              { id: "trousers", label: "Trousers" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-cursor="FILTER"
                className={`border-2 px-4 py-2 transition-all uppercase tracking-wider font-mono text-xs ${
                  activeTab === tab.id
                    ? "bg-white text-black font-black border-white shadow-[0_0_18px_rgba(255,255,255,0.9)]"
                    : "bg-black text-white border-white hover:bg-neutral-900 hover:border-white font-bold"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lando Norris Signature Stepped Frame Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {filteredProducts.map((proj) => (
          <div
            key={proj.id}
            onClick={() => setSelectedProduct(proj)}
            data-cursor="INSPECT GARMENT"
            className="group relative flex flex-col cursor-pointer select-none"
          >
            {/* 1. Custom SVG Stepped Tech Frame Container */}
            <div className="relative aspect-[407/411] w-full p-2 flex items-center justify-center">
              {/* Base SVG Outline Frame - Solid High-Visibility White with subtle glow */}
              <svg
                viewBox="0 0 407 411"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_10px_rgba(255,255,255,0.45)]"
                preserveAspectRatio="none"
              >
                <path
                  d="M8 .5h390.89a7.5 7.5 0 0 1 7.5 7.5v356.983a7.5 7.5 0 0 1-7.5 7.5H263.329a23.502 23.502 0 0 0-18.375 8.849l-16.499 20.695a22.502 22.502 0 0 1-17.593 8.473H8A7.5 7.5 0 0 1 .5 403V8A7.5 7.5 0 0 1 8 .5Z"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              {/* Hover Overlay Illuminated SVG Frame */}
              <svg
                viewBox="0 0 407 411"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute inset-0 w-full h-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-[0_0_16px_#34d399]"
                preserveAspectRatio="none"
              >
                <path
                  d="M8 1h390.89a7 7 0 0 1 7 7v356.983a7 7 0 0 1-7 7H263.329a23.999 23.999 0 0 0-18.766 9.038l-16.499 20.694A21.999 21.999 0 0 1 210.862 410H8a7 7 0 0 1-7-7V8a7 7 0 0 1 7-7Z"
                  stroke="#34d399"
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              {/* Top corner metrics inside frame - Solid White Badges */}
              <div className="absolute top-3.5 left-4 right-4 flex justify-between items-center font-mono text-[11px] uppercase tracking-wider z-20 pointer-events-none">
                <span className="font-black text-white bg-black border-2 border-white px-2.5 py-0.5 shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                  {proj.num}
                </span>
                <span className="border-2 border-white bg-black text-white font-black px-2.5 py-0.5 shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                  {proj.gsm}
                </span>
              </div>

              {/* Dual Image Reveal Container - High-Contrast Border & Corner Brackets */}
              <div className="relative w-[88%] h-[82%] mb-3 overflow-hidden flex items-center justify-center z-10 bg-[#090909] border-2 border-white shadow-[0_0_16px_rgba(255,255,255,0.12)]">
                {/* 4 CAD Corner Brackets in Solid White */}
                <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-white z-20 pointer-events-none" />
                <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-white z-20 pointer-events-none" />
                <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-white z-20 pointer-events-none" />
                <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-white z-20 pointer-events-none" />

                {/* Base Product Image */}
                <div className="relative w-full h-full transition-transform duration-500 ease-out group-hover:scale-108">
                  <Image
                    src={proj.src}
                    alt={proj.alt}
                    fill
                    unoptimized
                    className="object-contain object-center p-3"
                  />
                </div>

                {/* Hover Reveal Image */}
                <div
                  className="absolute inset-0 w-full h-full transition-all duration-500 ease-out opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-105"
                  style={{
                    clipPath: "ellipse(100% 120% at 50% 0%)",
                  }}
                >
                  <Image
                    src={proj.hoverSrc}
                    alt={`${proj.name} reveal`}
                    fill
                    unoptimized
                    className="object-contain object-center p-3 bg-[#090909]"
                  />
                </div>
              </div>

              {/* Quick Add Pill - Crisp Solid White on Hover */}
              <button
                onClick={(e) => handleQuickAdd(e, proj)}
                data-cursor="ADD BAG"
                className="absolute bottom-6 right-6 z-30 opacity-0 group-hover:opacity-100 transition-all duration-200 border-2 border-white bg-white text-black px-3.5 py-1.5 font-mono text-[11px] uppercase font-black tracking-wider hover:bg-black hover:text-white shadow-[0_0_18px_rgba(255,255,255,0.9)] hover:scale-105"
              >
                + BAG
              </button>
            </div>

            {/* 2. Lando-Style Stepped Extender Line - Bold High-Contrast Solid White */}
            <div className="relative w-full flex items-center px-4 -mt-1 mb-2.5">
              <div className="w-24 h-[3.5px] transition-colors duration-300 bg-white group-hover:bg-emerald-400 shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
              <div className="flex-1 h-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
              <span className="font-mono text-xs font-black text-white ml-2.5 px-2.5 py-0.5 border-2 border-white bg-black shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                ₹{proj.price.toLocaleString()}
              </span>
            </div>

            {/* 3. Text Info Row Below Frame - Clean, High Legibility, No Ellipsis Truncation */}
            <div className="px-2 pt-1 flex justify-between items-baseline font-mono gap-2">
              <div className="min-w-0 pr-1">
                <h3 className="font-reality text-xl sm:text-2xl leading-tight text-white group-hover:text-emerald-300 transition-colors font-medium">
                  {proj.name}
                </h3>
                <div className="text-[11px] text-white/90 uppercase tracking-wider font-semibold mt-1">
                  {proj.edition} • {proj.color}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono text-xs font-black text-white block border-2 border-white px-2 py-0.5 bg-black shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                  {proj.year}
                </span>
                <span className="text-[11px] text-white block uppercase font-bold tracking-wider mt-1.5">
                  {proj.tag}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Garment Blueprint Modal */}
      <GarmentBlueprintModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
}
