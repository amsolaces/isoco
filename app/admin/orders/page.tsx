"use client";

import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Printer,
  ChevronDown,
  RefreshCw,
  Eye,
  Trash2,
  DollarSign,
  ArrowRight,
  X as XIcon,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";

// Mock fallback orders
const mockOrders = [
  {
    id: "de-1294a8",
    customer_name: "Liam Neeson",
    customer_email: "liam@taken.com",
    phone: "+44 7700 900077",
    shipping_address: "15 Baker St, London, NW1 6XE, UK",
    subtotal: 295.0,
    tax: 25.0,
    shipping: 0.0,
    discount: 0.0,
    total: 320.0,
    payment_method: "Stripe (Visa)",
    payment_status: "paid",
    order_status: "delivered",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    items: [
      { product_name: "Oversized Tee", sku: "DP001-OT-BLK", price: 145.0, quantity: 2, size: "M", color: "Black" },
      { product_name: "Classic socks", sku: "DP001-CS-WHT", price: 30.0, quantity: 1, size: "One Size", color: "White" },
    ],
  },
  {
    id: "de-1293b2",
    customer_name: "Jessica Chastain",
    customer_email: "jessica@chastain.com",
    phone: "+1 (555) 019-2834",
    shipping_address: "742 Evergreen Terrace, Springfield, OR, USA",
    subtotal: 180.0,
    tax: 0.0,
    shipping: 15.0,
    discount: 15.0,
    total: 180.0,
    payment_method: "Apple Pay",
    payment_status: "paid",
    order_status: "packed",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    items: [
      { product_name: "Minimalist Cap", sku: "DP001-MC-BLK", price: 90.0, quantity: 2, size: "One Size", color: "Black" },
    ],
  },
  {
    id: "de-1292c9",
    customer_name: "Timothée Chalamet",
    customer_email: "timmy@dune.com",
    phone: "+33 6 5557 2831",
    shipping_address: "Arakeen Royal Residency, Sector 4, Caladan",
    subtotal: 450.0,
    tax: 0.0,
    shipping: 0.0,
    discount: 0.0,
    total: 450.0,
    payment_method: "Stripe (Mastercard)",
    payment_status: "pending",
    order_status: "pending",
    created_at: new Date().toISOString(), // Today
    items: [
      { product_name: "Structured Blazer", sku: "DP001-SB-BLK", price: 450.0, quantity: 1, size: "L", color: "Black" },
    ],
  },
];

const orderStatusOptions = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned", "refunded"];
const paymentStatusOptions = ["pending", "paid", "failed", "refunded"];

// Helper to render deterministic barcode using order ID
const renderBarcode = (orderId: string) => {
  const cleanId = orderId.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const bars: { width: number; isBlack: boolean }[] = [];
  
  // Pattern generator based on charCodes
  for (let i = 0; i < cleanId.length; i++) {
    const charCode = cleanId.charCodeAt(i);
    const w1 = (charCode % 3) + 1; // 1px to 3px
    const w2 = ((charCode >> 2) % 3) + 1; // 1px to 3px
    bars.push({ width: w1, isBlack: true });
    bars.push({ width: w2, isBlack: false });
  }

  return (
    <div className="flex flex-col items-center gap-1.5 print:text-black">
      <div className="flex items-stretch h-8 bg-white p-0.5 border border-black/10 rounded">
        {/* Guard zone */}
        <div className="w-[1.5px] bg-black mr-[1px]" />
        <div className="w-[1px] bg-transparent mr-[1px]" />
        <div className="w-[1px] bg-black mr-2" />
        
        {/* Bars */}
        {bars.map((bar, idx) => (
          <div
            key={idx}
            style={{ width: `${bar.width}px` }}
            className={`h-full ${bar.isBlack ? "bg-black" : "bg-transparent"}`}
          />
        ))}

        {/* Guard zone */}
        <div className="w-[1px] bg-black ml-2" />
        <div className="w-[1px] bg-transparent ml-[1px]" />
        <div className="w-[1.5px] bg-black ml-[1px]" />
      </div>
      <span className="text-[9px] font-mono tracking-[0.2em] text-white/40 print:text-black/50 uppercase">
        {orderId.substring(0, 8)}
      </span>
    </div>
  );
};

