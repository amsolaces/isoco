"use client";

import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, RefreshCw, X, Eye, FileText, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

// Mock fallback customers
const mockCustomers = [
  {
    id: "cust-1",
    name: "Liam Neeson",
    email: "liam@taken.com",
    phone: "+44 7700 900077",
    address: "15 Baker St, London, NW1 6XE, UK",
    total_orders: 2,
    total_spent: 320.0,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(), // 30 days ago
    notes: "Requires packaging with premium tissue paper. Enthusiastic client.",
    history: [
      { order_id: "de-1294a8", total: 320.0, status: "delivered", date: "15 Jun 2026" }
    ]
  },
  {
    id: "cust-2",
    name: "Jessica Chastain",
    email: "jessica@chastain.com",
    phone: "+1 (555) 019-2834",
    address: "742 Evergreen Terrace, Springfield, OR, USA",
    total_orders: 1,
    total_spent: 180.0,
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(), // 15 days ago
    notes: "Subscribed to capsule updates. Preferred size: S.",
    history: [
      { order_id: "de-1293b2", total: 180.0, status: "packed", date: "16 Jun 2026" }
    ]
  },
  {
    id: "cust-3",
    name: "Timothée Chalamet",
    email: "timmy@dune.com",
    phone: "+33 6 5557 2831",
    address: "Arakeen Royal Residency, Sector 4, Caladan",
    total_orders: 1,
    total_spent: 450.0,
    created_at: new Date().toISOString(), // Today
    notes: "New buyer. High interest in limited collections.",
    history: [
      { order_id: "de-1292c9", total: 450.0, status: "pending", date: "18 Jun 2026" }
    ]
  }
];

export default function CustomersManager() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [newNote, setNewNote] = useState("");

  async function loadCustomers() {
    if (!supabase) return;
    setLoading(true);
    try {
      // Query unique customers from orders table
      const { data, error } = await supabase
        .from("orders")
        .select("customer_name, customer_email, phone, shipping_address, total, created_at, id, order_status");
      
      if (error) throw error;

      if (data && data.length > 0) {
        // Group by email to compile total spend and order counts
        const grouped: { [key: string]: any } = {};

        data.forEach((row: any) => {
          const email = row.customer_email;
          if (!grouped[email]) {
            grouped[email] = {
              id: row.id,
              name: row.customer_name,
              email: row.customer_email,
              phone: row.phone || "N/A",
              address: row.shipping_address,
              total_orders: 0,
              total_spent: 0,
              created_at: row.created_at,
              notes: "Regular client. Shipping addresses synced.",
              history: []
            };
          }

          grouped[email].total_orders += 1;
          grouped[email].total_spent += Number(row.total);
          grouped[email].history.push({
            order_id: row.id,
            total: Number(row.total),
            status: row.order_status,
            date: new Date(row.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })
          });
        });

        setCustomers(Object.values(grouped));
      } else {
        setCustomers(mockCustomers);
      }
    } catch (err) {
      console.error(err);
      setCustomers(mockCustomers);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  function handleSaveNote() {
    if (!selectedCustomer) return;
    const updated = { ...selectedCustomer, notes: newNote.trim() };
    setCustomers(customers.map(c => c.email === selectedCustomer.email ? updated : c));
    setSelectedCustomer(updated);
    setNewNote("");
    alert("Customer note saved locally.");
  }

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Customers</h1>
          <p className="text-xs text-white/45">Review user demographics, order frequencies, and note summaries.</p>
        </div>
        <button
          onClick={loadCustomers}
          className="grid size-10 place-items-center rounded-xl border border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* SEARCH PANEL */}
      <div className="relative">
        <Search className="absolute left-4 top-3 text-white/30" size={14} />
        <input
          type="text"
          placeholder="SEARCH BY CUSTOMER NAME OR EMAIL..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] pl-11 pr-4 text-xs text-white outline-none focus:border-white/20 uppercase tracking-wider placeholder:text-white/18"
        />
      </div>

      {/* CUSTOMER LIST */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 px-4">Contact</th>
                <th className="pb-3 px-4 text-center">Orders</th>
                <th className="pb-3 px-4 text-right">Total Spent</th>
                <th className="pb-3 px-4 text-right">Date Joined</th>
                <th className="pb-3 pl-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-white/20">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.email} className="text-white/60 hover:bg-white/[0.01] transition-all">
                    <td className="py-3.5 pr-4 font-bold text-white uppercase">{c.name}</td>
                    <td className="py-3.5 px-4">
                      <div>{c.email}</div>
                      <div className="text-[10px] text-white/22 font-medium mt-0.5">{c.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center text-white/80 font-semibold">{c.total_orders}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-white">₹{c.total_spent.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right text-white/30 text-[11px]">
                      {new Date(c.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      <button
                        onClick={() => { setSelectedCustomer(c); setNewNote(c.notes || ""); }}
                        className="grid size-8 place-items-center rounded-lg border border-white/10 text-white/40 hover:bg-white/10 hover:text-white ml-auto cursor-pointer"
                      >
                        <Eye size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCustomer(null)}
              className="fixed inset-0 bg-black"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-[550px] rounded-2xl border border-white/[0.08] bg-[#0c0c0c] p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-5">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Customer Profile</h3>
                  <p className="text-[10px] text-white/45 mt-1">Details and client preferences</p>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="grid size-9 place-items-center rounded-lg border border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Bio Grid */}
              <div className="grid gap-4 sm:grid-cols-2 text-xs mb-6">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/30 block mb-1">Full Name</span>
                  <span className="font-bold text-white uppercase">{selectedCustomer.name}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/30 block mb-1">Email Address</span>
                  <span className="text-white/75">{selectedCustomer.email}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/30 block mb-1">Phone Contact</span>
                  <span className="text-white/75">{selectedCustomer.phone}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/30 block mb-1">Primary Address</span>
                  <span className="text-white/75 leading-relaxed">{selectedCustomer.address}</span>
                </div>
              </div>

              {/* Notes block */}
              <div className="border-t border-white/[0.06] pt-4 mb-6">
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/30 block mb-2">Internal Admin Notes</span>
                <textarea
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record fit options, shipping choices, custom packaging preference..."
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 text-xs text-white outline-none focus:border-white/20 resize-none"
                />
                <button
                  onClick={handleSaveNote}
                  className="mt-2.5 flex h-9 items-center justify-center rounded-lg bg-white px-5 text-[10px] font-bold uppercase tracking-widest text-black hover:bg-white/88 cursor-pointer"
                >
                  Save Note
                </button>
              </div>

              {/* Purchase History */}
              <div className="border-t border-white/[0.06] pt-4">
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/30 block mb-3">Purchase History</span>
                <div className="space-y-2.5">
                  {selectedCustomer.history.map((h: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl bg-white/[0.01] p-3 border border-white/[0.03]"
                    >
                      <div className="flex items-center gap-3">
                        <ShoppingBag className="text-white/30" size={14} />
                        <div>
                          <span className="font-bold text-white uppercase text-[11px]">#{h.order_id.substring(0, 8)}</span>
                          <span className="text-[9px] text-white/22 ml-2 tracking-wider">{h.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-white/[0.03] px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-white/40">
                          {h.status}
                        </span>
                        <span className="font-bold text-white text-[11px]">₹{h.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
