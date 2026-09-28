"use client";

import React, { useState } from "react";
import { useReality } from "@/context/RealityThemeContext";

export default function DripegoWaitlist() {
  const { reality } = useReality();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <section id="waitlist" className="relative py-16 md:py-24 px-4 md:px-8 border-t transition-colors duration-400 bg-[var(--card-bg)]" style={{ borderColor: "var(--border-light)" }}>
      {/* Header Bar */}
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest opacity-60 mb-8 pb-3 border-b" style={{ borderColor: "var(--border-light)" }}>
        <span>05 // ALLOCATION VAULT</span>
        <span>PRIVATE DROP 002 ACCESS</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6">
          <div className="inline-block border px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase mb-3 bg-[var(--bg-color)]">
            EXCLUSIVE ALLOCATION
          </div>
          <h2 className="font-reality text-4xl sm:text-6xl leading-[0.95] mb-4">
            Private Drop Vault.
            <br />
            Zero Public Drops.
          </h2>
          <p className="text-xs font-mono leading-relaxed opacity-75 max-w-md">
            Units are strictly produced in limited runs of 500 numbered pieces. Register your transmission frequency to receive cryptographic allocation keys 24 hours prior to release.
          </p>
        </div>

        {/* Input Form */}
        <div className="lg:col-span-6">
          <div className="border p-6 md:p-8 bg-[var(--bg-color)]" style={{ borderColor: "var(--border-color)" }}>
            <div className="flex justify-between items-center font-mono text-[10px] uppercase mb-4 opacity-60">
              <span>Transmitter Channel</span>
              <span>AES-256 ENCRYPTED</span>
            </div>

            {submitted ? (
              <div className="py-6 text-center font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block mb-3 animate-ping" />
                <h4 className="text-base font-bold uppercase tracking-wider mb-1 text-[var(--accent-color)]">
                  Frequency Confirmed [✓]
                </h4>
                <p className="text-xs opacity-75">
                  Your allocation address has been registered in the Dripego Ledger. Drop 002 keys will be transmitted to: <span className="font-semibold">{email}</span>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="ENTER YOUR EMAIL ADDRESS..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-cursor="TYPE"
                    className="w-full border px-4 py-3 font-mono text-xs uppercase bg-[var(--card-bg)] text-[var(--text-primary)] placeholder:opacity-40 focus:outline-none focus:border-[var(--accent-color)] transition-colors"
                    style={{ borderColor: "var(--border-color)" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  data-cursor="SUBMIT"
                  className="w-full border py-3 px-6 font-mono text-xs uppercase tracking-widest font-bold transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: "var(--accent-color)",
                    color: "var(--bg-color)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <span>{loading ? "TRANSMITTING..." : "REGISTER FOR VAULT ALLOCATION"}</span>
                  <span>[→]</span>
                </button>

                <div className="text-[10px] font-mono opacity-50 flex justify-between">
                  <span>NO HYPE SPAM. ONLY DROPS.</span>
                  <span>TIER: ARCHIVAL MEMBER</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