// Helper to render deterministic QR Code using SKU or product ID
const renderQRCode = (sku: string) => {
  const size = 21;
  const matrix: boolean[][] = [];
  
  let seed = 0;
  const cleanVal = (sku || "DRIPEGO").toUpperCase();
  for (let i = 0; i < cleanVal.length; i++) {
    seed = (seed * 31 + cleanVal.charCodeAt(i)) % 999983;
  }
  
  const nextRandom = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };

  for (let r = 0; r < size; r++) {
    matrix.push(new Array(size).fill(false));
  }

  const drawFinder = (rowOffset: number, colOffset: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[rowOffset + r][colOffset + c] = isBorder || isCenter;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      if (inTopLeft || inTopRight || inBottomLeft) continue;

      if (r === 6 || c === 6) {
        matrix[r][c] = (r === 6 ? c % 2 === 0 : r % 2 === 0);
      } else {
        matrix[r][c] = nextRandom() > 0.5;
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div 
        className="grid bg-white p-1 rounded border border-black/10" 
        style={{ 
          gridTemplateColumns: 'repeat(21, minmax(0, 1fr))',
          width: '56px',
          height: '56px'
        }}
      >
        {matrix.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={`w-full h-full ${cell ? "bg-black" : "bg-white"}`}
            />
          ))
        )}
      </div>
      <span className="text-[7px] font-mono text-white/30 print:text-black/40 tracking-wider">
        {sku || "SKU-N/A"}
      </span>
    </div>
  );
};

