"use client";

import { useWishlistStore } from "@/lib/wishlistStore";
import { useAuth } from "@clerk/nextjs";
import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface WomenContentProps {
  products: any[];
}

export default function WomenContent({ products }: WomenContentProps) {
  const router = useRouter();
  const { toggleItem, hasItem } = useWishlistStore();
  const [mounted, setMounted] = useState(false);
  const { userId } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product, idx) => {
        const isWishlisted = mounted ? hasItem(product.id) : false;
        const formattedPrice = typeof product.price === "number"
          ? `₹${product.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
          : product.price;

        return (
          <article
            key={product.name + idx}
            className="group overflow-hidden rounded-[20px] border border-white/[0.1] bg-[#0e0e0e] transition duration-300 hover:border-white/20 relative"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <Link href={`/products/${product.slug || "statement-tee"}`} className="absolute inset-0 z-0">
                <div className="absolute inset-0 transition duration-700 group-hover:scale-105">
                  <Image
                    src={product.src}
                    alt={product.alt || product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </Link>
              <span className="absolute left-3 top-3 pointer-events-none rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold tracking-[0.12em] text-white/80 backdrop-blur">
                {product.tag}
              </span>
              
              {/* Wishlist Button */}
              <button
                onClick={() => {
                  if (!userId) {
                    router.push("/auth");
                    return;
                  }
                  toggleItem({
                    id: product.id,
                    product_id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: typeof product.price === "number" ? product.price : 9600.0,
                    thumbnail: product.src,
                    gender: product.gender || "women",
                    availability: product.availability || "Available Now",
                  });
                }}
                suppressHydrationWarning
                aria-label="Save"
                className={`absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full border backdrop-blur transition-all duration-300 cursor-pointer ${
                  isWishlisted
                    ? "border-white bg-white text-black"
                    : "border-white/15 bg-black/40 text-white/30 hover:border-white/20 hover:text-white/75"
                }`}
              >
                <Heart size={13} fill={isWishlisted ? "currentColor" : "none"} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.07] px-5 py-4">
              <Link href={`/products/${product.slug || "statement-tee"}`} className="flex-1 min-w-0 pr-2">
                <p className="text-xs font-medium text-white/85 uppercase tracking-wide truncate">{product.name}</p>
                <p className="mt-0.5 text-[11px] text-white/35 uppercase font-semibold">{formattedPrice}</p>
              </Link>
              <Link href={`/products/${product.slug || "statement-tee"}`} className="hidden md:inline-flex rounded-full border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-[10px] font-semibold tracking-[0.14em] uppercase text-white/50 transition hover:bg-white hover:text-black">
                View
              </Link>
            </div>

            {/* Mobile Action CTA */}
            <div className="md:hidden border-t border-white/[0.05] bg-[#0a0a0a] px-5 pb-4 pt-1">
              <Link
                href={`/products/${product.slug || "statement-tee"}`}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-white text-[11px] font-bold uppercase tracking-widest text-black transition hover:bg-white/88"
              >
                View Details
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
