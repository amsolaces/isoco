"use client";

import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Save, RefreshCw, Loader2, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function ContentEditor() {
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState("");

  // Home Page Editable States
  const [hero, setHero] = useState({
    title: "Own The\nRoom.",
    subtitle: "For those who stopped asking for permission.",
    buttonText: "Join Waitlist",
    buttonLink: "#contact",
  });

  const [manifesto, setManifesto] = useState({
    title: "The Manifesto",
    text: "DRIPEGO is more than clothing. It is an extension of visual identity. A luxury capsule for the silent statement. High quality materials, structured silhouettes, made in limited drops.",
  });

  const [showcase, setShowcase] = useState({
    title: "Drop 001 Capsule",
    subtitle: "Curated essentials for the new aesthetic.",
  });

  async function loadContentSettings() {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from("content_settings").select("*");
      if (error) throw error;

      if (data && data.length > 0) {
        data.forEach((row: any) => {
          if (row.key === "hero") setHero(row.value);
          if (row.key === "manifesto") setManifesto(row.value);
          if (row.key === "showcase") setShowcase(row.value);
        });
      }
    } catch (err) {
      console.error("Failed to load page text configurations:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContentSettings();
  }, []);

  async function handlePublish() {
    if (!supabase) return;
    setPublishing(true);
    setMessage("");

    try {
      // Save Hero
      const { error: heroErr } = await supabase
        .from("content_settings")
        .upsert({ key: "hero", value: hero, updated_at: new Date() });

      // Save Manifesto
      const { error: manErr } = await supabase
        .from("content_settings")
        .upsert({ key: "manifesto", value: manifesto, updated_at: new Date() });

      // Save Showcase
      const { error: showErr } = await supabase
        .from("content_settings")
        .upsert({ key: "showcase", value: showcase, updated_at: new Date() });

      if (heroErr || manErr || showErr) throw new Error("Upsert operation failed.");

      setMessage("Changes published successfully to the homepage.");
    } catch (err: any) {
      console.error(err);
      setMessage(`Failed to publish: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Homepage Editor</h1>
          <p className="text-xs text-white/45">Modify homepage copy, headlines, and call-to-actions without coding.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadContentSettings}
            className="grid size-10 place-items-center rounded-xl border border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-black transition hover:bg-white/88 disabled:opacity-50 cursor-pointer"
          >
            {publishing ? <Loader2 className="animate-spin" size={13} /> : <Save size={13} strokeWidth={2.5} />}
            <span>Publish Changes</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-xs tracking-wider text-white">
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-white/20" size={24} />
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-12">
          {/* LEFT: Sections Form */}
          <div className="lg:col-span-8 space-y-6">
            {/* HERO SECTION */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-white" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Hero Header Section</h3>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Main Title Headline</label>
                <textarea
                  rows={2}
                  value={hero.title}
                  onChange={(e) => setHero({ ...hero, title: e.target.value })}
                  placeholder="Own The\nRoom."
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs font-bold text-white outline-none focus:border-white/20 resize-none font-mono"
                />
                <p className="text-[9px] text-white/20 mt-1">Use `\n` to denote where line breaks occur.</p>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Campaign Subtitle</label>
                <input
                  type="text"
                  value={hero.subtitle}
                  onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                  placeholder="For those who stopped asking for permission."
                  className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Button Label</label>
                  <input
                    type="text"
                    value={hero.buttonText}
                    onChange={(e) => setHero({ ...hero, buttonText: e.target.value })}
                    placeholder="Join Waitlist"
                    className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Button Link URL</label>
                  <input
                    type="text"
                    value={hero.buttonLink}
                    onChange={(e) => setHero({ ...hero, buttonLink: e.target.value })}
                    placeholder="#contact"
                    className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20"
                  />
                </div>
              </div>
            </div>

            {/* MANIFESTO SECTION */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-white" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Brand Manifesto Block</h3>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Manifesto Title</label>
                <input
                  type="text"
                  value={manifesto.title}
                  onChange={(e) => setManifesto({ ...manifesto, title: e.target.value })}
                  placeholder="The Manifesto"
                  className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Manifesto Narrative Body</label>
                <textarea
                  rows={4}
                  value={manifesto.text}
                  onChange={(e) => setManifesto({ ...manifesto, text: e.target.value })}
                  placeholder="Brand story details..."
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs text-white outline-none focus:border-white/20 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* PRODUCT SHOWCASE SECTION */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-white" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Capsule Showcase Segment</h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Showcase Title</label>
                  <input
                    type="text"
                    value={showcase.title}
                    onChange={(e) => setShowcase({ ...showcase, title: e.target.value })}
                    placeholder="Drop 001 Capsule"
                    className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Showcase Subtitle</label>
                  <input
                    type="text"
                    value={showcase.subtitle}
                    onChange={(e) => setShowcase({ ...showcase, subtitle: e.target.value })}
                    placeholder="Curated essentials..."
                    className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Live Preview Helper */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-3">
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/35">Mobile Live Preview</span>
                <PlayCircle size={14} className="text-white/30" />
              </div>

              {/* Mock Mobile frame */}
              <div className="rounded-xl border border-white/10 bg-[#060606] overflow-hidden p-4 relative min-h-[300px] flex flex-col justify-between select-none">
                {/* Statusbar */}
                <div className="flex justify-between items-center text-[8px] text-white/20 font-bold uppercase mb-4">
                  <span>dripego</span>
                  <span>10:42 AM</span>
                </div>

                {/* Hero preview mock */}
                <div className="my-auto space-y-3.5">
                  <span className="text-[8px] tracking-[0.4em] font-semibold text-white/30 uppercase">Drop 001</span>
                  <h1 className="text-4xl font-black uppercase text-white leading-none whitespace-pre-line">
                    {hero.title}
                  </h1>
                  <p className="text-[10px] text-white/40 leading-normal max-w-[180px]">
                    {hero.subtitle}
                  </p>
                  <div>
                    <span className="inline-block rounded-full bg-white text-[8px] font-bold uppercase px-4 py-2 text-black tracking-wider">
                      {hero.buttonText}
                    </span>
                  </div>
                </div>

                {/* Footer preview mock */}
                <div className="text-center text-[7px] text-white/10 uppercase tracking-widest mt-6">
                  est. 2026
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
