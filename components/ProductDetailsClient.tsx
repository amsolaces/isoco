"use client";

import { useCartStore } from "@/lib/cartStore";
import { useWishlistStore } from "@/lib/wishlistStore";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Minus,
  Plus,
  ArrowRight,
  ShoppingBag,
  Maximize2,
  X,
  Shield,
  Truck,
  RotateCcw,
  Tag,
  Scale,
  Activity,
  Layers,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

interface ProductDetailsClientProps {
  product: any;
  relatedProducts: any[];
}

export default function ProductDetailsClient({ product, relatedProducts }: ProductDetailsClientProps) {
  const router = useRouter();
  const { addItem, setIsOpen } = useCartStore();

  // Active States
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState("");
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const { toggleItem, hasItem } = useWishlistStore();
  const [mounted, setMounted] = useState(false);
  const { userId } = useAuth();
  const isWishlisted = mounted ? hasItem(product.id) : false;
  const [memberSize, setMemberSize] = useState<string | null>(null);

  // Mobile Gallery States
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const mobileGalleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showFullscreen]);

  const handleGalleryScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollLeft = target.scrollLeft;
    const clientWidth = target.clientWidth;
    if (clientWidth > 0) {
      const index = Math.round(scrollLeft / clientWidth);
      setActiveSlideIdx(index);
    }
  };

  const scrollToSlide = (idx: number) => {
    if (mobileGalleryRef.current) {
      const clientWidth = mobileGalleryRef.current.clientWidth;
      mobileGalleryRef.current.scrollTo({
        left: idx * clientWidth,
        behavior: "smooth"
      });
      setActiveSlideIdx(idx);
    }
  };

  // Accordion open/close states
  const [accordionOpen, setAccordionOpen] = useState<{ [key: string]: boolean }>({
    shipping: false,
    returns: false,
    care: false,
  });

  // Collect all gallery images
  const allImages: string[] = [];
  if (product.thumbnail) allImages.push(product.thumbnail);
  if (product.images && product.images.length > 0) {
    product.images.forEach((img: string) => {
      if (img && !allImages.includes(img)) allImages.push(img);
    });
  }

  useEffect(() => {
    setMounted(true);
    if (allImages.length > 0) {
      setActiveImage(allImages[0]);
    }
    if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
    if (product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0]);
    }

    // Read member size profile to recommend
    const cachedSize = localStorage.getItem("dripego-member-size");
    if (cachedSize && product.sizes && product.sizes.length > 0) {
      try {
        const sizeObj = JSON.parse(cachedSize);
        const { height, weight, fit } = sizeObj;
        let baseSize = "M";
        if (height < 165) {
          baseSize = weight < 55 ? "XS" : "S";
        } else if (height >= 165 && height < 178) {
          baseSize = weight < 70 ? "S" : "M";
        } else if (height >= 178 && height < 188) {
          baseSize = weight < 82 ? "M" : "L";
        } else {
          baseSize = weight < 95 ? "L" : "XL";
        }
        const sizesArr = ["XS", "S", "M", "L", "XL"];
        const baseIdx = sizesArr.indexOf(baseSize);
        let finalSize = baseSize;
        if (fit === "slim" && baseIdx > 0) {
          finalSize = sizesArr[baseIdx - 1];
        } else if (fit === "oversized" && baseIdx < sizesArr.length - 1) {
          finalSize = sizesArr[baseIdx + 1];
        }
        
        if (product.sizes.includes(finalSize)) {
          setMemberSize(finalSize);
        } else {
          setMemberSize(product.sizes[0]);
        }
      } catch (e) {
        console.error("Failed to parse member size profile:", e);
      }
    }

    // Scroll listener for sticky CTA
    function handleScroll() {
      setShowSticky(window.scrollY > 400);
    }
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [product]);

  // Discount Math
  const hasDiscount = product.compare_price && Number(product.compare_price) > Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round(
        ((Number(product.compare_price) - Number(product.price)) / Number(product.compare_price)) * 100
      )
    : 0;

  const [addedFeedback, setAddedFeedback] = useState(false);
  const [fmsHeight, setFmsHeight] = useState(175);
  const [fmsWeight, setFmsWeight] = useState(72);
  const [fmsFit, setFmsFit] = useState<"standard" | "oversized" | "snug">("standard");
  const [showFms, setShowFms] = useState(false);

  // Add to cart helper — works for guests & members
  function handleAddToCart() {
    if (!selectedSize || !selectedColor) {
      alert("Please select both size and color.");
      return;
    }

    addItem({
      id: `${product.id}-${selectedSize}-${selectedColor}`,
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      size: selectedSize,
      color: selectedColor,
      thumbnail: product.thumbnail || allImages[0] || "",
    }, quantity);

    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1800);
    setIsOpen(true);
  }

  // Buy now direct checkout — works for guests & members
  function handleBuyNow() {
    if (!selectedSize || !selectedColor) {
      alert("Please select both size and color.");
      return;
    }

    addItem({
      id: `${product.id}-${selectedSize}-${selectedColor}`,
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      size: selectedSize,
      color: selectedColor,
      thumbnail: product.thumbnail || allImages[0] || "",
    }, quantity);

    router.push("/checkout");
  }

  const toggleAccordion = (section: string) => {
    setAccordionOpen((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <div className="space-y-16 pb-24 lg:pb-16">
      {/* SECTION 1: HERO */}
      <div className="grid gap-10 lg:grid-cols-12">
        {/* LEFT 55%: Media Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* DESKTOP GALLERY (visible only on lg screens) */}
          <div className="hidden lg:block space-y-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0c0c0c] group">
              {activeImage && (
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover transition duration-700 hover:scale-105"
                />
              )}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent" />
              <button
                onClick={() => setShowFullscreen(true)}
                className="absolute right-4 bottom-4 grid size-10 place-items-center rounded-full border border-white/10 bg-black/40 text-white/50 backdrop-blur transition hover:text-white cursor-pointer"
              >
                <Maximize2 size={15} />
              </button>
            </div>

            {/* Thumbnails below */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative size-16 rounded-xl overflow-hidden border transition shrink-0 ${
                      activeImage === img ? "border-white" : "border-white/10 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt="Thumbnail preview" fill sizes="64px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* MOBILE GALLERY (swipeable snap carousel, visible only on mobile/tablet) */}
          <div className="lg:hidden space-y-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0c0c0c]">
              <div 
                ref={mobileGalleryRef}
                onScroll={handleGalleryScroll}
                className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scrollbar-none"
              >
                {allImages.map((img, idx) => (
                  <div key={idx} className="relative h-full w-full shrink-0 snap-start snap-always">
                    <Image
                      src={img}
                      alt={`${product.name} gallery image ${idx}`}
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              {/* Swipe Indicator dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/40 backdrop-blur px-3 py-1.5 rounded-full">
                {allImages.map((_, idx) => (
                  <span 
                    key={idx} 
                    className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                      activeSlideIdx === idx ? "bg-white w-3" : "bg-white/30"
                    }`} 
                  />
                ))}
              </div>
            </div>

            {/* Horizontal thumbnail carousel */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => scrollToSlide(idx)}
                    className={`relative size-14 rounded-xl overflow-hidden border transition shrink-0 ${
                      activeSlideIdx === idx ? "border-white" : "border-white/10 opacity-60"
                    }`}
                  >
                    <Image src={img} alt="Thumbnail preview" fill sizes="56px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT 45%: Buying Box */}
        <div className="lg:col-span-5 space-y-8 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Header / Info */}
            <div className="space-y-3">
              <span className="inline-flex rounded-full bg-white/5 border border-white/10 px-3.5 py-1 text-[9px] font-bold tracking-[0.2em] text-white/60 uppercase">
                {product.collection || "DROP 001"}
              </span>

              <h1 className="text-4xl font-black uppercase tracking-tight text-white leading-none">
                {product.name}
              </h1>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-2xl font-bold text-white">
                  ₹{Number(product.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-white/30 line-through font-mono">
                    ₹{Number(product.compare_price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>

              {/* Stock status */}
              <div className="flex items-center gap-2 pt-1">
                <span className={`h-2 w-2 rounded-full ${isOutOfStock ? "bg-red-500" : "bg-white/80"}`} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                  {isOutOfStock ? "Out Of Stock" : "In Stock"}
                </span>
              </div>
            </div>

            <div className="h-px bg-white/[0.06]" />

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Select Size</span>
                  <button
                    onClick={() => setShowFms(!showFms)}
                    className="text-[10px] tracking-wider uppercase text-white/50 hover:text-white transition underline underline-offset-4"
                  >
                    {showFms ? "Close Fit Assistant" : "Find My Size"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-10 w-14 rounded-xl border text-xs tracking-wider transition ${
                        selectedSize === size
                          ? "bg-white text-black border-white font-bold shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                          : "border-white/10 bg-white/[0.01] text-white/50 hover:text-white"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">Select Color</span>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`h-9 rounded-xl border px-4 text-[10px] font-semibold uppercase tracking-wider transition ${
                        selectedColor === color
                          ? "bg-white text-black border-white"
                          : "border-white/10 bg-white/[0.01] text-white/50 hover:text-white"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">Quantity</span>
              <div className="flex items-center border border-white/[0.08] bg-black rounded-xl h-11 px-2 w-32">
                <button
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(quantity - 1)}
                  className="size-7 flex items-center justify-center text-white/40 hover:text-white disabled:opacity-30 cursor-pointer"
                >
                  <Minus size={12} />
                </button>
                <span className="flex-1 text-center text-xs font-semibold text-white">
                  {quantity}
                </span>
                <button
                  disabled={isOutOfStock}
                  onClick={() => setQuantity(quantity + 1)}
                  className="size-7 flex items-center justify-center text-white/40 hover:text-white disabled:opacity-30 cursor-pointer"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>

            {/* Quick trust badges */}
            <div className="pt-2 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/[0.05] bg-white/[0.01] p-3.5 flex items-center gap-3">
                <Truck size={14} className="text-white/40" />
                <div>
                  <span className="text-[8px] font-bold tracking-wider text-white/30 uppercase block">Shipping</span>
                  <span className="text-[9px] font-bold text-white/70 uppercase block">Free over ₹5,000</span>
                </div>
              </div>
              <div className="rounded-xl border border-white/[0.05] bg-white/[0.01] p-3.5 flex items-center gap-3">
                <RotateCcw size={14} className="text-white/40" />
                <div>
                  <span className="text-[8px] font-bold tracking-wider text-white/30 uppercase block">Returns</span>
                  <span className="text-[9px] font-bold text-white/70 uppercase block">7-day collection</span>
                </div>
              </div>
            </div>

            {/* Product description in buying box */}
            <div className="pt-4 border-t border-white/[0.05] mt-4 space-y-2">
              <span className="text-[8px] font-bold tracking-widest text-white/30 uppercase block">Product Details</span>
              <p className="text-[11px] leading-relaxed text-white/60 uppercase font-mono tracking-wide">
                {product.short_description || product.description || "Luxury capsule piece. Custom structural silhouette, heavy-weight drape, and signature branding accents."}
              </p>
            </div>
          </div>

          {/* Action Buttons — ADD TO BAG is Primary */}
          <div className="space-y-3 pt-6 border-t border-white/[0.06]">
            <div className="flex gap-3">
              <button
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="flex h-12 flex-1 items-center justify-center gap-2.5 rounded-xl bg-white text-[11px] font-bold uppercase tracking-[0.14em] text-black transition hover:bg-white/88 disabled:opacity-50 cursor-pointer"
              >
                <span>{addedFeedback ? "Added To Bag" : "Add To Bag"}</span>
                {!addedFeedback && <ShoppingBag size={14} strokeWidth={2.2} />}
              </button>
              <button
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className="flex h-12 px-6 items-center justify-center rounded-xl border border-white/20 bg-white/[0.04] text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80 hover:bg-white/10 hover:text-white transition disabled:opacity-50 cursor-pointer"
              >
                <span>Buy Now</span>
              </button>
              <button
                onClick={() => {
                  toggleItem({
                    id: product.id,
                    product_id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: Number(product.price),
                    thumbnail: product.thumbnail || allImages[0] || "",
                    gender: product.gender,
                    availability: product.stock_quantity > 0 ? "Available Now" : "Out of Stock"
                  });
                }}
                aria-label="Wishlist"
                className={`grid size-12 place-items-center rounded-xl border transition cursor-pointer ${
                  isWishlisted ? "border-white bg-white text-black" : "border-white/10 text-white/50 hover:text-white"
                }`}
              >
                <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: DESCRIPTION / MANIFESTO & SUGGESTIONS */}
      <div className="border-t border-white/[0.06] pt-16 grid gap-8 md:grid-cols-12">
        <div className="md:col-span-4 md:sticky md:top-28 self-start">
          <h2 className="text-3xl font-black uppercase tracking-tight text-white leading-none">
            They Notice.
            <br />
            <span className="text-white/25">Before</span>
            <br />
            You Speak.
          </h2>
        </div>
        <div className="md:col-span-8">
          {relatedProducts.length > 0 ? (
            <div className="space-y-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 block mb-2">Related Capsules</span>
              <div className="grid gap-6 sm:grid-cols-2">
                {relatedProducts.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/products/${p.slug}`}
                    className="group relative block overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#0c0c0c] transition hover:border-white/18"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <Image
                        src={p.thumbnail || "/products/tee_front.webp"}
                        alt={p.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                    <div className="p-4 flex items-center justify-between border-t border-white/[0.05]">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white uppercase truncate">{p.name}</p>
                        <p className="text-[10px] text-white/35 mt-0.5">₹{Number(p.price).toLocaleString("en-IN")}</p>
                      </div>
                      <div className="rounded-full bg-white/[0.03] border border-white/10 p-2 text-white/30 transition group-hover:bg-white group-hover:text-black">
                        <ArrowRight size={12} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-white/60 leading-relaxed font-mono whitespace-pre-line">
              {product.description || "Luxury fashion design constructed with premium materials and custom structural silhouettes."}
            </p>
          )}
        </div>
      </div>

      {/* SECTION 3: FEATURES GRID */}
      <div className="border-t border-white/[0.06] pt-16">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-8">Product Specifications</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Fabric", value: product.material || "100% Combed Cotton", icon: Tag },
            { label: "Weight", value: "300 GSM Heavyweight", icon: Scale },
            { label: "Fit", value: "Relaxed Boxy Cut", icon: Activity },
            { label: "Construction", value: "Panelled Blind Hem Structure", icon: Layers },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-5 flex items-start gap-4">
                <div className="rounded-lg bg-white/[0.03] border border-white/10 p-2.5">
                  <Icon size={16} className="text-white/40" />
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/30 block mb-0.5">{item.label}</span>
                  <span className="text-xs font-bold text-white uppercase">{item.value}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: SIZE GUIDE */}
      <div className="border-t border-white/[0.06] pt-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Size Guide & Fit Guidance</h3>
            <p className="text-xs text-white/40 mt-1">Measurements in inches and centimetres. Boxy streetwear silhouette.</p>
          </div>
          <button
            onClick={() => setShowFms(!showFms)}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/70 hover:text-white border border-white/15 px-4 py-2 rounded-xl bg-white/[0.02] transition self-start sm:self-auto cursor-pointer"
          >
            <span>{showFms ? "Hide Fit Assistant" : "Find My Size"}</span>
          </button>
        </div>

        {/* Self-contained Interactive Find My Size Tool (No account required) */}
        <AnimatePresence>
          {showFms && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="rounded-2xl border border-white/10 bg-[#0e0e0e] p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white">Interactive Fit Assistant</h4>
                    <p className="text-[11px] text-white/40 mt-0.5">Input your height and weight to calculate your ideal DRIPEGO size.</p>
                  </div>
                  <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Instant Recommendation</span>
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Height: {fmsHeight} cm</label>
                    <input
                      type="range"
                      min={150}
                      max={205}
                      value={fmsHeight}
                      onChange={(e) => setFmsHeight(Number(e.target.value))}
                      className="w-full accent-white bg-white/10 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Weight: {fmsWeight} kg</label>
                    <input
                      type="range"
                      min={45}
                      max={120}
                      value={fmsWeight}
                      onChange={(e) => setFmsWeight(Number(e.target.value))}
                      className="w-full accent-white bg-white/10 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Preferred Silhouette</label>
                    <div className="flex gap-2">
                      {(["snug", "standard", "oversized"] as const).map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFmsFit(f)}
                          className={`flex-1 py-1.5 text-[9px] font-bold uppercase rounded-lg border transition cursor-pointer ${
                            fmsFit === f ? "bg-white text-black border-white" : "border-white/10 text-white/50 hover:text-white"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Calculation Output */}
                {(() => {
                  let base = "M";
                  if (fmsHeight < 165) base = fmsWeight < 55 ? "XS" : "S";
                  else if (fmsHeight < 178) base = fmsWeight < 72 ? "S" : "M";
                  else if (fmsHeight < 188) base = fmsWeight < 84 ? "M" : "L";
                  else base = fmsWeight < 96 ? "L" : "XL";
                  const order = ["XS", "S", "M", "L", "XL"];
                  const idx = order.indexOf(base);
                  let calculated = base;
                  if (fmsFit === "oversized" && idx < order.length - 1) calculated = order[idx + 1];
                  if (fmsFit === "snug" && idx > 0) calculated = order[idx - 1];

                  return (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/[0.06]">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-white/50">Suggested Size:</span>
                        <span className="text-xl font-black text-white font-mono bg-white/10 px-3 py-1 rounded-lg border border-white/20">
                          {calculated}
                        </span>
                        <span className="text-[11px] text-white/40 hidden sm:inline">
                          — Tailored for a {fmsFit} drape on your frame
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedSize(calculated)}
                        className="w-full sm:w-auto px-5 py-2 rounded-xl bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-white/88 transition cursor-pointer"
                      >
                        Select Size {calculated}
                      </button>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Size Chart Table */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] font-bold uppercase tracking-wider text-white/30">
                <th className="pb-3 pr-4">Size (Unisex)</th>
                <th className="pb-3 px-4">Chest (inches)</th>
                <th className="pb-3 px-4">Length (cm)</th>
                <th className="pb-3 pl-4 text-right">Shoulder (cm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-white/60">
              {[
                { size: "XS", chest: "36 - 38", length: "68", shoulder: "43" },
                { size: "S", chest: "38 - 40", length: "70", shoulder: "45" },
                { size: "M", chest: "40 - 42", length: "72", shoulder: "47" },
                { size: "L", chest: "42 - 44", length: "74", shoulder: "49" },
                { size: "XL", chest: "44 - 46", length: "76", shoulder: "51" },
              ].map((row) => (
                <tr key={row.size}>
                  <td className="py-3 pr-4 font-bold text-white">{row.size}</td>
                  <td className="py-3 px-4">{row.chest}</td>
                  <td className="py-3 px-4">{row.length}</td>
                  <td className="py-3 pl-4 text-right">{row.shoulder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 5: LIFESTYLE GALLERY */}
      {product.images && product.images.length > 0 && (
        <div className="border-t border-white/[0.06] pt-16">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-8">Lifestyle Capture</h3>
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 space-y-4">
            {product.images.map((img: string, idx: number) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#0c0c0c] break-inside-avoid"
              >
                <img src={img} alt={`Lifestyle shot ${idx}`} className="object-cover w-full h-auto max-h-[450px] transition duration-700 hover:scale-103" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 6: SHIPPING AND RETURNS ACCORDIONS */}
      <div className="border-t border-white/[0.06] pt-16 grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-2">Policies & Support</h3>
          
          {/* Shipping Accordion */}
          <div className="border border-white/[0.06] rounded-xl overflow-hidden bg-white/[0.01]">
            <button
              onClick={() => toggleAccordion("shipping")}
              className="flex items-center justify-between w-full p-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/[0.02] cursor-pointer"
            >
              <span>Shipping Information</span>
              <span className="text-white/40">{accordionOpen.shipping ? "—" : "+"}</span>
            </button>
            <AnimatePresence>
              {accordionOpen.shipping && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden border-t border-white/[0.05]"
                >
                  <p className="p-4 text-xs text-white/45 leading-relaxed">
                    Standard delivery across India within 3-5 business days. Free shipping on all orders exceeding ₹5,000. Under-threshold orders incur a flat ₹100 fee. All shipments are processed in custom matte containers.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Returns Accordion */}
          <div className="border border-white/[0.06] rounded-xl overflow-hidden bg-white/[0.01]">
            <button
              onClick={() => toggleAccordion("returns")}
              className="flex items-center justify-between w-full p-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/[0.02] cursor-pointer"
            >
              <span>Returns & Exchanges</span>
              <span className="text-white/40">{accordionOpen.returns ? "—" : "+"}</span>
            </button>
            <AnimatePresence>
              {accordionOpen.returns && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden border-t border-white/[0.05]"
                >
                  <p className="p-4 text-xs text-white/45 leading-relaxed">
                    We offer a 7-day return and exchange policy for unused items in original packaging. To submit a request, contact customer support or file directly via your profile order history. Returns will be collected via courier.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Care Accordion */}
          <div className="border border-white/[0.06] rounded-xl overflow-hidden bg-white/[0.01]">
            <button
              onClick={() => toggleAccordion("care")}
              className="flex items-center justify-between w-full p-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/[0.02] cursor-pointer"
            >
              <span>Care Instructions</span>
              <span className="text-white/40">{accordionOpen.care ? "—" : "+"}</span>
            </button>
            <AnimatePresence>
              {accordionOpen.care && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden border-t border-white/[0.05]"
                >
                  <p className="p-4 text-xs text-white/45 leading-relaxed">
                    Machine wash cold with similar colors. Turn the garment inside out before washing to protect print details. Do not bleach. Hang dry to maintain original silhouette structure. Iron low if needed; avoid print areas.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* BRAND MANIFESTO */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-8 flex flex-col justify-center text-center">
          <p className="text-[10px] font-bold tracking-[0.5em] text-white/20 uppercase mb-4">DRIPEGO MANIFESTO</p>
          <h4 className="text-3xl font-black uppercase tracking-tight text-white leading-none mb-4">
            THEY NOTICE.
            <br />
            <span className="text-white/35">BEFORE</span>
            <br />
            YOU SPEAK.
          </h4>
          <p className="text-xs text-white/40 leading-relaxed max-w-[360px] mx-auto">
            Visual statements are absolute. Clothing is an extension of authority. We create structured silhouettes for those who define the room.
          </p>
        </div>
      </div>

      {/* FULLSCREEN PREVIEW MODAL */}
      <AnimatePresence>
        {showFullscreen && activeImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFullscreen(false)}
              className="fixed inset-0 bg-black"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="relative z-10 w-full max-w-[80vw] aspect-[3/4] max-h-[85vh] rounded-2xl overflow-hidden border border-white/10"
            >
              <Image src={activeImage} alt={product.name} fill className="object-contain size-full bg-black" />
              <button
                onClick={() => setShowFullscreen(false)}
                className="absolute top-4 right-4 grid size-10 place-items-center rounded-full border border-white/10 bg-black/40 text-white/60 backdrop-blur transition hover:text-white cursor-pointer"
              >
                <X size={15} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STICKY FLOATING PURCHASE BAR — DESKTOP */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:flex fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#0c0c0c]/90 backdrop-blur-md px-6 py-4 items-center justify-between"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative size-12 rounded-lg overflow-hidden border border-white/10 shrink-0">
                <Image src={product.thumbnail || allImages[0]} alt={product.name} fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white uppercase truncate tracking-wider">{product.name}</h4>
                <p className="text-[10px] text-white/35 mt-0.5">
                  ₹{Number(product.price).toLocaleString("en-IN")}
                  {selectedSize ? ` • Size: ${selectedSize}` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-6 text-[10px] font-bold uppercase tracking-widest text-black hover:bg-white/88 transition cursor-pointer"
              >
                <span>{addedFeedback ? "Added To Bag" : "Add To Bag"}</span>
                {!addedFeedback && <ShoppingBag size={12} strokeWidth={2.4} />}
              </button>
              <button
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/[0.04] px-5 text-[10px] font-semibold uppercase tracking-widest text-white/80 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                <span>Buy Now</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PERSISTENT STICKY PURCHASE BAR — MOBILE */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#0c0c0c]/95 backdrop-blur-md px-5 py-3.5 flex items-center justify-between">
        <div className="min-w-0 pr-3">
          <h4 className="text-[10px] font-bold text-white/45 uppercase tracking-widest truncate">{product.name}</h4>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-sm font-bold text-white">
              ₹{Number(product.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[9px] font-bold text-white/30 uppercase">
              {selectedSize ? `• ${selectedSize}` : "• Select Size"}
            </span>
          </div>
        </div>

        <button
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-[10px] font-bold uppercase tracking-widest text-black hover:bg-white/88 transition cursor-pointer"
        >
          <span>{addedFeedback ? "ADDED" : "ADD TO BAG"}</span>
          {!addedFeedback && <ShoppingBag size={12} strokeWidth={2.4} />}
        </button>
      </div>
    </div>
  );
}
