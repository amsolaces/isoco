"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useCartStore } from "@/lib/cartStore";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowRight, Loader2, CheckCircle, CreditCard, ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getCartSubtotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");
  const [country, setCountry] = useState("India");
  const [paymentMethod, setPaymentMethod] = useState("card");

  // State flags
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMounted(true);
    if (!clerkLoaded) return;
    if (clerkUser) {
      const getProfile = async () => {
        if (supabase) {
          const email = clerkUser.primaryEmailAddress?.emailAddress || "";
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("id")
              .eq("email", email)
              .single();
            if (profile) {
              setUser({ id: profile.id });
            }
          } catch (e) {
            console.error("Failed to load profile for checkout:", e);
          }
        }
      };
      getProfile();
      setEmail(clerkUser.primaryEmailAddress?.emailAddress || "");
      setName(clerkUser.fullName || "");
    }
  }, [clerkUser, clerkLoaded]);

  if (!mounted) return null;

  const subtotal = getCartSubtotal();
  const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 100;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping;

  async function handlePlaceOrder(e: FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    setMessage("");

    try {
      const fullAddress = `${address}, ${city} - ${postal}, ${country}`;
      const orderPayload = {
        customer_id: user?.id || null,
        customer_name: name.trim(),
        customer_email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
        shipping_address: fullAddress,
        subtotal,
        tax,
        shipping,
        discount: 0.00,
        total,
        payment_method: paymentMethod,
        payment_status: paymentMethod === "cod" ? "pending" : "paid",
        order_status: "pending",
      };

      if (!supabase) {
        // Fallback for visual mock confirmation if no Supabase instance is bound
        setOrderId(`DE-${Math.floor(100000 + Math.random() * 900000)}`);
        setSuccess(true);
        clearCart();
        return;
      }

      // 1. Insert order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert(orderPayload)
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Insert order items
      const itemsPayload = items.map((item) => ({
        order_id: orderData.id,
        product_id: typeof item.product_id === "number" ? item.product_id : null,
        product_name: item.name,
        sku: item.slug,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(itemsPayload);
      if (itemsError) throw itemsError;

      // 3. Log stock reduction and inventory delta
      for (const item of items) {
        if (typeof item.product_id === "number" || typeof item.product_id === "string") {
          // Log inventory logs
          await supabase.from("inventory_logs").insert({
            product_id: item.product_id,
            delta: -item.quantity,
            reason: "sale",
          });

          // Fetch current stock to adjust
          const { data: prod } = await supabase
            .from("products")
            .select("stock_quantity")
            .eq("id", item.product_id)
            .single();

          if (prod) {
            const nextStock = Math.max(0, prod.stock_quantity - item.quantity);
            await supabase
              .from("products")
              .update({ stock_quantity: nextStock })
              .eq("id", item.product_id);
          }
        }
      }

      setOrderId(orderData.id.substring(0, 8).toUpperCase());
      setSuccess(true);
      clearCart();
    } catch (err: any) {
      console.error("Order submission failure:", err);
      setMessage(`Fulfillment failure: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#060606] flex items-center justify-center px-6 pt-28 pb-16 text-[#f0ede8]">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-[500px] rounded-[24px] border border-white/[0.06] bg-[#0c0c0c] p-8 sm:p-10 text-center shadow-2xl"
          >
            <div className="flex justify-center mb-6">
              <CheckCircle size={48} className="text-white" />
            </div>
            <p className="text-[10px] font-bold tracking-[0.4em] text-white/30 uppercase mb-2">Order Confirmed</p>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-4">Own The Room</h1>
            <p className="text-xs text-white/45 leading-relaxed max-w-[360px] mx-auto mb-6">
              Your purchase was successfully registered. Order identifier is{" "}
              <span className="font-mono text-white font-bold uppercase">#{orderId}</span>. A confirmation receipt has been sent to your email.
            </p>
            <div className="h-px bg-white/[0.06] mb-6" />
            <button
              onClick={() => router.push("/")}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-8 text-[11px] font-bold uppercase tracking-widest text-black hover:bg-white/88 transition cursor-pointer"
            >
              <span>Back to showroom</span>
              <ArrowRight size={13} strokeWidth={2.5} />
            </button>
          </motion.div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#060606] px-5 pb-20 pt-28 sm:px-8 lg:px-10 text-[#ede9e3] font-sans">
        <div className="mx-auto max-w-[1200px]">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/35 hover:text-white mb-8"
          >
            <ChevronLeft size={12} />
            <span>Showroom</span>
          </Link>

          <h1 className="text-4xl font-black uppercase tracking-tight text-white mb-10">Checkout</h1>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-12 text-center max-w-[600px] mx-auto">
              <ShoppingBag size={32} className="text-white/10 mx-auto mb-4" />
              <p className="text-xs tracking-widest text-white/40 uppercase">Your shopping cart is empty</p>
              <button
                onClick={() => router.push("/")}
                className="mt-6 inline-flex h-10 items-center rounded-xl bg-white px-6 text-[10px] font-bold uppercase tracking-widest text-black hover:bg-white/88 transition"
              >
                Go Shop
              </button>
            </div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-12">
              {/* LEFT: Shipping Details Form */}
              <div className="lg:col-span-7 space-y-6">
                <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Delivery Parameters</h3>

                  <form onSubmit={handlePlaceOrder} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="LIAM NEESON"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20 uppercase"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Email Address</label>
                        <input
                          type="email"
                          required
                          placeholder="liam@taken.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Phone Contact</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Street Address</label>
                      <input
                        type="text"
                        required
                        placeholder="Flat No, Wing, Building Name, Street"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20 uppercase"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">City</label>
                        <input
                          type="text"
                          required
                          placeholder="MUMBAI"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20 uppercase"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Postal Code</label>
                        <input
                          type="text"
                          required
                          placeholder="400001"
                          value={postal}
                          onChange={(e) => setPostal(e.target.value)}
                          className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Country</label>
                      <input
                        type="text"
                        required
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20 uppercase"
                      />
                    </div>

                    {/* Payment choice */}
                    <div className="border-t border-white/[0.06] pt-6 space-y-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-white">Payment Method</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label
                          className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition ${
                            paymentMethod === "card"
                              ? "border-white bg-white/[0.02] text-white"
                              : "border-white/10 bg-white/[0.005] text-white/40 hover:text-white"
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value="card"
                            checked={paymentMethod === "card"}
                            onChange={() => setPaymentMethod("card")}
                            className="hidden"
                          />
                          <CreditCard size={16} />
                          <span className="text-xs font-bold uppercase tracking-wider">Debit / Credit Card</span>
                        </label>
                        <label
                          className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition ${
                            paymentMethod === "cod"
                              ? "border-white bg-white/[0.02] text-white"
                              : "border-white/10 bg-white/[0.005] text-white/40 hover:text-white"
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value="cod"
                            checked={paymentMethod === "cod"}
                            onChange={() => setPaymentMethod("cod")}
                            className="hidden"
                          />
                          <ShoppingBag size={16} />
                          <span className="text-xs font-bold uppercase tracking-wider">Cash on Delivery (COD)</span>
                        </label>
                      </div>
                    </div>

                    {message && (
                      <p className="text-[10px] font-semibold tracking-wider text-red-400 mt-2">{message}</p>
                    )}

                    <div className="pt-4">
                      <motion.button
                        type="submit"
                        disabled={loading}
                        className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-white text-[10px] font-bold uppercase tracking-[0.15em] text-black transition hover:bg-white/88 disabled:opacity-50 cursor-pointer"
                        whileTap={{ scale: 0.98 }}
                      >
                        {loading ? (
                          <Loader2 className="animate-spin" size={15} />
                        ) : (
                          <>
                            <span>Place Order</span>
                            <ArrowRight size={13} strokeWidth={2.2} />
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </div>

              {/* RIGHT: Order Summary Card */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 space-y-6 lg:sticky lg:top-28">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Order Items</h3>

                  {/* Summary list */}
                  <div className="max-h-64 overflow-y-auto space-y-3.5 pr-2">
                    {items.map((item) => (
                      <div key={`${item.product_id}-${item.size}-${item.color}`} className="flex gap-3 text-xs">
                        <div className="relative size-12 rounded-lg overflow-hidden border border-white/[0.08] bg-[#141414] shrink-0">
                          <Image
                            src={item.thumbnail || "/products/tee_front.webp"}
                            alt={item.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white uppercase truncate">{item.name}</p>
                          <p className="text-[9px] text-white/30 tracking-widest mt-0.5 uppercase">
                            Qty: {item.quantity} | Size: {item.size}
                          </p>
                        </div>
                        <span className="font-semibold text-white/80">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="h-px bg-white/[0.06]" />

                  {/* Pricing Breakdown */}
                  <div className="space-y-2.5 text-xs text-white/50">
                    <div className="flex justify-between">
                      <span className="tracking-wide">Subtotal</span>
                      <span className="font-semibold text-white/80">₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="tracking-wide">Shipping</span>
                      <span className="font-semibold text-white/80">
                        {shipping === 0 ? "Free Shipping" : `₹${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-white/30">
                      <span className="tracking-wide">Includes GST (18%)</span>
                      <span>₹{tax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="h-px bg-white/[0.06] my-2" />
                    <div className="flex justify-between text-sm font-bold text-white">
                      <span className="tracking-wider">Grand Total</span>
                      <span>₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
