"use client";

import AnimatedSection from "@/components/AnimatedSection";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Waitlist() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCount() {
      if (!supabase) return;
      const { count: c } = await supabase.from("waitlist").select("*", { count: "exact", head: true });
      if (typeof c === "number") setCount(c);
    }
    fetchCount();
  }, [status]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const normName = name.trim();
    const normPhone = phone.trim();
    const normEmail = email.trim().toLowerCase();

    if (!normName) {
      setStatus("error");
      setMessage("Enter a valid name.");
      return;
    }
    if (!emailPattern.test(normEmail)) {
      setStatus("error");
      setMessage("Enter a valid email.");
      return;
    }
    if (!supabase) {
      setStatus("error");
      setMessage("Service unavailable.");
      return;
    }

    setStatus("loading");
    setMessage("");

    const { error } = await supabase.from("waitlist").insert({
      name: normName,
      phone: normPhone || null,
      email: normEmail,
    });

    if (error) {
      console.error("Waitlist submission error:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      setStatus("error");
      setMessage(
        error.code === "23505"
          ? "You are already in the room."
          : `Something went wrong: ${error.message || "Unknown database error."}`
      );
      return;
    }

    console.log("Waitlist registered:", {
      name: normName,
      email: normEmail,
      phone: normPhone || "Not provided",
    });

    setStatus("success");
    setMessage(
      `Welcome to the room, ${normName}! Registered with ${normEmail}${
        normPhone ? ` and phone ${normPhone}` : ""
      }.`
    );
    setName("");
    setPhone("");
    setEmail("");
  }

  return (
    <section id="contact" className="px-4 py-16 sm:px-6 lg:px-10">
      <AnimatedSection className="mx-auto grid max-w-[1400px] gap-10 rounded-[24px] border border-white/[0.08] bg-[#0d0d0d] p-8 sm:p-10 lg:grid-cols-12 lg:p-14">
        <div className="lg:col-span-5">
          <p className="mb-4 text-xs font-medium tracking-[0.5em] text-white/30 uppercase">Waitlist</p>
          <h2 className="text-6xl font-black uppercase leading-none tracking-tight text-white sm:text-7xl lg:text-8xl">
            Be First.
          </h2>
          <p className="mt-4 text-sm leading-6 text-white/30">Get early access to Drop 001.</p>
          {count !== null && count > 0 && (
            <p className="mt-4 text-[11px] tracking-[0.16em] text-white/22 uppercase">
              Join <span className="text-white/55">{count.toLocaleString()}</span> people already inside.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col justify-center gap-4 lg:col-span-7">
          <div className="grid gap-3 lg:grid-cols-2">
            <div>
              <label className="sr-only" htmlFor="wl-name">Full name</label>
              <input
                id="wl-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="YOUR FULL NAME"
                suppressHydrationWarning
                autoComplete="name"
                required
                className="h-14 w-full rounded-[16px] border border-white/[0.08] bg-white/[0.04] px-5 text-sm tracking-[0.08em] text-white outline-none transition placeholder:text-white/18 focus:border-white/18"
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="wl-phone">Phone number</label>
              <input
                id="wl-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="PHONE NUMBER (OPTIONAL)"
                suppressHydrationWarning
                autoComplete="tel"
                className="h-14 w-full rounded-[16px] border border-white/[0.08] bg-white/[0.04] px-5 text-sm tracking-[0.08em] text-white outline-none transition placeholder:text-white/18 focus:border-white/18"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="min-w-0 flex-1">
              <label className="sr-only" htmlFor="wl-email">Email address</label>
              <input
                id="wl-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="YOUR EMAIL ADDRESS"
                suppressHydrationWarning
                autoComplete="email"
                required
                className="h-14 w-full rounded-[16px] border border-white/[0.08] bg-white/[0.04] px-5 text-sm tracking-[0.08em] text-white outline-none transition placeholder:text-white/18 focus:border-white/18"
              />
            </div>
            <motion.button
              type="submit"
              disabled={status === "loading"}
              suppressHydrationWarning
              className="inline-flex h-14 w-full lg:w-auto shrink-0 items-center justify-center gap-2.5 rounded-[16px] bg-white px-6 text-[11px] font-bold tracking-[0.12em] uppercase text-black transition hover:bg-white/88 disabled:opacity-50"
              whileTap={{ scale: 0.98 }}
            >
              {status === "loading"
                ? <Loader2 className="animate-spin" size={15} />
                : <><span>Enter The Room</span><ArrowRight size={13} strokeWidth={2.2} /></>
              }
            </motion.button>
          </div>
          {message && (
            <p className={`text-sm ${status === "success" ? "text-white/60" : "text-white/30"}`} role="status">
              {message}
            </p>
          )}
        </form>
      </AnimatedSection>
    </section>
  );
}
