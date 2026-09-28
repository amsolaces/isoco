"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@clerk/nextjs";
import { useWishlistStore } from "@/lib/wishlistStore";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Heart, Search, SlidersHorizontal, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AnimatedSection from "./AnimatedSection";

// Mock products database for fallback when Supabase is not connected
const mockProducts = [
  {
    id: 1,
    name: "DROP 001 STATEMENT TEE",
    slug: "statement-tee",
    src: "/products/tee_front.webp",
    hoverSrc: "/products/tee_back.webp",
    tag: "Drop 001",
    availability: "Available Now",
    price: 9600.00,
    gender: "unisex",
    stock_quantity: 12,
  },
  {
    id: 2,
    name: "DROP 001 SIGNATURE BACK TEE",
    slug: "signature-back-tee",
    src: "/products/tee_back.webp",
    hoverSrc: "/products/tee_front.webp",
    tag: "Drop 001",
    availability: "Available Now",
    price: 9600.00,
    gender: "unisex",
    stock_quantity: 10,
  },
  {
    id: 3,
    name: "STUDIO FOLD MINIMAL TEE",
    slug: "studio-fold-minimal-tee",
    src: "/products/tee_folded.webp",
    hoverSrc: "/products/tee_hanging.webp",
    tag: "Drop 001",
    availability: "Available Now",
    price: 9600.00,
    gender: "men",
    stock_quantity: 8,
  },
  {
    id: 4,
    name: "CAMPAIGN EXCLUSIVE HANG TEE",
    slug: "campaign-exclusive-hang-tee",
    src: "/products/tee_hanging.webp",
    hoverSrc: "/products/tee_folded.webp",
    tag: "Drop 001",
    availability: "Available Now",
    price: 9600.00,
    gender: "unisex",
    stock_quantity: 6,
  },
  {
    id: 5,
    name: "ARCHIVE FOLD SILHOUETTE TEE",
    slug: "archive-fold-silhouette-tee",
    src: "/products/tee_folded.webp",
    hoverSrc: "/products/tee_front.webp",
    tag: "Drop 001",
    availability: "Available Now",
    price: 9600.00,
    gender: "men",
    stock_quantity: 15,
  },
  {
    id: 6,
    name: "ESSENTIAL HEAVYWEIGHT TEE",
    slug: "essential-heavyweight-tee",
    src: "/products/tee_front.webp",
    hoverSrc: "/products/tee_hanging.webp",
    tag: "Drop 001",
    availability: "Available Now",
    price: 9600.00,
    gender: "women",
    stock_quantity: 7,
  },
];

