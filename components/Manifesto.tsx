"use client";

import AnimatedSection from "@/components/AnimatedSection";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

export default function Manifesto() {
  const containerRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const yCol1 = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? ["0px", "0px"] : ["24px", "-24px"]);
  const yCol2 = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? ["0px", "0px"] : ["-16px", "16px"]);
  const yCol3 = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? ["0px", "0px"] : ["30px", "-30px"]);

  return (
    <section id="about" ref={containerRef} className="relative overflow-hidden px-4 py-12 sm:px-6 md:py-20 lg:px-10">
      <div className="mx-auto max-w-[1400px]">

        {/* DESKTOP LAYOUT (unchanged structure with refined scroll physics) */}
        <div className="hidden lg:block">
          {/* Three editorial image columns */}
          <div className="relative grid items-end gap-6 lg:grid-cols-3">
            <motion.div style={{ y: yCol1 }}>
              <AnimatedSection delay={0} className="lg:mb-16">
                <div className="relative h-[320px] overflow-hidden rounded-[20px] border border-white/[0.1] lg:h-[380px]">
                  <Image src="/products/tee_folded.webp" alt="DRIPEGO folded tee" fill sizes="(max-width:1024px) 100vw,33vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                <p className="mt-4 max-w-[220px] text-xs leading-5 text-white/35">
                  Dressed for arrival, not permission.
                </p>
              </AnimatedSection>
            </motion.div>

            <motion.div style={{ y: yCol2 }}>
              <AnimatedSection delay={0.08}>
                <div className="relative h-[420px] overflow-hidden rounded-[24px] border border-white/[0.12] lg:h-[500px]">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_60%,#1a1a1a_0%,#080808_100%)]" />
                  <Image src="/models/hero_model.png" alt="DRIPEGO model" fill unoptimized sizes="(max-width:1024px) 100vw,33vw" className="object-cover object-top" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>
              </AnimatedSection>
            </motion.div>

            <motion.div style={{ y: yCol3 }}>
              <AnimatedSection delay={0.16} className="flex flex-col gap-5 lg:mb-8">
                <p className="max-w-[260px] text-xs leading-5 text-white/35 lg:self-end lg:text-right">
                  Presence over approval. Unspoken impact.
                </p>
                <div className="relative h-[280px] overflow-hidden rounded-[20px] border border-white/[0.1] lg:h-[320px]">
                  <Image src="/products/tee_back.webp" alt="DRIPEGO back tee" fill sizes="(max-width:1024px) 100vw,33vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              </AnimatedSection>
            </motion.div>
          </div>

          {/* Big manifesto headline */}
          <motion.div
            className="mt-14 text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-6 text-xs font-medium tracking-[0.5em] text-white/25">MANIFESTO</p>
            <h2 className="text-[11vw] font-black uppercase leading-[0.88] tracking-tight text-white sm:text-7xl lg:text-[7.5rem]">
              They Notice.
              <br />
              <span className="text-white/25">Before</span>
              <br />
              You Speak.
            </h2>
          </motion.div>
        </div>

        {/* MOBILE LAYOUT (compact, viewport-aligned, high-impact) */}
        <div className="lg:hidden flex flex-col justify-center items-center min-h-[75vh] py-4 text-center">
          <p className="text-[9px] font-bold tracking-[0.5em] text-white/20 uppercase mb-4">MANIFESTO</p>
          <h2 className="text-[9vw] xs:text-[8vw] sm:text-5xl font-black uppercase leading-[0.9] tracking-tight text-white max-w-sm">
            IF IT LOOKS
            <br />
            LIKE EGO,
            <br />
            <span className="text-white/25">GOOD.</span>
          </h2>
          
          <div className="relative w-full max-w-[280px] aspect-[3/4] overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#0c0c0c] mt-6 shadow-2xl">
            <Image 
              src="/models/hero_model.png" 
              alt="DRIPEGO model" 
              fill 
              unoptimized 
              sizes="(max-width:768px) 100vw, 280px" 
              className="object-cover object-top" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>
        </div>

      </div>
    </section>
  );
}
