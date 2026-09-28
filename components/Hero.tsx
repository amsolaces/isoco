"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

export default function Hero() {
  const desktopRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: desktopRef,
    offset: ["start start", "end start"],
  });

  const rawImageScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  const rawImageY = useTransform(scrollYProgress, [0, 1], ["0%", "6%"]);
  const rawContentY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const rawContentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.35]);

  const imageScale = shouldReduceMotion ? 1 : rawImageScale;
  const imageY = shouldReduceMotion ? "0%" : rawImageY;
  const contentY = shouldReduceMotion ? "0%" : rawContentY;
  const contentOpacity = shouldReduceMotion ? 1 : rawContentOpacity;

  return (
    <section id="home" className="bg-[#060606]">
      {/* DESKTOP LAYOUT */}
      <div ref={desktopRef} className="hidden md:block relative min-h-screen overflow-hidden">
        {/* Full-bleed campaign image with subtle scroll physics */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{ scale: imageScale, y: imageY }}
        >
          <Image
            src="/models/hero_model.png"
            alt="DRIPEGO Drop 001 campaign"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-top"
          />
          {/* Dark overlay so text is readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-[#060606]/55 to-[#060606]/30" />
          {/* Left vignette */}
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#060606]/60 to-transparent" />
        </motion.div>

        {/* Content — sits over the image */}
        <div className="relative z-10 flex min-h-screen flex-col justify-between px-6 py-6 sm:px-10 lg:px-14">
          {/* Top spacer for navbar */}
          <div className="h-20" />

          {/* Bottom content block */}
          <motion.div
            className="max-w-[640px]"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={{ y: contentY, opacity: contentOpacity }}
          >
            <p className="mb-4 text-[10px] font-semibold tracking-[0.55em] text-white/40 uppercase">
              Drop 001
            </p>
            <h1 className="text-[15vw] font-black uppercase leading-[0.86] tracking-tight text-white sm:text-[10vw] lg:text-[7.5rem]">
              Own The
              <br />
              Room.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/45">
              For those who stopped asking for permission.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="#contact"
                className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-white px-7 text-[11px] font-bold uppercase tracking-[0.1em] text-black transition-all duration-300 hover:bg-white/88"
              >
                Join Waitlist
                <ArrowRight size={13} strokeWidth={2.2} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#product"
                className="inline-flex h-12 items-center rounded-full border border-white/20 px-7 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/70 transition-all duration-300 hover:border-white/35 hover:text-white"
              >
                Explore Drop
              </Link>
            </div>
          </motion.div>

          {/* Bottom scroll hint */}
          <motion.p
            className="pb-2 text-center text-[9px] font-medium tracking-[0.5em] text-white/20 uppercase"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            Scroll
          </motion.p>
        </div>
      </div>

      {/* MOBILE LAYOUT (redesigned for premium mobile app experience) */}
      <div className="md:hidden flex flex-col min-h-screen px-4 pt-24 pb-12 justify-between">
        {/* Model image first - 70% viewport height */}
        <div className="relative h-[65vh] w-full rounded-[24px] overflow-hidden border border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
          <Image
            src="/models/hero_model.png"
            alt="DRIPEGO Drop 001 campaign"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060606]/80 via-transparent to-transparent" />
        </div>

        {/* Text and buttons below the model image */}
        <motion.div
          className="mt-6 space-y-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <p className="text-[9px] font-bold tracking-[0.4em] text-white/30 uppercase">
              Drop 001
            </p>
            <h1 className="text-[12vw] font-black uppercase leading-[0.88] tracking-tight text-white mt-1">
              Own The
              <br />
              Room.
            </h1>
            <p className="mt-3 text-xs leading-5 text-white/45 max-w-xs">
              For those who stopped asking for permission.
            </p>
          </div>

          {/* Stacked full-width CTA buttons */}
          <div className="flex flex-col gap-2.5 pt-2">
            <Link
              href="#contact"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-[11px] font-bold uppercase tracking-widest text-black transition hover:bg-white/88"
            >
              <span>ENTER THE ROOM</span>
              <ArrowRight size={13} strokeWidth={2.4} />
            </Link>
            <Link
              href="#product"
              className="flex h-12 w-full items-center justify-center rounded-xl border border-white/20 bg-transparent text-[11px] font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 transition"
            >
              VIEW DROP 001
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
