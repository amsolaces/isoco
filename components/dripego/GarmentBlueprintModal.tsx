"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useReality } from "@/context/RealityThemeContext";
import { useCartStore } from "@/lib/cartStore";

export interface GarmentProduct {
  id: string | number;
  num: string;
  name: string;
  slug: string;
  color: string;
  price: number;
  tag: string;
  availability: string;
  src: string;
  hoverSrc: string;
  alt: string;
  gsm: string;
  weave: string;
  fit: string;
  overview: string;
  keyInnovations: string[];
}

interface GarmentBlueprintModalProps {
  product: GarmentProduct | null;
  onClose: () => void;
}

export default function GarmentBlueprintModal({ product, onClose }: GarmentBlueprintModalProps) {
  const { reality } = useReality();
  const { addItem, setIsOpen } = useCartStore();
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [activeImage, setActiveImage] = useState<string>("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImage(product.src);
      setAdded(false);
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [product, onClose]);

  if (!product) return null;

  const sizeMetrics: Record<string, { chest: string; length: string; shoulder: string }> = {
    S: { chest: "118 cm / 46.5 in", length: "72 cm / 28.3 in", shoulder: "56 cm / 22 in" },
    M: { chest: "124 cm / 48.8 in", length: "74 cm / 29.1 in", shoulder: "58 cm / 22.8 in" },
    L: { chest: "130 cm / 51.2 in", length: "76 cm / 29.9 in", shoulder: "60 cm / 23.6 in" },
    XL: { chest: "136 cm / 53.5 in", length: "78 cm / 30.7 in", shoulder: "62 cm / 24.4 in" },
    XXL: { chest: "142 cm / 55.9 in", length: "80 cm / 31.5 in", shoulder: "64 cm / 25.2 in" },
  };

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedSize}`,
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      size: selectedSize,
      color: product.color,
      thumbnail: product.src,
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setIsOpen(true);
    }, 700);
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 md:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto border p-6 md:p-8 bg-[var(--card-bg)] text-[var(--text-primary)] shadow-2xl transition-all"
        style={{ borderColor: "var(--border-color)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 mb-6 border-b" style={{ borderColor: "var(--border-light)" }}>
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="font-bold border px-1.5 py-0.5" style={{ borderColor: "var(--border-color)" }}>
              {product.num}
            </span>
            <span className="uppercase tracking-widest opacity-60">
              {product.tag} // {product.availability}
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

        {/* Content Layout: Visual Gallery (Left) + Engineering Blueprint (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-8">
          {/* Visual Gallery */}
          <div className="md:col-span-5 flex flex-col gap-3">
            <div className="relative aspect-[3/4] w-full border bg-neutral-900/50 overflow-hidden flex items-center justify-center" style={{ borderColor: "var(--border-color)" }}>
              <Image
                src={activeImage}
                alt={product.name}
                fill
                unoptimized
                className="object-cover object-center"
              />
              <div className="absolute top-2 left-2 text-[9px] font-mono uppercase px-1.5 py-0.5 border bg-[var(--card-bg)]" style={{ borderColor: "var(--border-color)" }}>
                {product.color}
              </div>
            </div>

            {/* Thumbnail switcher */}
            <div className="flex gap-2 font-mono text-[10px] uppercase">
              <button
                onClick={() => setActiveImage(product.src)}
                className={`border px-2 py-1 flex-1 text-center transition-all ${
                  activeImage === product.src ? "bg-[var(--accent-color)] text-[var(--bg-color)] font-bold" : ""
                }`}
                style={{ borderColor: "var(--border-color)" }}
              >
                Front View
              </button>
              <button
                onClick={() => setActiveImage(product.hoverSrc)}
                className={`border px-2 py-1 flex-1 text-center transition-all ${
                  activeImage === product.hoverSrc ? "bg-[var(--accent-color)] text-[var(--bg-color)] font-bold" : ""
                }`}
                style={{ borderColor: "var(--border-color)" }}
              >
                Reverse View
              </button>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div className="mb-4">
              <h2 className="font-reality text-3xl sm:text-4xl md:text-5xl leading-tight mb-1">
                {product.name}
              </h2>
              <div className="flex items-center gap-3 font-mono text-sm mb-4">
                <span className="font-bold text-lg">₹{product.price.toLocaleString()}</span>
                <span className="opacity-50">|</span>
                <span className="opacity-70 uppercase text-xs">{product.color}</span>
              </div>

              <p className="text-xs md:text-sm leading-relaxed opacity-85 mb-6">
                {product.overview}
              </p>
            </div>

            {/* Garment Technical Metrics */}
            <div className="grid grid-cols-3 gap-2.5 p-3.5 border mb-6 bg-[var(--bg-color)] font-mono text-xs" style={{ borderColor: "var(--border-light)" }}>
              <div>
                <span className="text-[9px] uppercase opacity-50 block">Fabric Weight</span>
                <span className="font-bold">{product.gsm}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase opacity-50 block">Knit Type</span>
                <span className="font-bold">{product.weave}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase opacity-50 block">Fit Profile</span>
                <span className="font-bold text-[var(--accent-color)]">{product.fit}</span>
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-6">
              <div className="flex justify-between items-center font-mono text-[10px] uppercase mb-2 opacity-70">
                <span>Select Size</span>
                <span>CHEST: {sizeMetrics[selectedSize].chest}</span>
              </div>
              <div className="grid grid-cols-5 gap-2 font-mono text-xs">
                {["S", "M", "L", "XL", "XXL"].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    data-cursor="SELECT SIZE"
                    className={`border py-2 text-center transition-all ${
                      selectedSize === sz
                        ? "bg-[var(--accent-color)] text-[var(--bg-color)] font-bold shadow-sm"
                        : "hover:border-[var(--accent-color)] bg-[var(--card-bg)]"
                    }`}
                    style={{ borderColor: "var(--border-color)" }}
                  >
                    {sz}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-[10px] font-mono opacity-50">
                Length: {sizeMetrics[selectedSize].length} • Shoulder Drop: {sizeMetrics[selectedSize].shoulder}
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                data-cursor="ADD TO BAG"
                className="flex-1 border py-3 px-6 font-mono text-xs uppercase tracking-widest font-bold transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--bg-color)",
                  borderColor: "var(--border-color)",
                }}
              >
                <span>{added ? "ADDED TO BAG! ✓" : "ACQUIRE PIECE — ADD TO BAG"}</span>
                <span>[+]</span>
              </button>
            </div>
          </div>
        </div>

        {/* Construction Details */}
        <div className="border-t pt-4 font-mono text-xs opacity-80" style={{ borderColor: "var(--border-light)" }}>
          <div className="font-bold uppercase tracking-wider text-[10px] mb-2">
            Key Tailoring & Construction Points
          </div>
          <ul className="space-y-1 text-[11px]">
            {product.keyInnovations.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[var(--accent-color)] font-bold">↳</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