export default function ProductsContent() {
  const router = useRouter();
  const { toggleItem, hasItem } = useWishlistStore();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { userId } = useAuth();
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    setMounted(true);

    async function loadProducts() {
      setLoading(true);
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("status", "published");

          if (!error && data && data.length > 0) {
            const mapped = data.map((p: any) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              src: p.thumbnail || "/products/tee_front.webp",
              hoverSrc: p.images?.[0] || p.thumbnail || "/products/tee_back.webp",
              tag: p.collection || "New Arrival",
              availability: p.stock_quantity > 0 ? "Available Now" : "Out of Stock",
              price: Number(p.price),
              gender: p.gender || "unisex",
              stock_quantity: p.stock_quantity,
            }));
            setProducts(mapped);
            setFilteredProducts(mapped);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to load products from database:", err);
      }
      
      // Fallback
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setLoading(false);
    }

    loadProducts();

  }, []);

  // Handle Filtering & Sorting
  useEffect(() => {
    let result = [...products];

    // Search query filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.tag && p.tag.toLowerCase().includes(q))
      );
    }

    // Gender/Category filter
    if (selectedGender !== "all") {
      result = result.filter(
        (p) => p.gender.toLowerCase() === selectedGender.toLowerCase()
      );
    }

    // Sorting logic
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "stock") {
      result.sort((a, b) => b.stock_quantity - a.stock_quantity);
    }

    setFilteredProducts(result);
  }, [searchQuery, selectedGender, sortBy, products]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedGender("all");
    setSortBy("default");
  };

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-white/[0.08] pb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            <p className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">
              DRIPEGO ARCHIVE
            </p>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-white sm:text-6xl lg:text-7xl leading-none">
            INVENTORY
          </h1>
          <p className="mt-4 text-xs tracking-wide text-white/50 max-w-md uppercase font-light">
            Every piece curated, designed, and structured for the silent statement.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold tracking-wider text-white/30 uppercase">
          <span>Total Pieces / {filteredProducts.length}</span>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="mb-10 grid gap-4 lg:grid-cols-[1fr_auto]">
        {/* Filters Wrapper */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Gender Tags */}
          <div className="flex rounded-full border border-white/[0.08] bg-[#0c0c0c] p-1">
            {["all", "men", "women", "unisex"].map((gender) => (
              <button
                key={gender}
                onClick={() => setSelectedGender(gender)}
                className={`rounded-full px-5 py-2 text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${
                  selectedGender === gender
                    ? "bg-white text-black"
                    : "text-white/45 hover:text-white/80"
                }`}
              >
                {gender}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none rounded-full border border-white/[0.08] bg-[#0c0c0c] px-6 py-3 pr-10 text-[10px] font-bold tracking-widest uppercase text-white/60 outline-none transition duration-300 hover:border-white/20 hover:text-white focus:border-white/30"
            >
              <option value="default">Sort / Default</option>
              <option value="price-asc">Price / Low to High</option>
              <option value="price-desc">Price / High to Low</option>
              <option value="stock">Availability</option>
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/30">
              <SlidersHorizontal size={10} />
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchQuery || selectedGender !== "all" || sortBy !== "default") && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-3 text-[10px] font-bold tracking-widest uppercase text-white/70 transition duration-300"
            >
              <RefreshCw size={10} />
              Reset Filters
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md w-full">
          <input
            type="text"
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-white/[0.08] bg-[#0c0c0c] px-6 py-3 pl-12 text-xs text-white placeholder-white/30 outline-none transition duration-300 hover:border-white/20 focus:border-white/30 focus:bg-black"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
            <Search size={14} />
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex h-96 flex-col items-center justify-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white" />
          <p className="text-[10px] font-semibold tracking-widest text-white/30 uppercase animate-pulse">
            Accessing Vault...
          </p>
        </div>
      ) : (
        <>
          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex h-[320px] flex-col items-center justify-center rounded-[24px] border border-dashed border-white/[0.08] bg-[#090909]/40 text-center p-8"
            >
              <p className="text-sm font-semibold tracking-wide text-white/50 uppercase">
                No Pieces Found
              </p>
              <p className="mt-2 text-xs text-white/30 max-w-xs leading-relaxed uppercase font-light">
                We couldn't find any items matching your search or filters.
              </p>
              <button
                onClick={clearFilters}
                className="mt-6 rounded-full bg-white px-6 py-2.5 text-[10px] font-bold tracking-widest text-black uppercase transition hover:bg-white/80"
              >
                View Full Inventory
              </button>
            </motion.div>
          )}

          {/* Grid Layout */}
          <motion.div
            layout
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, idx) => {
                const isWishlisted = mounted ? hasItem(product.id) : false;
                return (
                  <motion.article
                  layout
                  key={product.id + "-" + product.name}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative flex flex-col overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#0b0b0b] transition-all duration-500 hover:border-white/[0.18] hover:shadow-[0_8px_40px_rgba(255,255,255,0.03)]"
                >
                  {/* Image wrapper */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Link
                      href={`/products/${product.slug || "statement-tee"}`}
                      className="absolute inset-0 z-0"
                    >
                      <motion.div
                        className="absolute inset-0"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <Image
                          src={product.src}
                          alt={product.name}
                          fill
                          sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
                          className="object-cover transition-opacity duration-700 group-hover:opacity-0"
                        />
                        <Image
                          src={product.hoverSrc}
                          alt={product.name}
                          fill
                          sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
                          className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                        />
                      </motion.div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </Link>

                    {/* Tag badge */}
                    <span className="absolute left-4 top-4 rounded-full border border-white/[0.08] bg-black/55 px-3 py-1.5 text-[9px] font-bold tracking-[0.18em] text-white/70 backdrop-blur uppercase">
                      {product.tag}
                    </span>

                    {/* Gender badge */}
                    <span className="absolute left-4 bottom-4 rounded-full border border-white/[0.05] bg-black/40 px-3 py-1 text-[8px] font-bold tracking-wider text-white/50 backdrop-blur uppercase">
                      {product.gender}
                    </span>

                    {/* Favorite Button */}
                    <button
                      onClick={() => {
                        toggleItem({
                          id: product.id,
                          product_id: product.id,
                          name: product.name,
                          slug: product.slug,
                          price: product.price,
                          thumbnail: product.src,
                          gender: product.gender,
                          availability: product.availability,
                        });
                      }}
                      suppressHydrationWarning
                      aria-label="Save Item"
                      className={`absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full border backdrop-blur transition-all duration-300 cursor-pointer ${
                        isWishlisted
                          ? "border-white bg-white text-black"
                          : "border-white/[0.08] bg-black/50 text-white/30 hover:border-white/20 hover:text-white/80"
                      }`}
                    >
                      <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Info footer */}
                  <div className="flex items-center justify-between border-t border-white/[0.05] px-5 py-4 bg-[#0a0a0a]">
                    <Link
                      href={`/products/${product.slug || "statement-tee"}`}
                      className="flex-1 min-w-0 pr-3"
                    >
                      <p className="text-[11px] font-bold tracking-wider text-white/80 uppercase truncate">
                        {product.name}
                      </p>
                      <p className="mt-1 text-[10px] tracking-widest text-white/30 uppercase font-semibold">
                        ₹{product.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })} • {product.availability}
                      </p>
                    </Link>
                    <Link
                      href={`/products/${product.slug || "statement-tee"}`}
                      aria-label={`View ${product.name}`}
                      className="hidden md:grid size-9 place-items-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white/40 transition-all duration-300 hover:bg-white hover:text-black"
                    >
                      <ArrowRight size={14} strokeWidth={2} />
                    </Link>
                  </div>

                  {/* Mobile Mobile Action CTA */}
                  <div className="md:hidden border-t border-white/[0.05] bg-[#0a0a0a] px-5 pb-4 pt-1">
                    <Link
                      href={`/products/${product.slug || "statement-tee"}`}
                      className="flex h-12 w-full items-center justify-center rounded-xl bg-white text-[11px] font-bold uppercase tracking-widest text-black transition hover:bg-white/88"
                    >
                      View Details
                    </Link>
                  </div>
                </motion.article>
              );})}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </div>
  );
}
