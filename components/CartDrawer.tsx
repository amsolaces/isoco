"use client";

import { useCartStore } from "@/lib/cartStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useReality } from "@/context/RealityThemeContext";

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, getCartSubtotal } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const { reality } = useReality();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!mounted) return null;

  const subtotal = getCartSubtotal();
  const shipping = 0; // Complimentary atelier shipping on Drop 001
  const total = subtotal + shipping;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10001] overflow-hidden font-mono">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Drawer container */}
          <div className="absolute inset-y-0 right-0 flex max-w-full pl-6 md:pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-screen max-w-md border-l bg-[var(--card-bg)] text-[var(--text-primary)] shadow-2xl flex flex-col h-full"
              style={{ borderColor: "var(--border-color)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b p-5" style={{ borderColor: "var(--border-light)" }}>
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-xs font-bold uppercase tracking-widest">
                    Atelier Bag // Capsule [{items.reduce((acc, curr) => acc + curr.quantity, 0)}]
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  data-cursor="CLOSE"
                  className="border px-2 py-1 text-xs uppercase hover:bg-current hover:text-[var(--bg-color)] transition-colors"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  ESC [✕]
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3" data-lenis-prevent>
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="border p-4 mb-4" style={{ borderColor: "var(--border-light)" }}>
                      <ShoppingBag size={24} className="opacity-40" />
                    </div>
                    <p className="text-xs tracking-widest opacity-60 uppercase mb-2">Capsule is currently empty</p>
                    <p className="text-[10px] opacity-40 max-w-xs mb-6">
                      Explore the Drop 001 archive and acquire structural garments.
                    </p>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="border px-4 py-2 text-xs uppercase font-medium hover:bg-current hover:text-[var(--bg-color)] transition-all"
                      style={{ borderColor: "var(--border-color)" }}
                    >
                      Inspect Drop Archive →
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={`${item.product_id}-${item.size}-${item.color}`}
                      className="flex gap-3 border p-3 bg-[var(--bg-color)] transition"
                      style={{ borderColor: "var(--border-light)" }}
                    >
                      {/* Thumbnail preview */}
                      <div className="relative size-20 border shrink-0 bg-neutral-900/40 overflow-hidden" style={{ borderColor: "var(--border-light)" }}>
                        <Image
                          src={item.thumbnail || "/products/tee_front.webp"}
                          alt={item.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>

                      {/* Info & Quantity */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-xs font-bold uppercase truncate">
                              {item.name}
                            </h4>
                            <button
                              onClick={() => removeItem(item.product_id, item.size, item.color)}
                              className="opacity-40 hover:opacity-100 transition text-[10px]"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] opacity-60 mt-0.5">
                            <span>SIZE: {item.size}</span>
                            <span>•</span>
                            <span>{item.color}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-2 pt-2 border-t" style={{ borderColor: "var(--border-light)" }}>
                          {/* Stepper */}
                          <div className="flex items-center border" style={{ borderColor: "var(--border-color)" }}>
                            <button
                              onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity - 1)}
                              className="px-2 py-0.5 text-xs hover:bg-neutral-500/20"
                            >
                              -
                            </button>
                            <span className="px-2 py-0.5 text-xs font-bold border-x" style={{ borderColor: "var(--border-color)" }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity + 1)}
                              className="px-2 py-0.5 text-xs hover:bg-neutral-500/20"
                            >
                              +
                            </button>
                          </div>

                          <span className="font-bold text-xs">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer / Summary */}
              {items.length > 0 && (
                <div className="border-t p-5 space-y-3 bg-[var(--bg-color)]" style={{ borderColor: "var(--border-light)" }}>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between opacity-70">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between opacity-70">
                      <span>Atelier Shipping</span>
                      <span className="text-emerald-500 font-bold uppercase">COMPLIMENTARY</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm pt-2 border-t" style={{ borderColor: "var(--border-color)" }}>
                      <span>Total Allocation</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    onClick={() => setIsOpen(false)}
                    className="w-full border py-3 px-4 text-xs font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                    style={{
                      backgroundColor: "var(--accent-color)",
                      color: "var(--bg-color)",
                      borderColor: "var(--border-color)",
                    }}
                  >
                    <span>SECURE CHECKOUT ALLOCATION</span>
                    <span>[→]</span>
                  </Link>

                  <div className="text-[9px] opacity-40 text-center uppercase tracking-wider">
                    SECURE 256-BIT ENCRYPTION // DIRECT ATELIER DISPATCH
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
