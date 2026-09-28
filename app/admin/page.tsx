"use client";

import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  ClipboardList,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    waitlistCount: 0,
    todaySales: 0,
    pendingOrders: 0,
    outOfStockCount: 0,
    revenueGrowth: "No sales recorded yet",
    ordersGrowth: "No orders placed yet",
    waitlistGrowth: "No signups recorded",
    customersGrowth: "No customers registered",
  });

  const [recentWaitlist, setRecentWaitlist] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState<number[]>([]);
  const [chartMonths, setChartMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch waitlist count & entries
        const { data: waitlistList } = await supabase
          .from("waitlist")
          .select("id, created_at, email, name, phone")
          .order("created_at", { ascending: false });

        const wCount = waitlistList ? waitlistList.length : 0;
        const wRecent = waitlistList ? waitlistList.slice(0, 5) : [];

        // 2. Fetch products count & out of stock count
        const { count: pCount } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true });

        const { count: oosCount } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("stock_quantity", 0);

        // 3. Fetch orders count, status & revenue totals
        const { data: allOrders } = await supabase
          .from("orders")
          .select("id, total, order_status, payment_status, created_at, customer_name")
          .order("created_at", { ascending: false });

        const ordCount = allOrders ? allOrders.length : 0;
        const pendCount = allOrders ? allOrders.filter((o: any) => o.order_status === "pending").length : 0;
        const oRecent = allOrders ? allOrders.slice(0, 5) : [];

        const revenueSum = allOrders
          ? allOrders.filter((o: any) => o.payment_status === "paid").reduce((acc: any, curr: any) => acc + Number(curr.total), 0)
          : 0;

        // 4. Fetch registered customers count from user_roles
        const { data: userRoles } = await supabase
          .from("user_roles")
          .select("updated_at, role");

        const customerRoles = userRoles ? userRoles.filter((r: any) => r.role === "customer") : [];
        const custCount = customerRoles.length;

        // 5. Calculate today's sales
        let todaySalesSum = 0;
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        if (allOrders) {
          allOrders.forEach((o: any) => {
            if (o.payment_status === "paid") {
              const oDate = new Date(o.created_at);
              if (oDate >= todayStart) {
                todaySalesSum += Number(o.total);
              }
            }
          });
        }

        // 6. Calculate monthly growth rates
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        let thisMonthRevenue = 0;
        let lastMonthRevenue = 0;
        let thisMonthOrders = 0;
        let lastMonthOrders = 0;

        if (allOrders) {
          allOrders.forEach((o: any) => {
            const date = new Date(o.created_at);
            if (date >= thisMonthStart) {
              thisMonthOrders++;
              if (o.payment_status === "paid") {
                thisMonthRevenue += Number(o.total);
              }
            } else if (date >= lastMonthStart && date < thisMonthStart) {
              lastMonthOrders++;
              if (o.payment_status === "paid") {
                lastMonthRevenue += Number(o.total);
              }
            }
          });
        }

        let revenueGrowthStr = "No sales recorded yet";
        if (lastMonthRevenue > 0) {
          const diff = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
          revenueGrowthStr = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}% from last month`;
        } else if (thisMonthRevenue > 0) {
          revenueGrowthStr = "+100% from last month";
        } else if (allOrders && allOrders.some((o: any) => o.payment_status === "paid")) {
          revenueGrowthStr = "0% growth this month";
        }

        let ordersGrowthStr = "No orders placed yet";
        if (lastMonthOrders > 0) {
          const diff = ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100;
          ordersGrowthStr = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}% from last week`;
        } else if (thisMonthOrders > 0) {
          ordersGrowthStr = "+100% from last week";
        } else if (ordCount > 0) {
          ordersGrowthStr = "0% growth this week";
        }

        let thisMonthWaitlist = 0;
        let lastMonthWaitlist = 0;
        if (waitlistList) {
          waitlistList.forEach((w: any) => {
            const date = new Date(w.created_at);
            if (date >= thisMonthStart) {
              thisMonthWaitlist++;
            } else if (date >= lastMonthStart && date < thisMonthStart) {
              lastMonthWaitlist++;
            }
          });
        }

        let waitlistGrowthStr = "No signups recorded";
        if (lastMonthWaitlist > 0) {
          const diff = ((thisMonthWaitlist - lastMonthWaitlist) / lastMonthWaitlist) * 100;
          waitlistGrowthStr = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}% conversion growth`;
        } else if (thisMonthWaitlist > 0) {
          waitlistGrowthStr = "+100% conversion growth";
        } else if (wCount > 0) {
          waitlistGrowthStr = "0% growth this month";
        }

        let thisMonthCustomers = 0;
        let lastMonthCustomers = 0;
        customerRoles.forEach((c: any) => {
          const date = new Date(c.updated_at);
          if (date >= thisMonthStart) {
            thisMonthCustomers++;
          } else if (date >= lastMonthStart && date < thisMonthStart) {
            lastMonthCustomers++;
          }
        });

        let customersGrowthStr = "No customers registered";
        if (lastMonthCustomers > 0) {
          const diff = ((thisMonthCustomers - lastMonthCustomers) / lastMonthCustomers) * 100;
          customersGrowthStr = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}% user retention`;
        } else if (thisMonthCustomers > 0) {
          customersGrowthStr = "+100% user retention";
        } else if (custCount > 0) {
          customersGrowthStr = "0% growth this month";
        }

        // 7. Group sales for dynamic 6-month chart
        const actualMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthsToShow = [];
        const salesToShow = [];

        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          monthsToShow.push(actualMonthNames[d.getMonth()]);
          
          let monthlyPaidSum = 0;
          if (allOrders) {
            allOrders.forEach((o: any) => {
              if (o.payment_status === "paid") {
                const oDate = new Date(o.created_at);
                if (oDate.getFullYear() === d.getFullYear() && oDate.getMonth() === d.getMonth()) {
                  monthlyPaidSum += Number(o.total);
                }
              }
            });
          }
          salesToShow.push(monthlyPaidSum);
        }

        setStats({
          totalRevenue: revenueSum,
          totalOrders: ordCount,
          totalCustomers: custCount,
          totalProducts: pCount ?? 0,
          waitlistCount: wCount,
          todaySales: todaySalesSum,
          pendingOrders: pendCount,
          outOfStockCount: oosCount ?? 0,
          revenueGrowth: revenueGrowthStr,
          ordersGrowth: ordersGrowthStr,
          waitlistGrowth: waitlistGrowthStr,
          customersGrowth: customersGrowthStr,
        });

        setChartData(salesToShow);
        setChartMonths(monthsToShow);
        if (wRecent) setRecentWaitlist(wRecent);
        if (oRecent) setRecentOrders(oRecent);
      } catch (err) {
        console.error("Error loading dashboard aggregates:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  // Custom SVG chart path generators
  const chartHeight = 160;
  const chartWidth = 500;
  
  const finalSalesData = chartData.length > 0 ? chartData : [0, 0, 0, 0, 0, 0];
  const finalMonths = chartMonths.length > 0 ? chartMonths : ["", "", "", "", "", ""];

  const maxVal = Math.max(...finalSalesData) || 1000;
  const minVal = Math.min(...finalSalesData);
  const range = maxVal - minVal || 1;

  const points = finalSalesData
    .map((val, index) => {
      const x = (index / (finalSalesData.length - 1)) * chartWidth;
      const y = chartHeight - ((val - minVal) / range) * (chartHeight - 40) - 20;
      return `${x},${y}`;
    })
    .join(" ");

  if (loading) {
    return (
      <div className="flex h-[500px] flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white" />
        <p className="text-[10px] font-bold tracking-[0.4em] text-white/30 uppercase animate-pulse">
          Syncing Control Panel...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">
            Status Board
          </h1>
          <p className="text-xs text-white/45">Real-time indicators and metrics summaries.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/new"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-black transition hover:bg-white/88"
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Revenue",
            value: `₹${stats.totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: DollarSign,
            trend: stats.revenueGrowth,
          },
          {
            label: "Total Orders",
            value: stats.totalOrders.toString(),
            icon: ShoppingBag,
            trend: stats.ordersGrowth,
          },
          {
            label: "Waitlist Signups",
            value: stats.waitlistCount.toString(),
            icon: ClipboardList,
            trend: stats.waitlistGrowth,
          },
          {
            label: "Total Customers",
            value: stats.totalCustomers.toString(),
            icon: Users,
            trend: stats.customersGrowth,
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
                  {card.label}
                </span>
                <Icon size={16} className="text-white/40" />
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight text-white">
                {card.value}
              </p>
              <p className="mt-2 text-[10px] text-white/20 tracking-wider">
                {card.trend}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* SUB STATS BLOCK */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Today's Sales", value: `₹${stats.todaySales.toFixed(2)}`, color: "border-white/[0.06]" },
          { label: "Pending Orders", value: stats.pendingOrders, color: "border-white/[0.06]" },
          {
            label: "Out of Stock Products",
            value: stats.outOfStockCount,
            color: stats.outOfStockCount > 0 ? "border-white/20" : "border-white/[0.06]",
            icon: stats.outOfStockCount > 0 ? AlertTriangle : null,
          },
        ].map((sub, i) => (
          <div
            key={sub.label}
            className={`flex items-center justify-between rounded-2xl border bg-[#0c0c0c]/40 p-5 ${sub.color}`}
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
                {sub.label}
              </p>
              <p className="mt-1.5 text-xl font-bold text-white">{sub.value}</p>
            </div>
            {sub.icon && <sub.icon size={16} className="text-white/40" />}
          </div>
        ))}
      </div>

      {/* ANALYTICS CHART & ACTIVITIES GRID */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* CHART CARD */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 shadow-sm lg:col-span-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Revenue Analytics
              </h3>
              <p className="text-[10px] text-white/45 mt-0.5">Calculated over past months.</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05] p-1 text-[9px] font-bold tracking-widest text-white/40 uppercase">
              <span className="bg-white text-black rounded px-2 py-0.5">Monthly</span>
              <span className="px-2 py-0.5">Weekly</span>
            </div>
          </div>

          {/* Custom Minimalist Line Chart using SVG */}
          <div className="relative h-44 w-full">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-full w-full overflow-visible">
              {/* Grid lines */}
              {[0, 1, 2, 3].map((g) => {
                const y = 20 + (g * (chartHeight - 40)) / 3;
                return (
                  <line
                    key={g}
                    x1="0"
                    y1={y}
                    x2={chartWidth}
                    y2={y}
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth="1.2"
                  />
                );
              })}

              {/* Chart Line */}
              <polyline
                fill="none"
                stroke="white"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />

              {/* Data points */}
              {finalSalesData.map((val, index) => {
                const x = (index / (finalSalesData.length - 1)) * chartWidth;
                const y = chartHeight - ((val - minVal) / range) * (chartHeight - 40) - 20;
                return (
                  <g key={index} className="group cursor-pointer">
                    <circle
                      cx={x}
                      cy={y}
                      r="4.5"
                      fill="black"
                      stroke="white"
                      strokeWidth="1.8"
                    />
                  </g>
                );
              })}
            </svg>
            
            {finalSalesData.every(v => v === 0) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[0.5px]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                  No sales data recorded yet
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-between border-t border-white/[0.04] pt-3 px-1">
            {finalMonths.map((m, i) => (
              <span key={i} className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* FEED CARD */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 shadow-sm lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Recent Waitlist
            </h3>
            <Link
              href="/admin/waitlist"
              className="group inline-flex items-center gap-1 text-[9px] font-semibold tracking-wider text-white/35 uppercase hover:text-white"
            >
              <span>View All</span>
              <ArrowRight size={10} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {recentWaitlist.length === 0 ? (
              // Seed display
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-xs text-white/20">No signups found.</p>
                <Link href="/#contact" className="mt-3 text-[10px] underline text-white/40 uppercase tracking-widest hover:text-white">
                  Submit Waitlist Form
                </Link>
              </div>
            ) : (
              recentWaitlist.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col gap-1 rounded-xl bg-white/[0.02] p-3 border border-white/[0.03]"
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate text-xs font-bold text-white">
                      {entry.name}
                    </span>
                    <span className="text-[8px] text-white/22 tracking-wider">
                      {new Date(entry.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="truncate text-[10px] text-white/45 tracking-wide">
                    {entry.email}
                  </p>
                  {entry.phone && (
                    <p className="text-[9px] text-white/20 tracking-wider">
                      Phone: {entry.phone}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RECENT ORDERS TABLE */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Recent Orders
            </h3>
            <p className="text-[10px] text-white/45 mt-0.5">Latest transactions processed.</p>
          </div>
          <Link
            href="/admin/orders"
            className="group inline-flex items-center gap-1 text-[9px] font-semibold tracking-wider text-white/35 uppercase hover:text-white"
          >
            <span>View Orders</span>
            <ArrowRight size={10} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">
                <th className="pb-3 pr-4">Order ID</th>
                <th className="pb-3 px-4">Customer</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 px-4 text-right">Total</th>
                <th className="pb-3 pl-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-white/20 font-bold uppercase tracking-wider text-[10px]">
                    No orders placed yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((ord) => (
                  <tr key={ord.id} className="text-white/60">
                    <td className="py-3.5 pr-4 font-bold text-white">#{ord.id.substring(0, 8)}</td>
                    <td className="py-3.5 px-4 font-medium">{ord.customer_name}</td>
                    <td className="py-3.5 px-4">
                      <span className="rounded-full bg-white/[0.03] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-white/40">
                        {ord.order_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-white">₹{Number(ord.total).toFixed(2)}</td>
                    <td className="py-3.5 pl-4 text-right text-white/30">
                      {new Date(ord.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
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
