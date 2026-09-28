"use client";

import { useCartStore } from "@/lib/cartStore";
import { useWishlistStore } from "@/lib/wishlistStore";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion";
import { Lock, LogOut, X, ShoppingBag, User, Heart, Menu, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { label: "MEN", href: "/men" },
  { label: "WOMEN", href: "/women" },
];

export default function Navbar() {
  const router = useRouter();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { items, setIsOpen } = useCartStore();
  const wishlistItems = useWishlistStore((state) => state.items);

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { userId, isLoaded } = useAuth();

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileMenuOpen]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 24);
  });

  useEffect(() => {
    setMounted(true);
    if (!isLoaded) return;

    setUser(userId ? { id: userId } : null);
  }, [userId, isLoaded]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <motion.header
      className={`fixed inset-x-0 top-0 z-50 px-4 pt-4 transition-all duration-500 ${
        scrolled
          ? "bg-[#080808]/85 backdrop-blur-xl"
          : "bg-transparent"
      }`}
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <nav className="relative mx-auto flex h-[72px] max-w-[1400px] items-center justify-between rounded-[28px] border border-white/[0.1] bg-[#0e0e0e]/80 px-5 backdrop-blur-md sm:px-8">

        {/* Desktop nav links — MEN & WOMEN */}
        <div className="hidden items-center gap-9 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[11px] font-semibold tracking-[0.08em] text-white/60 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop Logo */}
        <Link
          href="/"
          aria-label="DRIPEGO home"
          className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 h-11 w-24 opacity-90 transition-opacity hover:opacity-60"
        >
          <Image src="/logo/de.svg" alt="DRIPEGO DE logo" fill priority />
        </Link>

        {/* Desktop Actions — SEARCH, ACCOUNT, BAG */}
        <div className="hidden lg:flex items-center justify-end gap-3 ml-auto">
          {/* Search Trigger */}
          <div className="relative">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  type="text"
                  autoFocus
                  placeholder="SEARCH ARCHIVE..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => !searchQuery && setSearchOpen(false)}
                  className="h-10 w-44 rounded-full border border-white/20 bg-[#121212] px-4 text-[10px] tracking-widest text-white placeholder:text-white/30 outline-none transition-all focus:w-56 focus:border-white/40"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                  className="ml-1 text-white/40 hover:text-white p-1"
                >
                  <X size={13} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/[0.07] text-white/70 transition hover:bg-white/15 hover:text-white cursor-pointer"
              >
                <Search size={15} strokeWidth={1.8} />
              </button>
            )}
          </div>

          {/* Account */}
          <Link
            href={user ? "/dashboard" : "/auth"}
            aria-label={user ? "Dashboard" : "Account"}
            className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/[0.07] text-white/70 transition hover:bg-white/15 hover:text-white cursor-pointer"
          >
            <User size={15} strokeWidth={1.8} />
          </Link>

          {/* Wishlist Shortcut */}
          <Link
            href={user ? "/dashboard?tab=wishlist" : "/auth"}
            aria-label="Locker Wishlist"
            className="relative grid size-10 place-items-center rounded-full border border-white/15 bg-white/[0.07] text-white/70 transition hover:bg-white/15 hover:text-white cursor-pointer"
          >
            <Heart size={15} strokeWidth={1.8} />
            {mounted && wishlistItems.length > 0 && (
              <span className="absolute -right-1 -top-1 grid min-w-4 h-4 place-items-center rounded-full bg-white text-black text-[9px] font-bold px-1 border border-[#080808]">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Cart Bag Trigger Button (works for both guests & members) */}
          <button
            suppressHydrationWarning
            onClick={() => setIsOpen(true)}
            aria-label="Shopping Bag"
            className="relative grid size-10 place-items-center rounded-full border border-white/15 bg-white/[0.07] text-white/70 transition hover:bg-white/15 hover:text-white cursor-pointer"
          >
            <ShoppingBag size={15} strokeWidth={1.8} />
            {mounted && items.length > 0 && (
              <span className="absolute -right-1 -top-1 grid min-w-4 h-4 place-items-center rounded-full bg-white text-black text-[9px] font-bold px-1 border border-[#080808]">
                {items.reduce((acc, curr) => acc + curr.quantity, 0)}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Header (visible only on lg:hidden) */}
        <div className="lg:hidden flex items-center justify-between w-full h-full">
          <Link
            href="/"
            aria-label="DRIPEGO home"
            onClick={() => setMobileMenuOpen(false)}
            className="relative h-9 w-20 opacity-90 transition-opacity hover:opacity-60"
          >
            <Image src="/logo/de.svg" alt="DRIPEGO DE logo" fill className="object-contain" priority />
          </Link>

          <button
            suppressHydrationWarning
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Menu"
            className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-white/70 transition hover:bg-white/15 cursor-pointer"
          >
            <Menu size={16} />
          </button>
        </div>
      </nav>
    </motion.header>

    {/* Mobile Fullscreen Menu Overlay */}
    <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] bg-[#0c0c0c]/90 backdrop-blur-xl flex flex-col justify-between px-6 py-6 sm:px-10"
        >
            {/* Header area inside overlay */}
            <div className="flex items-center justify-between h-[72px]">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="relative h-9 w-20 opacity-90"
              >
                <Image src="/logo/de.svg" alt="DRIPEGO logo" fill className="object-contain" />
              </Link>
              <button
                suppressHydrationWarning
                onClick={() => setMobileMenuOpen(false)}
                className="grid size-11 place-items-center rounded-full border border-white/10 text-white/60 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Links stacked vertically */}
            <div className="flex flex-col gap-6 my-auto">
              {[
                { label: "MEN", href: "/men" },
                { label: "WOMEN", href: "/women" },
                { label: "SEARCH", href: "/products" },
                { label: "ABOUT", href: "/#about" },
                { label: "CONTACT", href: "/#contact" },
              ].map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.04, duration: 0.35 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-3xl font-black uppercase tracking-wider text-white hover:text-white/60 transition block"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Bottom Actions inside overlay (Bag, Locker, Member/Sign in) */}
            <div className="border-t border-white/[0.08] pt-6 flex flex-col gap-4">
              <div className="flex items-center justify-around">
                {/* Wishlist Link */}
                <Link
                  href={user ? "/dashboard?tab=wishlist" : "/auth"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex flex-col items-center gap-1.5 text-white/50 hover:text-white transition"
                >
                  <Heart size={18} />
                  <span className="text-[9px] font-bold tracking-widest uppercase">LOCKER ({wishlistItems.length})</span>
                </Link>

                {/* Cart link — works directly for guests too */}
                <button
                  suppressHydrationWarning
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsOpen(true);
                  }}
                  className="flex flex-col items-center gap-1.5 text-white/50 hover:text-white transition cursor-pointer"
                >
                  <ShoppingBag size={18} />
                  <span className="text-[9px] font-bold tracking-widest uppercase">BAG ({items.reduce((acc, curr) => acc + curr.quantity, 0)})</span>
                </button>

                {/* Profile / Login link */}
                <Link
                  href={user ? "/dashboard" : "/auth"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex flex-col items-center gap-1.5 text-white/50 hover:text-white transition"
                >
                  <User size={18} />
                  <span className="text-[9px] font-bold tracking-widest uppercase">
                    {user ? "DASHBOARD" : "SIGN IN"}
                  </span>
                </Link>
              </div>

              {/* Legal or small tagline */}
              <p className="text-center text-[9px] tracking-[0.3em] text-white/15 uppercase mt-2">
                DRIPEGO — NOT FOR EVERYONE
              </p>
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  </>
);
}
