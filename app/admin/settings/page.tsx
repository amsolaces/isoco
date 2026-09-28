"use client";

import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Save, RefreshCw, Loader2, Globe, ShieldCheck, Truck } from "lucide-react";
import { useEffect, useState } from "react";

export default function SettingsManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Global Settings State
  const [general, setGeneral] = useState({
    storeName: "DRIPEGO",
    storeEmail: "hello@dripego.com",
    storePhone: "+91 98765 43210",
    storeAddress: "Mumbai, Maharashtra, India",
  });

  const [socials, setSocials] = useState({
    instagram: "https://www.instagram.com/shopdripego/",
    twitter: "https://x.com",
    tiktok: "https://tiktok.com",
  });

  const [seo, setSeo] = useState({
    metaTitle: "DRIPEGO | Luxury Fashion House Capsule",
    metaDescription: "Exclusive drops. Premium materials, structured silhouettes, made in limited batches. Not for everyone.",
    googleAnalyticsId: "G-XXXXXXXXXX",
  });

  const [financials, setFinancials] = useState({
    currency: "INR",
    taxRatePercentage: 18,
    flatShippingRate: 100.00,
  });

  async function loadSettings() {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("content_settings")
        .select("*")
        .eq("key", "settings")
        .single();

      if (error && error.code !== "PGRST116") throw error; // Ignore not found error

      if (data && data.value) {
        const val = data.value;
        if (val.general) setGeneral(val.general);
        if (val.socials) setSocials(val.socials);
        if (val.seo) setSeo(val.seo);
        if (val.financials) setFinancials(val.financials);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setSaving(true);
    setMessage("");

    const payload = {
      general,
      socials,
      seo,
      financials,
    };

    try {
      const { error } = await supabase
        .from("content_settings")
        .upsert({
          key: "settings",
          value: payload,
          updated_at: new Date(),
        });

      if (error) throw error;
      setMessage("Store settings updated successfully.");
    } catch (err: any) {
      console.error(err);
      setMessage(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSaveSettings} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">General Settings</h1>
          <p className="text-xs text-white/45">Configure store info, currency settings, shipping rules, and SEO indexing.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadSettings}
            className="grid size-10 place-items-center rounded-xl border border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-black transition hover:bg-white/88 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="animate-spin" size={13} /> : <Save size={13} strokeWidth={2.5} />}
            <span>Save Settings</span>
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
        <div className="grid gap-6 lg:grid-cols-12">
          {/* LEFT: General Info & SEO */}
          <div className="lg:col-span-8 space-y-6">
            {/* Store bio */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Globe size={14} className="text-white/30" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Store Identity</h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Store Name</label>
                  <input
                    type="text"
                    required
                    value={general.storeName}
                    onChange={(e) => setGeneral({ ...general, storeName: e.target.value })}
                    className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={general.storeEmail}
                    onChange={(e) => setGeneral({ ...general, storeEmail: e.target.value })}
                    className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Support Phone</label>
                  <input
                    type="text"
                    value={general.storePhone}
                    onChange={(e) => setGeneral({ ...general, storePhone: e.target.value })}
                    className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Physical Location</label>
                  <input
                    type="text"
                    value={general.storeAddress}
                    onChange={(e) => setGeneral({ ...general, storeAddress: e.target.value })}
                    className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20"
                  />
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={14} className="text-white/30" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">SEO & Tagging Metadata</h3>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Meta Title</label>
                <input
                  type="text"
                  value={seo.metaTitle}
                  onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
                  className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Meta Description</label>
                <textarea
                  rows={3}
                  value={seo.metaDescription}
                  onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs text-white outline-none focus:border-white/20 resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Google Analytics ID</label>
                <input
                  type="text"
                  value={seo.googleAnalyticsId}
                  onChange={(e) => setSeo({ ...seo, googleAnalyticsId: e.target.value })}
                  className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20 font-mono"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Financials & Socials */}
          <div className="lg:col-span-4 space-y-6">
            {/* Financial settings */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Truck size={14} className="text-white/30" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Rates & Financials</h3>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Currency Type</label>
                <select
                  value={financials.currency}
                  onChange={(e) => setFinancials({ ...financials, currency: e.target.value })}
                  className="h-11 w-full rounded-xl border border-white/[0.06] bg-[#060606] px-4 text-xs text-white outline-none focus:border-white/20 uppercase tracking-wider"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Store Tax Rate (%)</label>
                <input
                  type="number"
                  value={financials.taxRatePercentage}
                  onChange={(e) => setFinancials({ ...financials, taxRatePercentage: parseInt(e.target.value) || 0 })}
                  className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Flat Shipping Rate (₹)</label>
                <input
                  type="number"
                  step="1"
                  value={financials.flatShippingRate}
                  onChange={(e) => setFinancials({ ...financials, flatShippingRate: parseFloat(e.target.value) || 0.00 })}
                  className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20"
                />
              </div>
            </div>

            {/* Social channels */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Social Networks</h3>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Instagram Profile</label>
                <input
                  type="url"
                  value={socials.instagram}
                  onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                  className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Twitter / X URL</label>
                <input
                  type="url"
                  value={socials.twitter}
                  onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
                  className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">TikTok URL</label>
                <input
                  type="url"
                  value={socials.tiktok}
                  onChange={(e) => setSocials({ ...socials, tiktok: e.target.value })}
                  className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
