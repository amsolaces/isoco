"use client";
import AnimatedSection from "@/components/AnimatedSection";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@clerk/nextjs";
import { useWishlistStore } from "@/lib/wishlistStore";
import { motion } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const products = [
  {
    id: 1,
    name: "Statement Oversized Tee",
    slug: "statement-tee",
    color: "Washed Obsidian",
    src: "/products/tee_front.webp",
    hoverSrc: "/products/tee_back.webp",
    alt: "DRIPEGO statement tee front",
    tag: "Drop 001",
    availability: "Available Now",
    price: 9600.00,
    gender: "unisex",
  },
  {
    id: 2,
    name: "Signature Back Tee",
    slug: "signature-back-tee",
    color: "Matte Carbon",
    src: "/products/tee_back.webp",
    hoverSrc: "/products/tee_front.webp",
    alt: "DRIPEGO statement tee back",
    tag: "Drop 001",
    availability: "Available Now",
    price: 9600.00,
    gender: "unisex",
  },
  {
    id: 3,
    name: "Studio Fold Tee",
    slug: "studio-fold-minimal-tee",
    color: "Deep Shadow",
    src: "/products/tee_folded.webp",
    hoverSrc: "/products/tee_hanging.webp",
    alt: "DRIPEGO folded tee",
    tag: "Drop 001",
    availability: "Limited Archive",
    price: 9600.00,
    gender: "unisex",
  },
  {
    id: 4,
    name: "Campaign Hang Tee",
    slug: "campaign-exclusive-hang-tee",
    color: "Pitch Black",
    src: "/products/tee_hanging.webp",
    hoverSrc: "/products/tee_folded.webp",
    alt: "DRIPEGO hanging tee",
    tag: "Drop 001",
    availability: "Available Now",
    price: 9600.00,
    gender: "unisex",
  },
];

export default function ProductShowcase() {
  const router = useRouter();
  const [displayProducts, setDisplayProducts] = useState<any[]>(products);
  const { toggleItem, hasItem } = useWishlistStore();
  const [mounted, setMounted] = useState(false);
  const { userId } = useAuth();

  useEffect(() => {
    setMounted(true);
    async function fetchProducts() {
      if (!supabase) return;
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("status", "published")
        .limit(4);

      if (data && data.length > 0) {
        const mapped = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          color: p.color || "Washed Obsidian",
          src: p.thumbnail || "/products/tee_front.webp",
          hoverSrc: p.images?.[0] || p.thumbnail || "/products/tee_back.webp",
          alt: p.name,
          tag: p.collection || "New Arrival",
          availability: p.stock_quantity > 0 ? "Available Now" : "Out of Stock",
          price: Number(p.price),
          gender: p.gender || "unisex",
        }));
        setDisplayProducts(mapped);
      }
    }
    fetchProducts();
  }, []);
  return (
    <section id="product" className="px-4 py-16 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1400px]">

        <AnimatedSection className="mb-8 flex items-start justify-between">
          <p className="text-[10px] font-semibold tracking-[0.5em] text-white/30 uppercase">Selected Archive</p>
          <p className="text-[10px] font-semibold tracking-[0.5em] text-white/30 uppercase">Drop 001</p>
        </AnimatedSection>

        <AnimatedSection className="mb-8 text-center" delay={0.05}>
          <h2 className="text-5xl font-black uppercase leading-none tracking-tight text-white sm:text-7xl">
            DROP 001
            <br />
            <span className="text-white/30">ARCHIVE SILHOUETTES.</span>
          </h2>
        </AnimatedSection>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {displayProducts.map((product, index) => {
            const isWishlisted = mounted ? hasItem(product.id) : false;
            return (
              <AnimatedSection key={product.name + index} delay={index * 0.06}>
                <motion.article
                  className="group relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#0b0b0b] transition-all duration-500 hover:border-white/[0.18] hover:shadow-[0_8px_40px_rgba(255,255,255,0.04)]"
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Link href={`/products/${product.slug || "statement-tee"}`} className="absolute inset-0 z-0">
                      <motion.div className="absolute inset-0" whileHover={{ scale: 1.04 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
                        <Image src={product.src} alt={product.alt} fill sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,25vw" className="object-cover transition-opacity duration-700 group-hover:opacity-0 animate-fade-in" />
                        <Image src={product.hoverSrc} alt={product.alt} fill sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,25vw" className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                      </motion.div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </Link>
                    <span className="absolute left-3 top-3 pointer-events-none rounded-full border border-white/[0.1] bg-black/50 px-3 py-1 text-[9px] font-semibold tracking-[0.18em] text-white/60 backdrop-blur uppercase">
                      {product.tag}
                    </span>
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
                      aria-label="Save"
                      className={`absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full border backdrop-blur transition-all duration-300 cursor-pointer ${
                        isWishlisted
                          ? "border-white bg-white text-black"
                          : "border-white/[0.1] bg-black/40 text-white/30 hover:border-white/20 hover:text-white/75"
                      }`}
                    >
                      <Heart size={13} fill={isWishlisted ? "currentColor" : "none"} strokeWidth={1.5} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between px-4 py-4">
                    <Link href={`/products/${product.slug || "statement-tee"}`} className="flex-1 min-w-0 pr-2">
                      <p className="text-[11px] font-semibold tracking-[0.05em] text-white/80 uppercase truncate max-w-[180px]">{product.name}</p>
                      <p className="mt-1 text-[10px] font-medium tracking-[0.08em] text-white/35 uppercase">
                        {product.color || "Obsidian"} • ₹{Number(product.price).toLocaleString("en-IN")}
                      </p>
                    </Link>
                    <Link href={`/products/${product.slug || "statement-tee"}`} aria-label={`View ${product.name}`} className="hidden md:grid size-8 place-items-center rounded-full border border-white/[0.1] bg-white/[0.04] text-white/30 transition-all hover:bg-white hover:text-black">
                      <ArrowRight size={13} strokeWidth={2} />
                    </Link>
                  </div>

                  {/* Mobile Action CTA */}
                  <div className="md:hidden border-t border-white/[0.05] bg-[#0a0a0a] px-4 pb-4 pt-1">
                    <Link
                      href={`/products/${product.slug || "statement-tee"}`}
                      className="flex h-12 w-full items-center justify-center rounded-xl bg-white text-[11px] font-bold uppercase tracking-widest text-black transition hover:bg-white/88"
                    >
                      View Details
                    </Link>
                  </div>
                </motion.article>
              </AnimatedSection>
            );
          })}
        </div>

        <div className="mt-12 flex justify-center">
          <AnimatedSection delay={0.2}>
            <Link
              href="/products"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-white/10 bg-white/[0.02] px-8 py-4 text-xs font-semibold tracking-[0.2em] text-white uppercase transition-all duration-300 hover:border-white/30 hover:bg-white hover:text-black hover:shadow-[0_0_35px_rgba(255,255,255,0.06)]"
            >
              <span className="relative z-10">Access Inventory</span>
              <ArrowRight size={13} strokeWidth={2} className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
