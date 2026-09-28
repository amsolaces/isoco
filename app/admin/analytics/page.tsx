"use client";

import { motion } from "framer-motion";
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Eye, RefreshCw } from "lucide-react";
import { useState } from "react";

// Mock detailed metrics
const monthlyRevenue = [12000, 15000, 18500, 22000, 19500, 26000, 29800];
const monthlyLabels = ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const conversionRates = [1.8, 2.1, 2.3, 2.8, 2.4, 3.1, 3.5];

const topProducts = [
  { name: "Oversized Tee (Black)", sales: 142, revenue: 20590.00, inventory: 12 },
  { name: "Structured Blazer (Grey)", sales: 94, revenue: 42300.00, inventory: 4 },
  { name: "Minimalist Cap (White)", sales: 78, revenue: 7020.00, inventory: 40 },
  { name: "Heavyweight Hoodie (Cream)", sales: 55, revenue: 11000.00, inventory: 18 }
];

const trafficSources = [
  { name: "Instagram Referral", percentage: 48, visitors: 12400 },
  { name: "Direct Browser Search", percentage: 22, visitors: 5690 },
  { name: "Organic Search Engine", percentage: 18, visitors: 4650 },
  { name: "Newsletter Marketing", percentage: 12, visitors: 3100 }
];

export default function AnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState<"monthly" | "weekly">("monthly");
  const [loading, setLoading] = useState(false);

  function handleRefresh() {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  }

  // Path helpers for SVG
  const chartHeight = 180;
  const chartWidth = 550;
  
  const getLinePath = (data: number[]) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    return data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * chartWidth;
        const y = chartHeight - ((val - min) / range) * (chartHeight - 40) - 20;
        return `${x},${y}`;
      })
      .join(" ");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Sales Analytics</h1>
          <p className="text-xs text-white/45">Review store conversions, average basket values, traffic channels, and charts.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="grid size-10 place-items-center rounded-xl border border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05] p-1 text-[9px] font-bold tracking-widest text-white/40 uppercase">
            <button
              onClick={() => setTimeframe("monthly")}
              className={`rounded px-3 py-1 transition ${timeframe === "monthly" ? "bg-white text-black" : ""}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setTimeframe("weekly")}
              className={`rounded px-3 py-1 transition ${timeframe === "weekly" ? "bg-white text-black" : ""}`}
            >
              Weekly
            </button>
          </div>
        </div>
      </div>

      {/* CORE PERFORMANCE METRICS */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Conversion Rate", value: "3.5%", icon: TrendingUp, detail: "+0.4% from last month" },
          { label: "Average Order Value (AOV)", value: "₹20,500.00", icon: DollarSign, detail: "+₹1,200.00 from last drop" },
          { label: "Total Traffic Visits", value: "25,840", icon: Eye, detail: "+18.2% impressions growth" },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
                  {card.label}
                </span>
                <Icon size={16} className="text-white/40" />
              </div>
              <p className="text-3xl font-bold tracking-tight text-white">{card.value}</p>
              <p className="text-[10px] text-white/20 tracking-wider">{card.detail}</p>
            </motion.div>
          );
        })}
      </div>

      {/* CHARTS BLOCK */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* REVENUE GROWTH */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 shadow-sm">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Revenue Growth</h3>
            <p className="text-[10px] text-white/45 mt-0.5 mb-6">Total monthly payouts calculated in INR.</p>
          </div>

          <div className="relative h-44 w-full">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-full w-full overflow-visible">
              {[0, 1, 2].map((g) => (
                <line
                  key={g}
                  x1="0"
                  y1={20 + (g * (chartHeight - 40)) / 2}
                  x2={chartWidth}
                  y2={20 + (g * (chartHeight - 40)) / 2}
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="1.2"
                />
              ))}
              <polyline
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={getLinePath(monthlyRevenue)}
              />
              {monthlyRevenue.map((val, idx) => {
                const x = (idx / (monthlyRevenue.length - 1)) * chartWidth;
                const min = Math.min(...monthlyRevenue);
                const max = Math.max(...monthlyRevenue);
                const y = chartHeight - ((val - min) / (max - min)) * (chartHeight - 40) - 20;
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="black"
                    stroke="white"
                    strokeWidth="1.8"
                  />
                );
              })}
            </svg>
          </div>
          <div className="mt-4 flex justify-between border-t border-white/[0.04] pt-3 px-1">
            {monthlyLabels.map((l, i) => (
              <span key={i} className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* CONVERSION TIMELINE */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 shadow-sm">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Conversion Funnel (%)</h3>
            <p className="text-[10px] text-white/45 mt-0.5 mb-6">Percentage of visitors converting to signups.</p>
          </div>

          <div className="relative h-44 w-full">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-full w-full overflow-visible">
              {[0, 1, 2].map((g) => (
                <line
                  key={g}
                  x1="0"
                  y1={20 + (g * (chartHeight - 40)) / 2}
                  x2={chartWidth}
                  y2={20 + (g * (chartHeight - 40)) / 2}
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="1.2"
                />
              ))}
              <polyline
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={getLinePath(conversionRates)}
              />
              {conversionRates.map((val, idx) => {
                const x = (idx / (conversionRates.length - 1)) * chartWidth;
                const min = Math.min(...conversionRates);
                const max = Math.max(...conversionRates);
                const y = chartHeight - ((val - min) / (max - min)) * (chartHeight - 40) - 20;
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="black"
                    stroke="white"
                    strokeWidth="1.8"
                  />
                );
              })}
            </svg>
          </div>
          <div className="mt-4 flex justify-between border-t border-white/[0.04] pt-3 px-1">
            {monthlyLabels.map((l, i) => (
              <span key={i} className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* TOP PRODUCTS & TRAFFIC GRID */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Top selling products */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 shadow-sm lg:col-span-7">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Top Selling Collections</h3>
          <div className="space-y-4">
            {topProducts.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs rounded-xl bg-white/[0.01] border border-white/[0.03] p-4">
                <div className="min-w-0">
                  <p className="font-bold text-white uppercase truncate">{p.name}</p>
                  <p className="text-[9px] text-white/30 tracking-wider mt-0.5">{p.sales} sales completed</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">₹{p.revenue.toLocaleString("en-IN")}</p>
                  <p className="text-[9px] text-white/20 tracking-wider mt-0.5">{p.inventory} in stock</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic channels */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 shadow-sm lg:col-span-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Traffic Channels</h3>
          <div className="space-y-4">
            {trafficSources.map((source, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-white/80">{source.name}</span>
                  <span className="font-mono text-white/40">{source.percentage}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: `${source.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
