"use client";

import { motion } from "framer-motion";

const words = [
  "DRIPEGO", "was", "created", "for", "people", "who", "stopped",
  "waiting", "for", "permission.", "The", "ones", "who", "walk",
  "in", "first.", "Speak", "last.", "And", "leave", "remembered.",
];

export default function BrandStory() {
  return (
    <section className="relative overflow-hidden px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
      {/* Hairline top border */}
      <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent sm:inset-x-8 lg:inset-x-10" />

      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-0">

          {/* Left — label */}
          <motion.div
            className="lg:col-span-4"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[10px] font-semibold tracking-[0.6em] text-white/25 uppercase">
              Brand Story
            </p>
            <div className="mt-8 h-px w-12 bg-white/[0.15]" />
          </motion.div>

          {/* Right — editorial content */}
          <div className="lg:col-span-8">
            <motion.h2
              className="mb-10 text-4xl font-black uppercase leading-none tracking-tight text-white sm:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              Not Built
              <br />
              <span style={{ WebkitTextStroke: "1px rgba(255,255,255,0.2)", color: "transparent" }}>
                To Fit In.
              </span>
            </motion.h2>

            {/* Animated word reveal */}
            <motion.p
              className="text-xl font-light leading-[1.85] text-white/30 sm:text-2xl lg:text-[1.6rem]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              {words.map((word, i) => (
                <motion.span
                  key={i}
                  className="inline-block mr-[0.28em]"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.04,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {word === "DRIPEGO" ? (
                    <span className="font-semibold text-white/70">{word}</span>
                  ) : word.endsWith(".") ? (
                    <span className="text-white/55">{word}</span>
                  ) : (
                    word
                  )}
                </motion.span>
              ))}
            </motion.p>

            {/* Pull quote */}
            <motion.div
              className="mt-16 border-l border-white/[0.1] pl-8"
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            >
              <p className="text-[13px] font-semibold uppercase tracking-[0.3em] text-white/25">
                EST. 2026
              </p>
              <p className="mt-2 text-[13px] leading-6 text-white/20">
                DRIPEGO — Own The Room.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Hairline bottom border */}
      <div className="pointer-events-none absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent sm:inset-x-8 lg:inset-x-10" />
    </section>
  );
}