export default function OrdersManager() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [activeStatusDrop, setActiveStatusDrop] = useState<string | null>(null);

  async function loadOrders() {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // If there are actual orders in database, load them. Else use fallbacks.
      if (data && data.length > 0) {
        // Map order_items subtable to items field
        const formatted = data.map((o: any) => ({
          ...o,
          items: o.order_items || [],
        }));
        setOrders(formatted);
      } else {
        setOrders(mockOrders);
      }
    } catch (err) {
      console.error("Failed to load orders list:", err);
      setOrders(mockOrders); // Fallback on error
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function updateOrderStatus(orderId: string, newStatus: string) {
    if (!supabase) return;
    try {
      // Check if it's a mock order (real ones are UUIDs, mock ones are not)
      const isMock = !orderId.includes("-") || orderId.startsWith("de-");
      
      if (!isMock) {
        const { error } = await supabase
          .from("orders")
          .update({ order_status: newStatus })
          .eq("id", orderId);
        if (error) throw error;
      }

      setOrders(orders.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o)));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, order_status: newStatus });
      }
      setActiveStatusDrop(null);
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  }

  async function updatePaymentStatus(orderId: string, newStatus: string) {
    if (!supabase) return;
    try {
      const isMock = !orderId.includes("-") || orderId.startsWith("de-");
      
      if (!isMock) {
        const { error } = await supabase
          .from("orders")
          .update({ payment_status: newStatus })
          .eq("id", orderId);
        if (error) throw error;
      }

      setOrders(orders.map((o) => (o.id === orderId ? { ...o, payment_status: newStatus } : o)));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, payment_status: newStatus });
      }
    } catch (err: any) {
      alert(`Payment update failed: ${err.message}`);
    }
  }

  function handlePrintInvoice() {
    window.print();
  }

  // Client filtering
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.order_status === statusFilter;
    const matchesPayment = paymentFilter === "all" || o.payment_status === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Orders Manager</h1>
          <p className="text-xs text-white/45">Track sales transactions, payment indicators, and shipping status.</p>
        </div>
        <button
          onClick={loadOrders}
          className="grid size-10 place-items-center rounded-xl border border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* FILTER & SEARCH PANEL */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3 text-white/30" size={14} />
          <input
            type="text"
            placeholder="SEARCH BY ORDER ID, CUSTOMER NAME, EMAIL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] pl-11 pr-4 text-xs text-white outline-none focus:border-white/20 uppercase tracking-wider placeholder:text-white/18"
          />
        </div>

        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/[0.06] bg-[#060606] px-4 text-xs text-white outline-none focus:border-white/20 uppercase tracking-wider"
          >
            <option value="all">All Order Statuses</option>
            {orderStatusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-48">
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/[0.06] bg-[#060606] px-4 text-xs text-white outline-none focus:border-white/20 uppercase tracking-wider"
          >
            <option value="all">All Payment Statuses</option>
            {paymentStatusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ORDERS LIST */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">
                <th className="pb-3 pr-4">Order ID</th>
                <th className="pb-3 px-4">Customer</th>
                <th className="pb-3 px-4">Order Status</th>
                <th className="pb-3 px-4">Payment Status</th>
                <th className="pb-3 px-4 text-right">Total</th>
                <th className="pb-3 px-4 text-right">Date</th>
                <th className="pb-3 pl-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-white/20">
                    <Loader2 className="animate-spin text-white/20 mx-auto" size={20} />
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-white/20">
                    No orders matching selected criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const isDrop = activeStatusDrop === ord.id;
                  return (
                    <tr key={ord.id} className="text-white/60 hover:bg-white/[0.01] transition-all">
                      <td className="py-3.5 pr-4 font-bold text-white uppercase">
                        #{ord.id.substring(0, 8)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{ord.customer_name}</div>
                        <div className="text-[10px] text-white/30 font-medium mt-0.5">{ord.customer_email}</div>
                      </td>
                      <td className="py-3.5 px-4 relative">
                        <button
                          onClick={() => setActiveStatusDrop(isDrop ? null : ord.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white/70 hover:bg-white/10"
                        >
                          <span>{ord.order_status}</span>
                          <ChevronDown size={10} />
                        </button>

                        <AnimatePresence>
                          {isDrop && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setActiveStatusDrop(null)} />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute left-4 mt-1.5 w-32 rounded-xl border border-white/[0.08] bg-[#0f0f0f] p-1.5 shadow-xl z-50 text-left"
                              >
                                {orderStatusOptions.map((opt) => (
                                  <button
                                    key={opt}
                                    onClick={() => updateOrderStatus(ord.id, opt)}
                                    className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-[9px] uppercase font-bold tracking-wider text-white/60 hover:bg-white/[0.04] hover:text-white"
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={ord.payment_status}
                          onChange={(e) => updatePaymentStatus(ord.id, e.target.value)}
                          className="rounded-lg border border-white/10 bg-transparent px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white/70 outline-none hover:bg-white/10"
                        >
                          {paymentStatusOptions.map((opt) => (
                            <option key={opt} value={opt} className="bg-[#0f0f0f] text-white">
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-white">
                        ₹{Number(ord.total).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-white/30">
                        {new Date(ord.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 pl-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="grid size-8 place-items-center rounded-lg border border-white/10 text-white/40 hover:bg-white/10 hover:text-white ml-auto cursor-pointer"
                        >
                          <Eye size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL / INVOICE DRAWER */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 print:absolute print:inset-0 print:bg-white print:p-0 print:text-black">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black print:hidden"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-[720px] rounded-2xl border border-white/[0.08] bg-[#0c0c0c] p-8 shadow-2xl overflow-y-auto max-h-[90vh] print:border-none print:bg-white print:shadow-none print:w-full print:max-w-none print:p-0 print:max-h-none print:text-black"
            >
              {/* Top Control Bar */}
              <div className="flex items-center justify-end gap-2 mb-6 print:hidden">
                <button
                  onClick={handlePrintInvoice}
                  className="flex h-9 items-center gap-2 rounded-lg border border-white/10 px-4 text-xs font-bold text-white/70 hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <Printer size={13} />
                  <span>Print / Download</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="grid size-9 place-items-center rounded-lg border border-white/10 text-white/50 hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <XIcon size={13} />
                </button>
              </div>

              {/* Corporate Invoice Container */}
              <div className="bg-[#0f0f0f] border border-white/[0.06] rounded-xl p-8 print:border-none print:bg-white print:p-0">
                {/* Header: Company Info & Invoice Label */}
                <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b border-white/[0.08] print:border-black/10">
                  <div className="space-y-2">
                    <div className="text-xl font-black uppercase tracking-[0.2em] text-white print:text-black">
                      DRIPEGO
                    </div>
                    <div className="text-[10px] text-white/40 leading-relaxed print:text-black/60 font-medium uppercase tracking-wider">
                      <p className="font-bold text-white/70 print:text-black">DRIPEGO PRIVATE LIMITED</p>
                      <p>Plot No. 12, Block-EP, Salt Lake Sector V</p>
                      <p>Kolkata, West Bengal, 700091</p>
                      <p>GSTIN: 19AAACD9281A1Z9</p>
                      <p>Email: care@dripego.com</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right space-y-2">
                    <div className="text-lg font-black uppercase tracking-widest text-white print:text-black">
                      TAX INVOICE
                    </div>
                    <div className="text-[10px] text-white/40 leading-relaxed print:text-black/60 uppercase tracking-wider">
                      <p><span className="text-white/30 print:text-black/45 mr-1">INVOICE NO:</span> <span className="font-bold text-white print:text-black">INV-{selectedOrder.id.substring(0, 8).toUpperCase()}</span></p>
                      <p><span className="text-white/30 print:text-black/45 mr-1">ORDER ID:</span> #{selectedOrder.id.substring(0, 8)}</p>
                      <p><span className="text-white/30 print:text-black/45 mr-1">DATE:</span> {new Date(selectedOrder.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                      <div className="mt-2.5">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-widest ${
                          selectedOrder.payment_status === "paid"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {selectedOrder.payment_status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Section (Bill To / Ship To) */}
                <div className="grid gap-6 sm:grid-cols-2 text-xs py-6 border-b border-white/[0.08] print:border-black/10">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 print:text-black/40">BILL TO (CUSTOMER)</p>
                    <div className="text-white/70 print:text-black/80 space-y-1">
                      <p className="font-bold text-white print:text-black text-sm uppercase">{selectedOrder.customer_name}</p>
                      <p className="font-medium">{selectedOrder.customer_email}</p>
                      {selectedOrder.phone && <p>Phone: {selectedOrder.phone}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 print:text-black/40">SHIP TO (DELIVERY COORDINATES)</p>
                    <p className="text-white/70 leading-relaxed print:text-black/80 font-medium">
                      {selectedOrder.shipping_address}
                    </p>
                  </div>
                </div>

                {/* Table of items */}
                <div className="py-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 print:text-black/40 mb-4">PURCHASED LINE ITEMS</p>
                  <table className="w-full text-left border-collapse text-xs print:text-black">
                    <thead>
                      <tr className="border-b border-white/[0.06] pb-2 text-[9px] font-bold uppercase tracking-widest text-white/30 print:border-black/10 print:text-black/50">
                        <th className="pb-3">ITEM DESCRIPTION</th>
                        <th className="pb-3 text-center">QR CODE</th>
                        <th className="pb-3 text-center">QTY</th>
                        <th className="pb-3 text-right">UNIT PRICE</th>
                        <th className="pb-3 text-right">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04] text-white/80 print:divide-black/10 print:text-black">
                      {selectedOrder.items.map((item: any, idx: number) => (
                        <tr key={idx} className="align-middle">
                          <td className="py-4 pr-4">
                            <p className="font-bold text-white print:text-black text-[13px]">{item.product_name}</p>
                            <p className="text-[9px] text-white/30 mt-1 print:text-black/60 font-medium uppercase tracking-wider">
                              SIZE: {item.size || "N/A"} | COLOR: {item.color || "N/A"} {item.sku ? `| SKU: ${item.sku}` : ""}
                            </p>
                          </td>
                          <td className="py-4 text-center">
                            <div className="inline-block print:bg-white">
                              {renderQRCode(item.sku || `${item.product_name}-${item.size}`)}
                            </div>
                          </td>
                          <td className="py-4 text-center text-white/45 print:text-black font-semibold">{item.quantity}</td>
                          <td className="py-4 text-right font-medium text-white/60 print:text-black font-mono">₹{Number(item.price).toFixed(2)}</td>
                          <td className="py-4 text-right font-bold text-white print:text-black font-mono">₹{(Number(item.price) * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer Section: Summary & Barcode */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 pt-6 border-t border-white/[0.08] print:border-black/10 print:pt-4">
                  {/* Barcode & Info */}
                  <div className="space-y-4 max-w-sm">
                    {renderBarcode(selectedOrder.id)}
                    <div className="text-[9px] text-white/30 leading-relaxed print:text-black/50 uppercase tracking-wider font-medium">
                      <p>This document is an electronic invoice generated upon order confirmation. All taxes are calculated according to local laws. Items are packed with certified security seals.</p>
                    </div>
                  </div>

                  {/* Pricing Summary */}
                  <div className="w-full md:w-64 space-y-2 text-xs text-white/60 print:text-black">
                    <div className="flex justify-between">
                      <span className="text-white/30 print:text-black/45 font-bold uppercase tracking-wider text-[10px]">Subtotal</span>
                      <span className="font-bold text-white print:text-black font-mono">₹{Number(selectedOrder.subtotal).toFixed(2)}</span>
                    </div>
                    {Number(selectedOrder.tax) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-white/30 print:text-black/45 font-bold uppercase tracking-wider text-[10px]">Estimated Tax</span>
                        <span className="font-semibold text-white/80 print:text-black font-mono">₹{Number(selectedOrder.tax).toFixed(2)}</span>
                      </div>
                    )}
                    {Number(selectedOrder.shipping) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-white/30 print:text-black/45 font-bold uppercase tracking-wider text-[10px]">Shipping Fee</span>
                        <span className="font-semibold text-white/80 print:text-black font-mono">₹{Number(selectedOrder.shipping).toFixed(2)}</span>
                      </div>
                    )}
                    {Number(selectedOrder.discount) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-white/30 print:text-black/45 font-bold uppercase tracking-wider text-[10px]">Coupon Discount</span>
                        <span className="font-semibold text-green-400 font-mono">-₹{Number(selectedOrder.discount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="h-px bg-white/[0.08] my-2 print:bg-black/10" />
                    <div className="flex justify-between text-sm font-black text-white print:text-black">
                      <span className="uppercase tracking-widest text-[11px]">Grand Total</span>
                      <span className="font-mono">₹{Number(selectedOrder.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
