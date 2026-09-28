import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import MenContent from "@/components/MenContent";
import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Men — DRIPEGO",
  description: "Men's collection. Built for those who show up every day.",
};

const products = [
  {
    id: 101,
    name: "Drop 001 Statement Tee",
    slug: "statement-tee",
    src: "/products/tee_front.webp",
    alt: "DRIPEGO men statement tee",
    tag: "Drop 001",
    price: 9600.00,
    gender: "men",
    availability: "Available Now",
  },
  {
    id: 102,
    name: "Drop 001 Signature Back Tee",
    slug: "signature-back-tee",
    src: "/products/tee_back.webp",
    alt: "DRIPEGO men back tee",
    tag: "Drop 001",
    price: 9600.00,
    gender: "men",
    availability: "Available Now",
  },
  {
    id: 103,
    name: "Drop 001 Studio Fold Minimal Tee",
    slug: "studio-fold-minimal-tee",
    src: "/products/tee_folded.webp",
    alt: "DRIPEGO men folded tee",
    tag: "Drop 001",
    price: 9600.00,
    gender: "men",
    availability: "Available Now",
  },
];

export default async function MenPage() {
  let displayProducts = products;

  if (supabase) {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("status", "published")
      .or("gender.eq.men,gender.eq.unisex");

    if (data && data.length > 0) {
      displayProducts = data.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        src: p.thumbnail || "/products/tee_front.webp",
        alt: p.name,
        tag: p.collection || "New Arrival",
        price: Number(p.price),
        gender: p.gender || "men",
        availability: p.stock_quantity > 0 ? "Available Now" : "Out of Stock",
      }));
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#080808] text-[#f0ede8]">
        {/* Hero banner */}
        <section className="relative flex min-h-[52vh] items-end overflow-hidden px-4 pb-14 pt-36 sm:px-6 lg:px-10">
          {/* Background image */}
          <div className="absolute inset-0">
            <Image
              src="/products/tee_back.webp"
              alt="Men's collection"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center brightness-[0.28]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/40 to-transparent" />

          <div className="relative z-10 mx-auto w-full max-w-[1400px]">
            <p className="mb-4 text-[10px] font-semibold tracking-[0.5em] text-white/30 uppercase">
              01 / Men
            </p>
            <h1 className="text-6xl font-black uppercase leading-none tracking-tight text-white sm:text-8xl lg:text-[7rem]">
              Built For
              <br />
              <span className="text-white/25">The Ones</span>
              <br />
              Who Show Up.
            </h1>
          </div>
        </section>

        {/* Products grid */}
        <section className="px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-10 flex items-center justify-between">
              <p className="text-sm font-semibold tracking-[0.3em] text-white/40 uppercase">
                {displayProducts.length} Pieces
              </p>
              <Link
                href="/"
                className="text-[11px] font-semibold tracking-[0.2em] text-white/30 uppercase transition hover:text-white/70"
              >
                ← Back
              </Link>
            </div>

            <MenContent products={displayProducts} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
