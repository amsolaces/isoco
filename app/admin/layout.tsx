"use client";

import { supabase } from "@/lib/supabase";
import { useAdminStore, AdminNotification } from "@/lib/adminStore";
import { useUser, useClerk } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Shirt,
  FolderTree,
  ShoppingBag,
  Users,
  ClipboardList,
  Box,
  Home,
  Image as ImageIcon,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Bell,
  CheckCircle,
  AlertTriangle,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

const sidebarLinks = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Shirt },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Waitlist", href: "/admin/waitlist", icon: ClipboardList },
  { label: "Inventory", href: "/admin/inventory", icon: Box },
  { label: "Homepage Editor", href: "/admin/content", icon: Home },
  { label: "Media Library", href: "/admin/media", icon: ImageIcon },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: SettingsIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut } = useClerk();
  const { user, role, setUser, setRole, notifications, markNotificationRead, clearNotifications } = useAdminStore();
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Skip layout enforcement for login page
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    if (!clerkLoaded) {
      return;
    }

    if (!clerkUser) {
      router.replace("/admin/login");
      return;
    }

    async function checkAuth() {
      if (!supabase) {
        router.replace("/admin/login");
        return;
      }

      const email = clerkUser?.primaryEmailAddress?.emailAddress || "";

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", email)
          .single();

        if (!profile) {
          await signOut();
          router.replace("/admin/login");
          return;
        }

        // Check role
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("id", profile.id)
          .single();

        if (!roleData || (roleData.role !== "admin" && roleData.role !== "super_admin")) {
          // Not admin
          await signOut();
          router.replace("/admin/login");
          return;
        }

        setUser({ email });
        setRole(roleData.role);
        setLoading(false);
      } catch (e) {
        console.error("Verification failed:", e);
        await signOut();
        router.replace("/admin/login");
      }
    }

    checkAuth();
  }, [pathname, isLoginPage, clerkUser, clerkLoaded, router, setUser, setRole, signOut]);

  // Click outside to close notifications
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    await signOut();
    setUser(null);
    setRole(null);
    router.replace("/admin/login");
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#060606] text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="border-2 border-white/20 border-t-white h-6 w-6 rounded-full"
        />
        <p className="mt-4 text-[10px] tracking-[0.3em] text-white/30 uppercase">
          Authenticating control panel...
        </p>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#060606] text-[#ede9e3] font-sans antialiased">
      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR — desktop layout */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-white/[0.06] bg-[#0c0c0c] transition-transform duration-300 lg:static lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-6">
          <Link href="/admin" className="flex flex-col select-none">
            <span className="text-sm font-black tracking-[0.3em] text-white">
              DRIPEGO
            </span>
            <span className="text-[8px] tracking-[0.35em] text-white/30 uppercase">
              Control Panel
            </span>
          </Link>
          <button onClick={() => setMenuOpen(false)} className="lg:hidden text-white/50 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Sidebar Nav items */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`flex h-11 items-center gap-3 rounded-xl px-4 text-xs tracking-wider transition-all duration-200 ${
                  isActive
                    ? "bg-white text-black font-semibold shadow-[0_4px_12px_rgba(255,255,255,0.15)]"
                    : "text-white/45 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="border-t border-white/[0.06] p-4">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] p-3 border border-white/[0.04]">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white/70">
                {user?.email}
              </p>
              <p className="text-[9px] tracking-widest text-white/30 uppercase">
                {role === "super_admin" ? "Super Admin" : "Administrator"}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              aria-label="Logout"
              className="grid size-8 place-items-center rounded-lg border border-white/10 text-white/50 transition hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* CORE VIEWPORT CONTENT */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TOP BAR / HEADER */}
        <header className="flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#0c0c0c]/40 px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="grid size-10 place-items-center rounded-full border border-white/10 text-white/50 transition hover:bg-white/10 hover:text-white lg:hidden"
            >
              <Menu size={16} />
            </button>
            <h2 className="hidden text-xs font-semibold tracking-[0.2em] text-white/40 uppercase sm:block">
              {sidebarLinks.find((l) => l.href === pathname)?.label || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Center */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative grid size-10 place-items-center rounded-full border border-white/10 text-white/50 transition hover:bg-white/10 hover:text-white"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-white ring-2 ring-[#0c0c0c] animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-80 rounded-2xl border border-white/[0.08] bg-[#0f0f0f] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.6)] z-50"
                  >
                    <div className="mb-3 flex items-center justify-between border-b border-white/[0.06] pb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                        Notifications ({unreadCount})
                      </h3>
                      {notifications.length > 0 && (
                        <button
                          onClick={clearNotifications}
                          className="text-[9px] font-semibold tracking-wider text-white/30 uppercase hover:text-white"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2.5">
                      {notifications.length === 0 ? (
                        <p className="py-6 text-center text-xs text-white/20">
                          No alerts reported.
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markNotificationRead(n.id)}
                            className={`flex gap-3 rounded-lg p-2 transition hover:bg-white/[0.02] cursor-pointer ${
                              !n.read ? "bg-white/[0.015]" : ""
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {n.type === "system" || n.type === "sale" ? (
                                <CheckCircle className="text-white/60" size={14} />
                              ) : (
                                <AlertTriangle className="text-white/30" size={14} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs ${!n.read ? "font-semibold text-white" : "text-white/70"}`}>
                                {n.title}
                              </p>
                              <p className="text-[10px] text-white/40 leading-relaxed mt-0.5">
                                {n.message}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User quick status link */}
            <Link
              href="/"
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 hover:bg-white/10"
            >
              <div className="h-2 w-2 rounded-full bg-white" />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/80">
                View Site
              </span>
            </Link>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 overflow-y-auto bg-[#060606] p-6 lg:p-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-[1400px]"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
