"use client";

import AnimatedSection from "@/components/AnimatedSection";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const panels = [
  {
    tag: "01 / Men",
    headline: "Built for\nthe ones\nwho show up.",
    subtext: "Not built to blend in.",
    src: "/models/men_model.jpg",
    hoverSrc: "/models/men_model.jpg",
    alt: "DRIPEGO men's collection",
    href: "/men",
  },
  {
    tag: "02 / Women",
    headline: "Engineered form.\nUncompromising\npresence.",
    subtext: "Pure silhouette.",
    src: "/models/women_model.jpg",
    hoverSrc: "/models/women_model.jpg",
    alt: "DRIPEGO women's collection",
    href: "/women",
  },
];

export default function Values() {
  return (
    <section id="vision" className="px-4 py-16 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1400px]">

        <AnimatedSection className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-[10px] font-semibold tracking-[0.5em] text-white/30 uppercase">Shop by Gender</p>
            <h2 className="text-4xl font-black uppercase leading-none tracking-tight text-white sm:text-5xl lg:text-6xl">
              Men &amp; Women
              <br />
              <span className="text-white/30">Dressed Different.</span>
            </h2>
          </div>
          <p className="max-w-xs text-xs leading-5 text-white/35 lg:text-right">
            Two cuts. One standard. Dressed for arrival, not permission.
          </p>
        </AnimatedSection>

        <div className="grid gap-4 md:grid-cols-2">
          {panels.map((panel, i) => (
            <AnimatedSection key={panel.tag} delay={i * 0.1}>
              <Link href={panel.href}>
                <motion.article
                  className="group relative h-[460px] cursor-pointer overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0b0b0b] lg:h-[520px]"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.div className="absolute inset-0" whileHover={{ scale: 1.06 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
                    <Image src={panel.src} alt={panel.alt} fill sizes="(max-width:768px) 100vw,50vw" className="object-cover object-top transition-opacity duration-700 group-hover:opacity-0" />
                    <Image src={panel.hoverSrc} alt={panel.alt} fill sizes="(max-width:768px) 100vw,50vw" className="object-cover object-top opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                  <p className="absolute right-5 top-5 text-[9px] font-semibold tracking-[0.4em] text-white/40 uppercase">{panel.tag}</p>
                  <div className="absolute bottom-0 left-0 right-0 p-7">
                    <p className="mb-2 text-[10px] font-medium tracking-[0.4em] text-white/30 uppercase">{panel.subtext}</p>
                    <p className="whitespace-pre-line text-3xl font-black uppercase leading-[0.9] tracking-tight text-white sm:text-4xl">{panel.headline}</p>
                    <div className="mt-5 inline-flex h-9 items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.06] px-5 text-[10px] font-semibold tracking-[0.2em] uppercase text-white/60">
                      Shop {panel.tag.split("/ ")[1]}
                    </div>
                  </div>
                </motion.article>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
