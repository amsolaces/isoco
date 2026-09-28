"use client";

import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Search, Download, Trash2, ClipboardList, RefreshCw, Loader2, Calendar } from "lucide-react";
import { useEffect, useState } from "react";

export default function WaitlistManager() {
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [analytics, setAnalytics] = useState({
    totalCount: 0,
    dailySignups: 0,
    weeklySignups: 0,
    monthlySignups: 0,
  });

  async function loadWaitlist() {
    if (!supabase) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("waitlist")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      const list = data || [];
      setWaitlist(list);

      // Perform client-side analytics
      const now = new Date();
      const oneDay = 24 * 60 * 60 * 1000;
      
      const daily = list.filter((item: any) => {
        const itemDate = new Date(item.created_at);
        return now.getTime() - itemDate.getTime() < oneDay;
      }).length;

      const weekly = list.filter((item: any) => {
        const itemDate = new Date(item.created_at);
        return now.getTime() - itemDate.getTime() < oneDay * 7;
      }).length;

      const monthly = list.filter((item: any) => {
        const itemDate = new Date(item.created_at);
        return now.getTime() - itemDate.getTime() < oneDay * 30;
      }).length;

      setAnalytics({
        totalCount: list.length,
        dailySignups: daily,
        weeklySignups: weekly,
        monthlySignups: monthly,
      });
    } catch (err) {
      console.error("Failed to load waitlist:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWaitlist();
  }, []);

  async function handleDelete(id: number) {
    if (!supabase || !confirm("Are you sure you want to delete this waitlist entry?")) return;

    try {
      const { error } = await supabase.from("waitlist").delete().eq("id", id);
      if (error) throw error;
      
      const updatedList = waitlist.filter((w) => w.id !== id);
      setWaitlist(updatedList);
      
      // Update statistics
      setAnalytics((prev) => ({
        ...prev,
        totalCount: updatedList.length,
      }));
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  }

  // Exports data to CSV on client side
  function handleExportCSV() {
    if (waitlist.length === 0) return;

    // Define CSV columns
    const headers = ["ID", "Name", "Email", "Phone Number", "Signed Up At"];
    const rows = waitlist.map((item) => [
      item.id,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.email.replace(/"/g, '""')}"`,
      item.phone ? `"${item.phone}"` : "N/A",
      new Date(item.created_at).toISOString(),
    ]);

    // Build CSV content
    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    // Create hidden download trigger
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `dripego_waitlist_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const filteredWaitlist = waitlist.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.email.toLowerCase().includes(search.toLowerCase()) ||
      (w.phone && w.phone.includes(search))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Waitlist Signups</h1>
          <p className="text-xs text-white/45">Monitor user interest, export registrations, and track growth analytics.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadWaitlist}
            className="grid size-10 place-items-center rounded-xl border border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleExportCSV}
            disabled={waitlist.length === 0}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-black transition hover:bg-white/88 disabled:opacity-50 cursor-pointer"
          >
            <Download size={13} strokeWidth={2.5} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Signups", value: analytics.totalCount, desc: "Total subscribers registered" },
          { label: "Daily Signups", value: analytics.dailySignups, desc: "Entries registered in last 24h" },
          { label: "Weekly Signups", value: analytics.weeklySignups, desc: "Entries registered in last 7d" },
          { label: "Monthly Signups", value: analytics.monthlySignups, desc: "Entries registered in last 30d" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-5 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">
                {card.label}
              </span>
              <Calendar size={14} className="text-white/20" />
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="text-[9px] text-white/22 tracking-wider">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* SEARCH PANEL */}
      <div className="relative">
        <Search className="absolute left-4 top-3 text-white/30" size={14} />
        <input
          type="text"
          placeholder="SEARCH BY SUBSCRIBER NAME, EMAIL, PHONE..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] pl-11 pr-4 text-xs text-white outline-none focus:border-white/20 uppercase tracking-wider placeholder:text-white/18"
        />
      </div>

      {/* REGISTRATION LIST */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 px-4">Email Address</th>
                <th className="pb-3 px-4">Phone Number</th>
                <th className="pb-3 px-4 text-right">Signed Up Date</th>
                <th className="pb-3 pl-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs">
              {loading && waitlist.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-white/20">
                    <Loader2 className="animate-spin text-white/20 mx-auto" size={20} />
                  </td>
                </tr>
              ) : filteredWaitlist.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-white/20">
                    No signups matching query.
                  </td>
                </tr>
              ) : (
                filteredWaitlist.map((w) => (
                  <tr key={w.id} className="text-white/60 hover:bg-white/[0.01] transition-all">
                    <td className="py-3.5 pr-4 font-bold text-white uppercase">{w.name}</td>
                    <td className="py-3.5 px-4 font-medium">{w.email}</td>
                    <td className="py-3.5 px-4 text-white/40">{w.phone || "N/A"}</td>
                    <td className="py-3.5 px-4 text-right text-white/30 text-[11px]">
                      {new Date(w.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      <button
                        onClick={() => handleDelete(w.id)}
                        className="grid size-8 place-items-center rounded-lg border border-white/10 text-red-500/40 hover:bg-red-950/20 hover:text-red-400 ml-auto cursor-pointer"
                      >
                        <Trash2 size={12} />
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
  );
}
