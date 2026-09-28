"use client";

import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Upload, Copy, Trash2, Folder, File, ExternalLink, RefreshCw, Loader2, HardDrive } from "lucide-react";
import { useEffect, useState } from "react";

// Mock fallback media entries
const mockMedia = [
  {
    id: "media-1",
    name: "hero_model.png",
    url: "/models/hero_model.png",
    file_path: "products/hero_model.png",
    size_bytes: 1450000,
    mime_type: "image/png",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "media-2",
    name: "hanger_black.webp",
    url: "/lifestyle/hanger_black.webp",
    file_path: "products/hanger_black.webp",
    size_bytes: 350000,
    mime_type: "image/webp",
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  }
];

export default function MediaLibraryManager() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function loadMedia() {
    if (!supabase) return;
    setLoading(true);
    try {
      // 1. Fetch entries from media_library table
      const { data, error } = await supabase
        .from("media_library")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setMedia(data);
      } else {
        setMedia(mockMedia);
      }
    } catch (err) {
      console.error(err);
      setMedia(mockMedia);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMedia();
  }, []);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0 || !supabase) return;
    setUploading(true);

    try {
      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `library/${fileName}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("dripego-media")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage.from("dripego-media").getPublicUrl(filePath);

      // 3. Insert metadata record in public.media_library table
      const payload = {
        name: file.name,
        file_path: filePath,
        url: publicUrl,
        size_bytes: file.size,
        mime_type: file.type,
      };

      const { data: inserted, error: dbError } = await supabase
        .from("media_library")
        .insert(payload)
        .select()
        .single();

      if (dbError) throw dbError;

      // Update local state (remove mock items if loading real entries)
      const currentList = media.filter((m) => !m.id.startsWith("media-"));
      setMedia([inserted, ...currentList]);

    } catch (err: any) {
      console.error(err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(item: any) {
    if (!supabase || !confirm(`Delete file "${item.name}"? This action is permanent.`)) return;

    try {
      const isMock = item.id.startsWith("media-");
      
      if (!isMock) {
        // 1. Delete from Supabase Storage
        const { error: storageError } = await supabase.storage
          .from("dripego-media")
          .remove([item.file_path]);

        if (storageError) throw storageError;

        // 2. Delete metadata record
        const { error: dbError } = await supabase
          .from("media_library")
          .delete()
          .eq("id", item.id);

        if (dbError) throw dbError;
      }

      setMedia(media.filter((m) => m.id !== item.id));
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  }

  // Copy helper
  function handleCopyUrl(url: string, id: string) {
    // Check window domain context
    const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const filteredMedia = media.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchesType =
      typeFilter === "all" ||
      (typeFilter === "images" && m.mime_type.startsWith("image/")) ||
      (typeFilter === "videos" && m.mime_type.startsWith("video/"));
    return matchesSearch && matchesType;
  });

  const totalUsageBytes = media.reduce((acc, curr) => acc + curr.size_bytes, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Media Explorer</h1>
          <p className="text-xs text-white/45">Store, search, and copy URLs of high-definition campaign assets.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadMedia}
            className="grid size-10 place-items-center rounded-xl border border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <label className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-black transition hover:bg-white/88 cursor-pointer">
            {uploading ? (
              <Loader2 className="animate-spin" size={13} />
            ) : (
              <Upload size={13} strokeWidth={2.5} />
            )}
            <span>Upload File</span>
            <input type="file" accept="image/*,video/*" disabled={uploading} onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* STORAGE USAGE & FILTERS ROW */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Storage tracker */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-5 md:col-span-4 flex items-center justify-between gap-5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/35">Storage Usage</span>
            <p className="text-xl font-bold text-white">{formatSize(totalUsageBytes)}</p>
            <p className="text-[9px] text-white/20 tracking-wider">Public storage bucket `dripego-media`</p>
          </div>
          <HardDrive size={24} className="text-white/20 shrink-0" />
        </div>

        {/* Filter / Search dashboard */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-5 md:col-span-8 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-3 text-white/30" size={14} />
            <input
              type="text"
              placeholder="SEARCH BY FILE NAME..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] pl-11 pr-4 text-xs text-white outline-none focus:border-white/20 uppercase tracking-wider placeholder:text-white/18"
            />
          </div>

          <div className="w-full sm:w-44">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/[0.06] bg-[#060606] px-4 text-xs text-white outline-none focus:border-white/20 uppercase tracking-wider"
            >
              <option value="all">All File Types</option>
              <option value="images">Images Only</option>
              <option value="videos">Videos Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* MEDIA ASSETS GRID */}
      {loading && media.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-white/20" size={24} />
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-20 text-center text-white/20 text-xs">
          No files matching filters in storage.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredMedia.map((item) => {
            const isCopied = copiedId === item.id;
            return (
              <motion.div
                key={item.id}
                layout
                className="group relative rounded-2xl border border-white/[0.06] bg-[#0c0c0c] overflow-hidden p-3 space-y-3 flex flex-col justify-between shadow-sm hover:border-white/15 transition-all"
              >
                {/* Visual Preview */}
                <div className="relative aspect-square w-full rounded-lg bg-[#121212] border border-white/[0.04] overflow-hidden flex items-center justify-center select-none">
                  {item.mime_type.startsWith("image/") ? (
                    <img src={item.url} alt={item.name} className="object-cover size-full group-hover:scale-[1.03] transition-transform duration-500" />
                  ) : (
                    <Folder size={32} className="text-white/15" />
                  )}

                  {/* Hover Actions overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition duration-300">
                    <button
                      onClick={() => handleCopyUrl(item.url, item.id)}
                      className="grid size-9 place-items-center rounded-xl bg-white text-black hover:bg-white/88 transition cursor-pointer"
                      title="Copy public URL"
                    >
                      <Copy size={13} />
                    </button>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="grid size-9 place-items-center rounded-xl bg-white/[0.1] border border-white/10 text-white hover:bg-white/[0.2] transition cursor-pointer"
                      title="Open in tab"
                    >
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>

                {/* Info and delete actions */}
                <div className="space-y-1 min-w-0">
                  <p className="truncate text-xs font-bold text-white uppercase tracking-wider">{item.name}</p>
                  <div className="flex items-center justify-between text-[10px] text-white/35 font-medium tracking-wide">
                    <span>{formatSize(item.size_bytes)}</span>
                    <button
                      onClick={() => handleDelete(item)}
                      className="text-red-500/50 hover:text-red-400 font-bold uppercase tracking-widest text-[8px] cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Copied visual notification */}
                <AnimatePresence>
                  {isCopied && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute inset-x-3 bottom-3 bg-white text-black rounded-lg py-1.5 text-center text-[9px] font-bold uppercase tracking-widest pointer-events-none"
                    >
                      URL Copied
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
