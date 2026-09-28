"use client";

import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Loader2, Upload, X, ArrowRight, Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  slug: z.string().min(2, "Slug must be at least 2 characters."),
  description: z.string().optional(),
  short_description: z.string().optional(),
  price: z.number().min(0, "Price must be positive."),
  compare_price: z.number().optional(),
  cost_price: z.number().optional(),
  sku: z.string().min(1, "SKU is required."),
  category_id: z.string().optional(),
  gender: z.string().default("unisex"),
  collection: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  stock_quantity: z.number().int().min(0),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  weight: z.number().optional(),
  material: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: any;
  productId?: string;
}

const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];
const genderOptions = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "unisex", label: "Unisex" },
];
const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export default function ProductForm({ initialData, productId }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [thumbnail, setThumbnail] = useState<string>(initialData?.thumbnail || "");
  const [tagInput, setTagInput] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      short_description: initialData?.short_description || "",
      price: initialData?.price ? Number(initialData.price) : 0,
      compare_price: initialData?.compare_price ? Number(initialData.compare_price) : undefined,
      cost_price: initialData?.cost_price ? Number(initialData.cost_price) : undefined,
      sku: initialData?.sku || "",
      category_id: initialData?.category_id ? String(initialData.category_id) : "",
      gender: initialData?.gender || "unisex",
      collection: initialData?.collection || "",
      status: initialData?.status || "draft",
      tags: initialData?.tags || [],
      featured: initialData?.featured || false,
      stock_quantity: initialData?.stock_quantity ? Number(initialData.stock_quantity) : 0,
      sizes: initialData?.sizes || [],
      colors: initialData?.colors || [],
      weight: initialData?.weight ? Number(initialData.weight) : undefined,
      material: initialData?.material || "",
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const currentTags = watch("tags") || [];
  const currentColors = watch("colors") || [];
  const currentSizes = watch("sizes") || [];

  // Fetch categories
  useEffect(() => {
    async function loadCategories() {
      if (!supabase) return;
      const { data } = await supabase.from("categories").select("*").order("sort_order", { ascending: true });
      if (data) setCategories(data);
    }
    loadCategories();
  }, []);

  // Sync Name to Slug
  const nameValue = watch("name");
  useEffect(() => {
    if (!initialData && nameValue) {
      const slugified = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setValue("slug", slugified);
    }
  }, [nameValue, setValue, initialData]);

  // Handle image upload to Supabase
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, isThumbnail = false) {
    if (!e.target.files || e.target.files.length === 0 || !supabase) return;
    setUploading(true);
    setMessage("");

    try {
      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from("dripego-media")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage.from("dripego-media").getPublicUrl(filePath);

      if (isThumbnail) {
        setThumbnail(publicUrl);
      } else {
        setImages((prev) => [...prev, publicUrl]);
      }
    } catch (err: any) {
      console.error("Storage upload failed:", err);
      setMessage(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  }

  // Handle Form Submission
  async function onSubmit(data: ProductFormValues) {
    if (!supabase) return;
    setSaving(true);
    setMessage("");

    const payload = {
      ...data,
      category_id: data.category_id ? Number(data.category_id) : null,
      images,
      thumbnail,
    };

    try {
      if (productId) {
        // Edit mode
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", productId);

        if (error) throw error;
        setMessage("Product updated successfully.");
      } else {
        // Create mode
        const { error } = await supabase
          .from("products")
          .insert(payload);

        if (error) throw error;
        setMessage("Product created successfully.");
      }

      // Re-route to products dashboard
      setTimeout(() => {
        router.push("/admin/products");
      }, 1200);
    } catch (err: any) {
      console.error("Product save error:", err);
      setMessage(`Error saving product: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      {/* Save indicators */}
      {message && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-xs tracking-wider text-white">
          {message}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-12">
        {/* LEFT COLUMN: Main Info */}
        <div className="space-y-6 lg:col-span-8">
          {/* Card: Identity */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Product Identity</h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">Name</label>
                <input
                  type="text"
                  {...register("name")}
                  placeholder="e.g. OVERSIZED WAISTCOAT"
                  className="h-12 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20"
                />
                {errors.name && <p className="text-red-400 text-[10px] mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">Slug (Auto-generated)</label>
                <input
                  type="text"
                  {...register("slug")}
                  placeholder="oversized-waistcoat"
                  className="h-12 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20"
                />
                {errors.slug && <p className="text-red-400 text-[10px] mt-1">{errors.slug.message}</p>}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">Description</label>
              <textarea
                rows={5}
                {...register("description")}
                placeholder="Product description detailing fabric structure, features, fit, etc."
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs text-white outline-none focus:border-white/20 resize-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">Short Description</label>
              <input
                type="text"
                {...register("short_description")}
                placeholder="Quick hook copy for product listings..."
                className="h-12 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20"
              />
            </div>
          </div>

          {/* Card: Pricing & Stock */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Pricing & Supply</h3>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">Selling Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register("price", { valueAsNumber: true })}
                  placeholder="145.00"
                  className="h-12 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20"
                />
                {errors.price && <p className="text-red-400 text-[10px] mt-1">{errors.price.message}</p>}
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">Compare Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register("compare_price", { valueAsNumber: true })}
                  placeholder="220.00"
                  className="h-12 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">Cost Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register("cost_price", { valueAsNumber: true })}
                  placeholder="40.00"
                  className="h-12 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">SKU</label>
                <input
                  type="text"
                  {...register("sku")}
                  placeholder="DP001-WC-BLK"
                  className="h-12 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20"
                />
                {errors.sku && <p className="text-red-400 text-[10px] mt-1">{errors.sku.message}</p>}
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">Stock Quantity</label>
                <input
                  type="number"
                  {...register("stock_quantity", { valueAsNumber: true })}
                  placeholder="50"
                  className="h-12 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20"
                />
              </div>
            </div>
          </div>

          {/* Card: Media Library */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Media Manager</h3>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Thumbnail field */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-3">Thumbnail (Main listing)</label>
                <div className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/[0.01] p-4 text-center">
                  {thumbnail ? (
                    <div className="relative group size-28 rounded-lg overflow-hidden bg-[#151515] border border-white/10">
                      <img src={thumbnail} alt="Thumbnail preview" className="object-cover size-full" />
                      <button
                        type="button"
                        onClick={() => setThumbnail("")}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                      >
                        <Trash2 size={16} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center h-28">
                      <Upload size={20} className="text-white/20 mb-2" />
                      <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Upload JPEG</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploading}
                        onChange={(e) => handleImageUpload(e, true)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Gallery Images field */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-3">Gallery Images</label>
                <div className="flex flex-wrap gap-3">
                  {images.map((url, index) => (
                    <div key={index} className="relative group size-20 rounded-lg overflow-hidden bg-[#151515] border border-white/10">
                      <img src={url} alt="Gallery item" className="object-cover size-full" />
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, idx) => idx !== index))}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                      >
                        <Trash2 size={14} className="text-white" />
                      </button>
                    </div>
                  ))}

                  <label className="cursor-pointer flex flex-col items-center justify-center size-20 border border-dashed border-white/10 rounded-lg bg-white/[0.01] hover:bg-white/[0.03] transition">
                    {uploading ? (
                      <Loader2 className="animate-spin text-white/20" size={16} />
                    ) : (
                      <>
                        <Plus size={16} className="text-white/30" />
                        <span className="text-[8px] font-bold tracking-wider text-white/30 uppercase mt-1">Add Image</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      onChange={(e) => handleImageUpload(e, false)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Settings / Meta */}
        <div className="space-y-6 lg:col-span-4">
          {/* Card: Status & Categorization */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Status & Categories</h3>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">Publish Status</label>
              <select
                {...register("status")}
                className="h-12 w-full rounded-xl border border-white/[0.06] bg-[#060606] px-4 text-xs text-white outline-none focus:border-white/20 uppercase tracking-wider"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">Category</label>
              <select
                {...register("category_id")}
                className="h-12 w-full rounded-xl border border-white/[0.06] bg-[#060606] px-4 text-xs text-white outline-none focus:border-white/20 uppercase tracking-wider"
              >
                <option value="">No Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">Target Gender</label>
              <select
                {...register("gender")}
                className="h-12 w-full rounded-xl border border-white/[0.06] bg-[#060606] px-4 text-xs text-white outline-none focus:border-white/20 uppercase tracking-wider"
              >
                {genderOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">Collection</label>
              <input
                type="text"
                {...register("collection")}
                placeholder="e.g. DROP 001"
                className="h-12 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20"
              />
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.05] pt-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Featured Product</span>
              <input
                type="checkbox"
                {...register("featured")}
                className="h-5 w-5 rounded border-white/10 bg-[#060606] accent-white"
              />
            </div>
          </div>

          {/* Card: Sizes & Colors */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Attributes</h3>

            {/* Size selection */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">Available Sizes</label>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((size) => {
                  const isChecked = currentSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        const newSizes = isChecked
                          ? currentSizes.filter((s) => s !== size)
                          : [...currentSizes, size];
                        setValue("sizes", newSizes);
                      }}
                      className={`h-9 w-12 rounded-lg border text-xs tracking-wider transition ${
                        isChecked
                          ? "bg-white text-black border-white font-bold"
                          : "border-white/10 bg-white/[0.01] text-white/40 hover:text-white"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color tags */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">Colors</label>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {currentColors.map((color) => (
                  <span
                    key={color}
                    className="inline-flex h-7 items-center gap-1.5 rounded-full bg-white/[0.05] border border-white/10 pl-3 pr-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/70"
                  >
                    <span>{color}</span>
                    <button
                      type="button"
                      onClick={() => setValue("colors", currentColors.filter((c) => c !== color))}
                      className="text-white/30 hover:text-white"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ADD COLOR"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && colorInput.trim()) {
                      e.preventDefault();
                      setValue("colors", [...currentColors, colorInput.trim()]);
                      setColorInput("");
                    }
                  }}
                  className="h-10 flex-1 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 text-xs text-white outline-none focus:border-white/20"
                />
              </div>
            </div>

            {/* Material & Weight */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">Material</label>
                <input
                  type="text"
                  {...register("material")}
                  placeholder="100% COTTON"
                  className="h-10 w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 text-xs text-white outline-none focus:border-white/20"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">Weight (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register("weight", { valueAsNumber: true })}
                  placeholder="0.45"
                  className="h-10 w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 text-xs text-white outline-none focus:border-white/20"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6">
            <motion.button
              type="submit"
              disabled={saving}
              className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-white text-[11px] font-bold uppercase tracking-[0.12em] text-black transition hover:bg-white/88 disabled:opacity-50 cursor-pointer"
              whileTap={{ scale: 0.98 }}
            >
              {saving ? (
                <Loader2 className="animate-spin" size={15} />
              ) : (
                <>
                  <span>{productId ? "Save Changes" : "Create Product"}</span>
                  <ArrowRight size={13} strokeWidth={2.2} />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </form>
  );
}
