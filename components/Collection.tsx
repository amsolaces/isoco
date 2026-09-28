"use client";

import AnimatedSection from "@/components/AnimatedSection";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

export default function Collection() {
  const ref = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scrollY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const y = shouldReduceMotion ? 0 : scrollY;

  return (
    <section id="collection" ref={ref} className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-10">
      {/* Background watermark words */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none flex justify-between px-5">
        <span className="text-[10vw] sm:text-[14vw] font-black uppercase leading-none tracking-tight text-white/[0.02] sm:text-white/[0.04]">PRESENCE</span>
        <span className="text-[10vw] sm:text-[14vw] font-black uppercase leading-none tracking-tight text-white/[0.02] sm:text-white/[0.04]">SILENCE</span>
      </div>

      <div className="relative mx-auto flex max-w-[1400px] flex-col items-center">
        <AnimatedSection className="w-full max-w-[520px]">
          <div className="relative overflow-hidden rounded-[28px] border border-white/[0.12] bg-[#0e0e0e] shadow-[0_0_80px_rgba(255,255,255,0.04)]">
            <div className="flex flex-col items-center border-b border-white/[0.08] px-8 py-5">
              <p className="text-[10px] font-semibold tracking-[0.5em] text-white/40 uppercase">DRIPEGO</p>
            </div>
            <div className="relative h-[480px] overflow-hidden sm:h-[540px]">
              <motion.div className="absolute inset-x-0 -top-[10%] h-[120%]" style={{ y }}>
                <Image src="/lifestyle/hanger_black.webp" alt="DRIPEGO collection" fill sizes="520px" className="object-cover" />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e]/70 via-transparent to-transparent" />
              <div className="absolute inset-x-0 top-8 px-8 text-center">
                <p className="mb-3 text-[10px] font-semibold tracking-[0.4em] text-white/50 uppercase">OBJECT 001</p>
                <h2 className="text-3xl font-black uppercase leading-tight tracking-tight text-white sm:text-4xl">
                  Heavyweight Form.
                  <br />
                  Silent Presence.
                </h2>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
