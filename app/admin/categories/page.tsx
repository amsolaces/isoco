"use client";

import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, ArrowUpDown, Loader2, Upload, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

export default function CategoriesManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadCategories() {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  // Sync slug
  useEffect(() => {
    if (!editingId && name) {
      setSlug(
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  }, [name, editingId]);

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0 || !supabase) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const filePath = `categories/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("dripego-media").upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("dripego-media").getPublicUrl(filePath);
      setBannerUrl(publicUrl);
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !name.trim()) return;
    setMessage("");

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      banner_url: bannerUrl || null,
    };

    try {
      if (editingId) {
        // Edit mode
        const { error } = await supabase.from("categories").update(payload).eq("id", editingId);
        if (error) throw error;
        setMessage("Category updated.");
      } else {
        // Create mode
        const { error } = await supabase.from("categories").insert({
          ...payload,
          sort_order: categories.length,
        });
        if (error) throw error;
        setMessage("Category created.");
      }
      resetForm();
      loadCategories();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  }

  function handleEdit(cat: any) {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setBannerUrl(cat.banner_url || "");
  }

  async function handleDelete(id: number) {
    if (!supabase || !confirm("Are you sure? Products in this category will be uncategorized.")) return;
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      setCategories(categories.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setBannerUrl("");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Categories</h1>
          <p className="text-xs text-white/45">Manage gender ranges, drops, oversized fits, and capsules.</p>
        </div>
        <button
          onClick={loadCategories}
          className="grid size-10 place-items-center rounded-xl border border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* FORM PANEL */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              {editingId ? "Edit Category" : "New Category"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OVERSIZED"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20 uppercase"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">Slug</label>
                <input
                  type="text"
                  required
                  placeholder="oversized"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs text-white outline-none focus:border-white/20 resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">Banner Image</label>
                <div className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/[0.01] p-4 text-center">
                  {bannerUrl ? (
                    <div className="relative group size-24 rounded-lg overflow-hidden bg-[#151515]">
                      <img src={bannerUrl} alt="Banner" className="object-cover size-full" />
                      <button
                        type="button"
                        onClick={() => setBannerUrl("")}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                      >
                        <Trash2 size={14} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center h-24">
                      {uploading ? (
                        <Loader2 className="animate-spin text-white/20" size={16} />
                      ) : (
                        <>
                          <Upload size={16} className="text-white/20 mb-1.5" />
                          <span className="text-[9px] font-bold tracking-widest text-white/30 uppercase">Upload Banner</span>
                        </>
                      )}
                      <input type="file" accept="image/*" disabled={uploading} onChange={handleBannerUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {message && <p className="text-[10px] text-white/55 tracking-wider">{message}</p>}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex h-11 flex-1 items-center justify-center rounded-xl bg-white text-[10px] font-bold uppercase tracking-widest text-black hover:bg-white/88 cursor-pointer"
                >
                  Save
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex h-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.02] px-4 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* LIST PANEL */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Categories Catalog</h3>

            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-white/20" size={20} />
                </div>
              ) : categories.length === 0 ? (
                <p className="text-center text-xs text-white/20 py-10">No categories created.</p>
              ) : (
                categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between rounded-xl bg-white/[0.02] p-4 border border-white/[0.04] hover:bg-white/[0.03] transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative size-12 rounded-lg bg-[#141414] overflow-hidden border border-white/[0.06] shrink-0">
                        {cat.banner_url ? (
                          <img src={cat.banner_url} alt={cat.name} className="object-cover size-full" />
                        ) : (
                          <div className="size-full flex items-center justify-center text-[10px] text-white/10 font-bold uppercase">DE</div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white uppercase tracking-wider">{cat.name}</h4>
                        <p className="text-[10px] text-white/30 tracking-wider font-mono">slug: {cat.slug}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="grid size-8 place-items-center rounded-lg border border-white/10 text-white/40 hover:bg-white/10 hover:text-white cursor-pointer"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="grid size-8 place-items-center rounded-lg border border-white/10 text-red-500/40 hover:bg-red-950/20 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
