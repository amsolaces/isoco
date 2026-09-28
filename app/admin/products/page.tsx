"use client";

import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Copy,
  Archive,
  ArrowUpDown,
  Filter,
  RefreshCw,
  MoreVertical,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProductsList() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  // Load initial data
  async function loadProducts() {
    if (!supabase) return;
    setLoading(true);

    try {
      // Fetch products
      let query = supabase.from("products").select("*, categories(name)");

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      setProducts(data || []);

      // Fetch categories for filters
      const { data: catData } = await supabase.from("categories").select("*");
      if (catData) setCategories(catData);
    } catch (err) {
      console.error("Failed to load products list:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  // Perform quick actions
  async function handleDelete(id: number) {
    if (!supabase || !confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete operation failed.");
    }
  }

  async function handleDuplicate(product: any) {
    if (!supabase) return;

    try {
      const duplicated = {
        name: `${product.name} (Copy)`,
        slug: `${product.slug}-copy-${Math.random().toString(36).substring(2, 6)}`,
        description: product.description,
        short_description: product.short_description,
        price: product.price,
        compare_price: product.compare_price,
        cost_price: product.cost_price,
        sku: `${product.sku}-COPY-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
        category_id: product.category_id,
        gender: product.gender,
        collection: product.collection,
        status: "draft",
        tags: product.tags,
        featured: product.featured,
        stock_quantity: product.stock_quantity,
        sizes: product.sizes,
        colors: product.colors,
        weight: product.weight,
        material: product.material,
        images: product.images,
        thumbnail: product.thumbnail,
      };

      const { data, error } = await supabase.from("products").insert(duplicated).select().single();
      if (error) throw error;
      setProducts([data, ...products]);
    } catch (err) {
      console.error("Duplicate failed:", err);
      alert("Duplication failed.");
    }
  }

  async function handleArchive(id: number) {
    if (!supabase) return;
    try {
      const { error } = await supabase.from("products").update({ status: "archived" }).eq("id", id);
      if (error) throw error;
      setProducts(products.map((p) => (p.id === id ? { ...p, status: "archived" } : p)));
    } catch (err) {
      console.error("Archive failed:", err);
    }
  }

  // Multi-select actions
  function toggleSelectAll() {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  }

  function toggleSelectOne(id: number) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  }

  async function handleBulkDelete() {
    if (!supabase || selectedIds.length === 0 || !confirm(`Delete ${selectedIds.length} items?`)) return;

    try {
      const { error } = await supabase.from("products").delete().in("id", selectedIds);
      if (error) throw error;
      setProducts(products.filter((p) => !selectedIds.includes(p.id)));
      setSelectedIds([]);
    } catch (err) {
      console.error("Bulk delete failed:", err);
    }
  }

  // Client filtering
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesGender = genderFilter === "all" || p.gender === genderFilter;
    const matchesCategory = categoryFilter === "all" || String(p.category_id) === categoryFilter;

    return matchesSearch && matchesStatus && matchesGender && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Products Catalog</h1>
          <p className="text-xs text-white/45">Manage items, stock quantities, attributes, and tags.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadProducts}
            className="grid size-10 place-items-center rounded-xl border border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <Link
            href="/admin/products/new"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-black transition hover:bg-white/88"
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>New Product</span>
          </Link>
        </div>
      </div>

      {/* FILTER & SEARCH PANEL */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-5 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3 text-white/30" size={14} />
            <input
              type="text"
              placeholder="SEARCH BY PRODUCT NAME OR SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] pl-11 pr-4 text-xs text-white outline-none focus:border-white/20 uppercase tracking-wider placeholder:text-white/18"
            />
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/[0.06] bg-[#060606] px-4 text-xs text-white outline-none focus:border-white/20 uppercase tracking-wider"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div className="w-full md:w-40">
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/[0.06] bg-[#060606] px-4 text-xs text-white outline-none focus:border-white/20 uppercase tracking-wider"
            >
              <option value="all">All Genders</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-40">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/[0.06] bg-[#060606] px-4 text-xs text-white outline-none focus:border-white/20 uppercase tracking-wider"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Selected Rows Action Header */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between border-t border-white/[0.05] pt-3.5 px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
              Selected {selectedIds.length} Products
            </span>
            <button
              onClick={handleBulkDelete}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-red-950/20 border border-red-900/30 px-3 text-[10px] font-bold uppercase tracking-wider text-red-400 hover:bg-red-900/20 cursor-pointer"
            >
              <Trash2 size={11} />
              <span>Delete Selected</span>
            </button>
          </div>
        )}
      </div>

      {/* PRODUCTS TABLE */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">
                <th className="pb-3 w-8">
                  <input
                    type="checkbox"
                    checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-white/10 bg-[#060606] accent-white"
                  />
                </th>
                <th className="pb-3 px-4">Item</th>
                <th className="pb-3 px-4">SKU</th>
                <th className="pb-3 px-4">Category</th>
                <th className="pb-3 px-4">Stock</th>
                <th className="pb-3 px-4 text-right">Price</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs">
              {loading ? (
                // Skeletons
                [1, 2, 3].map((s) => (
                  <tr key={s} className="animate-pulse">
                    <td className="py-4"><div className="h-4 w-4 bg-white/5 rounded" /></td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 bg-white/5 rounded-lg" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-36 bg-white/5 rounded" />
                          <div className="h-2.5 w-16 bg-white/5 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4"><div className="h-3 w-16 bg-white/5 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-3 w-20 bg-white/5 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-3 w-10 bg-white/5 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-3 w-12 bg-white/5 rounded ml-auto" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-16 bg-white/5 rounded-full" /></td>
                    <td className="py-4 pl-4"><div className="h-6 w-16 bg-white/5 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-white/20">
                    No products found in the catalog.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  const isDrop = activeDropdown === p.id;
                  return (
                    <tr key={p.id} className="text-white/60 hover:bg-white/[0.01] transition-all">
                      <td className="py-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(p.id)}
                          className="h-4 w-4 rounded border-white/10 bg-[#060606] accent-white"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3.5">
                          <div className="relative size-10 rounded-lg bg-[#141414] overflow-hidden border border-white/[0.06] flex-shrink-0">
                            {p.thumbnail ? (
                              <img src={p.thumbnail} alt={p.name} className="object-cover size-full" />
                            ) : (
                              <div className="size-full flex items-center justify-center text-[10px] text-white/20 font-bold">DE</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link href={`/admin/products/${p.id}`} className="truncate block font-bold text-white hover:underline">
                              {p.name}
                            </Link>
                            <span className="text-[9px] uppercase tracking-wider text-white/22">
                              {p.gender || "Unisex"} {p.collection ? `| ${p.collection}` : ""}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[10px] text-white/45">{p.sku || "N/A"}</td>
                      <td className="py-3.5 px-4 text-white/40">{p.categories?.name || "Uncategorized"}</td>
                      <td className="py-3.5 px-4 font-medium">
                        {p.stock_quantity === 0 ? (
                          <span className="text-red-400 font-bold uppercase tracking-wider text-[10px]">OOS</span>
                        ) : (
                          <span>{p.stock_quantity}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-white">${Number(p.price).toFixed(2)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest ${
                          p.status === "published"
                            ? "bg-white/10 text-white/80"
                            : p.status === "archived"
                            ? "bg-white/[0.02] text-white/30"
                            : "bg-yellow-500/10 text-yellow-500/80"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 pl-4 text-right relative">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="grid size-7 place-items-center rounded-lg border border-white/10 text-white/40 hover:bg-white/10 hover:text-white"
                          >
                            <Edit size={12} />
                          </Link>
                          
                          <div className="relative">
                            <button
                              onClick={() => setActiveDropdown(isDrop ? null : p.id)}
                              className="grid size-7 place-items-center rounded-lg border border-white/10 text-white/40 hover:bg-white/10 hover:text-white"
                            >
                              <ChevronDown size={12} />
                            </button>

                            <AnimatePresence>
                              {isDrop && (
                                <>
                                  <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="absolute right-0 mt-1.5 w-36 rounded-xl border border-white/[0.08] bg-[#0f0f0f] p-1.5 shadow-xl z-50 text-left"
                                  >
                                    <button
                                      onClick={() => { handleDuplicate(p); setActiveDropdown(null); }}
                                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-white/60 hover:bg-white/[0.04] hover:text-white"
                                    >
                                      <Copy size={11} />
                                      <span>Duplicate</span>
                                    </button>
                                    <button
                                      onClick={() => { handleArchive(p.id); setActiveDropdown(null); }}
                                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-white/60 hover:bg-white/[0.04] hover:text-white"
                                    >
                                      <Archive size={11} />
                                      <span>Archive</span>
                                    </button>
                                    <div className="h-px bg-white/[0.05] my-1" />
                                    <button
                                      onClick={() => { handleDelete(p.id); setActiveDropdown(null); }}
                                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-red-400 hover:bg-red-900/10"
                                    >
                                      <Trash2 size={11} />
                                      <span>Delete</span>
                                    </button>
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
