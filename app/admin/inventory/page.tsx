"use client";

import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Box, RefreshCw, AlertTriangle, Plus, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

// Mock fallback inventory logs
const mockInventoryLogs = [
  { id: "log-1", product_name: "Oversized Tee (M)", delta: 25, reason: "Restock from vendor", date: "10 Jun 2026" },
  { id: "log-2", product_name: "Structured Blazer (L)", delta: 10, reason: "New product initial stock", date: "12 Jun 2026" },
  { id: "log-3", product_name: "Oversized Tee (M)", delta: -1, reason: "Order signup sale #de-1294", date: "15 Jun 2026" }
];

export default function InventoryManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [stockDelta, setStockDelta] = useState(0);
  const [adjustReason, setAdjustReason] = useState("restock");
  const [submitting, setSubmitting] = useState(false);

  async function loadInventory() {
    if (!supabase) return;
    setLoading(true);
    try {
      // 1. Fetch products stock levels
      const { data: pData } = await supabase.from("products").select("id, name, sku, stock_quantity, status");
      setProducts(pData || []);

      // 2. Fetch inventory logs
      const { data: lData } = await supabase
        .from("inventory_logs")
        .select("*, products(name)")
        .order("created_at", { ascending: false });

      if (lData && lData.length > 0) {
        const formatted = lData.map((l: any) => ({
          id: String(l.id),
          product_name: l.products?.name || "Deleted Product",
          delta: l.delta,
          reason: l.reason,
          date: new Date(l.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
        }));
        setLogs(formatted);
      } else {
        setLogs(mockInventoryLogs);
      }
    } catch (err) {
      console.error(err);
      setLogs(mockInventoryLogs);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();
  }, []);

  async function handleAdjustStock(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !selectedProduct || stockDelta === 0) return;
    setSubmitting(true);

    try {
      const newQuantity = Math.max(0, selectedProduct.stock_quantity + stockDelta);
      
      // Update products stock
      const { error: pError } = await supabase
        .from("products")
        .update({ stock_quantity: newQuantity })
        .eq("id", selectedProduct.id);

      if (pError) throw pError;

      // Add log
      const { error: lError } = await supabase
        .from("inventory_logs")
        .insert({
          product_id: selectedProduct.id,
          delta: stockDelta,
          reason: adjustReason,
        });

      if (lError) throw lError;

      setSelectedProduct(null);
      setStockDelta(0);
      setAdjustReason("restock");
      loadInventory();
    } catch (err: any) {
      alert(`Adjustment failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const lowStockProducts = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5);
  const outOfStockProducts = products.filter(p => p.stock_quantity === 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Inventory Monitor</h1>
          <p className="text-xs text-white/45">Track supplies, low stock indicators, and restock logs.</p>
        </div>
        <button
          onClick={loadInventory}
          className="grid size-10 place-items-center rounded-xl border border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* ALERTS ROW */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Low Stock Alerts */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-5">
          <div className="flex items-center gap-2 text-white/30 uppercase tracking-widest text-[9px] font-bold mb-3">
            <AlertTriangle className="text-yellow-500/80" size={14} />
            <span>Low Stock Items ({lowStockProducts.length})</span>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-white/20">No low stock items detected.</p>
          ) : (
            <div className="space-y-2.5">
              {lowStockProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between text-xs rounded-xl bg-white/[0.01] border border-white/[0.03] p-3">
                  <span className="font-semibold text-white uppercase">{p.name}</span>
                  <span className="font-mono text-yellow-500 font-bold bg-yellow-500/10 px-2 py-0.5 rounded text-[10px]">
                    {p.stock_quantity} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Out Of Stock Alerts */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-5">
          <div className="flex items-center gap-2 text-white/30 uppercase tracking-widest text-[9px] font-bold mb-3">
            <AlertTriangle className="text-red-500/80" size={14} />
            <span>Out of Stock Items ({outOfStockProducts.length})</span>
          </div>
          {outOfStockProducts.length === 0 ? (
            <p className="text-xs text-white/20">No out-of-stock items detected.</p>
          ) : (
            <div className="space-y-2.5">
              {outOfStockProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between text-xs rounded-xl bg-white/[0.01] border border-white/[0.03] p-3">
                  <span className="font-semibold text-white/80 uppercase">{p.name}</span>
                  <span className="font-mono text-red-500 font-bold bg-red-500/10 px-2 py-0.5 rounded text-[10px]">
                    0 left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MAIN LAYOUT GRID */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* STOCK ADJUSTMENT TABLE */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-3 text-white/30" size={14} />
            <input
              type="text"
              placeholder="SEARCH BY PRODUCT NAME OR SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] pl-11 pr-4 text-xs text-white outline-none focus:border-white/20 uppercase tracking-wider placeholder:text-white/18"
            />
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">
                    <th className="pb-3 pr-4">Product</th>
                    <th className="pb-3 px-4">SKU</th>
                    <th className="pb-3 px-4 text-center">Available Stock</th>
                    <th className="pb-3 px-4 text-center">Status</th>
                    <th className="pb-3 pl-4 text-right">Adjust</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-xs">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-white/20">No products found.</td>
                    </tr>
                  ) : (
                    filteredProducts.map(p => (
                      <tr key={p.id} className="text-white/60 hover:bg-white/[0.01] transition-all">
                        <td className="py-3.5 pr-4 font-bold text-white uppercase">{p.name}</td>
                        <td className="py-3.5 px-4 font-mono text-[10px] text-white/45">{p.sku || "N/A"}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-white">{p.stock_quantity}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase tracking-widest ${
                            p.stock_quantity === 0 ? "bg-red-500/10 text-red-500/80" : "bg-white/10 text-white/80"
                          }`}>
                            {p.stock_quantity === 0 ? "OOS" : "In Stock"}
                          </span>
                        </td>
                        <td className="py-3.5 pl-4 text-right">
                          <button
                            onClick={() => setSelectedProduct(p)}
                            className="inline-flex h-8 items-center gap-1 rounded-lg border border-white/10 px-3 text-[10px] font-bold uppercase tracking-wider text-white/70 hover:bg-white/10 cursor-pointer"
                          >
                            <Plus size={11} />
                            <span>Quick Adjust</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* LOGS PANEL */}
        <div className="lg:col-span-4 space-y-6">
          {/* Restock History Logs */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Stock Logs</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {logs.map((log, idx) => (
                <div key={log.id || idx} className="rounded-xl bg-white/[0.02] p-3 border border-white/[0.03] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white uppercase truncate max-w-[150px]">{log.product_name}</span>
                    <span className={`font-bold ${log.delta > 0 ? "text-green-400" : "text-red-400"}`}>
                      {log.delta > 0 ? `+${log.delta}` : log.delta}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/40 mt-1 leading-normal">{log.reason}</p>
                  <p className="text-[9px] text-white/20 mt-1 tracking-wider">{log.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ADJUSTMENT MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-black"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-[400px] rounded-2xl border border-white/[0.08] bg-[#0c0c0c] p-6 shadow-2xl"
            >
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-2">Adjust Inventory</h3>
              <p className="text-[10px] text-white/45 mb-4">Item: <span className="text-white font-bold uppercase">{selectedProduct.name}</span></p>

              <form onSubmit={handleAdjustStock} className="space-y-4">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Change Quantity (Delta)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. +10 or -5"
                    value={stockDelta || ""}
                    onChange={(e) => setStockDelta(parseInt(e.target.value) || 0)}
                    className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white outline-none focus:border-white/20"
                  />
                  <p className="text-[9px] text-white/20 mt-1 leading-normal">
                    Current stock level: <span className="font-bold text-white">{selectedProduct.stock_quantity}</span>. 
                    Adjusted level will be: <span className="font-bold text-white">{Math.max(0, selectedProduct.stock_quantity + stockDelta)}</span>.
                  </p>
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block mb-2">Adjustment Reason</label>
                  <select
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="h-11 w-full rounded-xl border border-white/[0.06] bg-[#060606] px-4 text-xs text-white outline-none focus:border-white/20 uppercase tracking-wider"
                  >
                    <option value="restock">Restock from vendor</option>
                    <option value="adjustment">Manual count adjustment</option>
                    <option value="reservation">Reserved for order</option>
                    <option value="audit">Inventory audit correction</option>
                  </select>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex h-11 flex-1 items-center justify-center rounded-xl bg-white text-[10px] font-bold uppercase tracking-widest text-black hover:bg-white/88 disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={14} /> : "Apply"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedProduct(null); setStockDelta(0); }}
                    className="flex h-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.02] px-4 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
