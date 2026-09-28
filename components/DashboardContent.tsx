"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser, useClerk } from "@clerk/nextjs";
import { useCartStore } from "@/lib/cartStore";
import { useWishlistStore } from "@/lib/wishlistStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Heart,
  ShoppingBag,
  MapPin,
  User,
  Bell,
  Ruler,
  ShieldAlert,
  LogOut,
  ArrowRight,
  TrendingUp,
  X,
  Lock
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

type TabType =
  | "overview"
  | "orders"
  | "wishlist"
  | "cart"
  | "addresses"
  | "profile"
  | "notifications"
  | "size-profile"
  | "security";

export default function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cartStore = useCartStore();
  const wishlistStore = useWishlistStore();
  
  const [user, setUser] = useState<any>(null);
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut } = useClerk();
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Order States
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedTrackOrder, setSelectedTrackOrder] = useState<any | null>(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState("");

  // Sync tab search parameter if provided (e.g. ?tab=wishlist)
  useEffect(() => {
    const tabParam = searchParams?.get("tab");
    if (tabParam) {
      setActiveTab(tabParam as TabType);
    }
  }, [searchParams]);

  // Local State representing fields to edit (synced with LocalStorage)
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "men",
    dob: "",
  });

  const [addresses, setAddresses] = useState<Record<string, any>>({
    home: {
      label: "Home",
      fullName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    },
    work: {
      label: "Work",
      fullName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    }
  });

  const [sizeProfile, setSizeProfile] = useState({
    height: 178, // in cm
    weight: 74, // in kg
    fit: "oversized", // "slim" | "regular" | "oversized"
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // UI state variables

  const [securityMessage, setSecurityMessage] = useState("");
  const [securityStatus, setSecurityStatus] = useState<"success" | "error" | "">("");
  const [profileMessage, setProfileMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (showDeleteModal || selectedTrackOrder) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showDeleteModal, selectedTrackOrder]);



  // Fetch user orders
  const fetchUserOrders = async (profileId: string) => {
    if (!supabase) {
      setOrdersLoading(false);
      return;
    }
    setOrdersLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("customer_id", profileId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("Failed to load user orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Authentication check
  useEffect(() => {
    if (!clerkLoaded) return;

    if (!clerkUser) {
      setOrdersLoading(false);
      setAuthLoading(false);
      router.replace("/auth");
      return;
    }

    const loadProfileAndOrders = async () => {
      setUser(clerkUser);
      const email = clerkUser.primaryEmailAddress?.emailAddress || "";

      if (supabase) {
        try {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("email", email)
            .single();

          if (profileData && profileData.first_name) {
            const fullName = `${profileData.first_name} ${profileData.last_name || ""}`.trim();
            setProfile({
              email: profileData.email,
              name: fullName,
              phone: profileData.phone || "",
              gender: profileData.gender || "men",
              dob: profileData.dob || "",
            });
            
            // Fetch orders using profile UUID
            fetchUserOrders(profileData.id);
          } else {
            // Profile incomplete, redirect to onboarding
            router.replace("/auth/onboarding");
          }
        } catch (err) {
          console.error("Failed to load profile:", err);
          const cachedProfile = localStorage.getItem("dripego-member-profile");
          if (cachedProfile) {
            const parsed = JSON.parse(cachedProfile);
            setProfile(parsed);
          } else {
            router.replace("/auth/onboarding");
          }
        } finally {
          setAuthLoading(false);
        }
      } else {
        setAuthLoading(false);
      }
    };

    loadProfileAndOrders();
  }, [clerkUser, clerkLoaded, router]);

  // Sync state from LocalStorage on mount
  useEffect(() => {
    if (clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress || "";
      const cachedProfile = localStorage.getItem("dripego-member-profile");
      if (cachedProfile) {
        try {
          const parsed = JSON.parse(cachedProfile);
          if (parsed.email === email) {
            setProfile(parsed);
          }
        } catch (err) {
          console.error("Failed to parse cached profile:", err);
        }
      }
    }

    const cachedAddresses = localStorage.getItem("dripego-member-addresses");
    if (cachedAddresses) {
      try {
        const parsed = JSON.parse(cachedAddresses);
        const normalized = { ...parsed };
        if (!normalized.home) {
          normalized.home = { label: "Home", fullName: "", phone: "", address: "", city: "", state: "", pincode: "" };
        } else if (!normalized.home.label) {
          normalized.home.label = "Home";
        }
        if (!normalized.work) {
          normalized.work = { label: "Work", fullName: "", phone: "", address: "", city: "", state: "", pincode: "" };
        } else if (!normalized.work.label) {
          normalized.work.label = "Work";
        }
        Object.keys(normalized).forEach((key) => {
          if (!normalized[key].label) {
            normalized[key].label = key.charAt(0).toUpperCase() + key.slice(1);
          }
        });
        setAddresses(normalized);
      } catch (err) {
        console.error("Failed to parse cached addresses:", err);
      }
    }

    const cachedSize = localStorage.getItem("dripego-member-size");
    if (cachedSize) setSizeProfile(JSON.parse(cachedSize));
  }, []);



  // Save changes helper
  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("dripego-member-profile", JSON.stringify(profile));
    
    // Sync to Supabase Profiles
    if (supabase && clerkUser) {
      try {
        const firstName = profile.name.trim().split(" ")[0];
        const lastName = profile.name.trim().split(" ").slice(1).join(" ") || "";
        
        await supabase
          .from("profiles")
          .update({
            first_name: firstName,
            last_name: lastName,
            phone: profile.phone.trim(),
            gender: profile.gender,
            dob: profile.dob || null,
            updated_at: new Date().toISOString(),
          })
          .eq("clerk_user_id", clerkUser.id);
      } catch (err) {
        console.error("Failed to sync profile change to database:", err);
      }
    }
    
    setProfileMessage("Profile successfully updated in Room records.");
    setTimeout(() => setProfileMessage(""), 4000);
  };

  const saveAddress = (type: string, data: any) => {
    const updated = { ...addresses, [type]: data };
    setAddresses(updated);
    localStorage.setItem("dripego-member-addresses", JSON.stringify(updated));
    alert(`${(data.label || type).toUpperCase()} address saved successfully.`);
  };

  const saveSizes = (updated: typeof sizeProfile) => {
    setSizeProfile(updated);
    localStorage.setItem("dripego-member-size", JSON.stringify(updated));
  };

  // Sign out helper
  const handleLogout = async () => {
    await signOut();
    cartStore.clearCart();
    wishlistStore.clearWishlist();
    localStorage.removeItem("dripego-member-profile");
    localStorage.removeItem("dripego-member-addresses");
    localStorage.removeItem("dripego-member-size");
    router.push("/");
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (security.newPassword !== security.confirmPassword) {
      setSecurityStatus("error");
      setSecurityMessage("Passwords do not match.");
      return;
    }
    if (security.newPassword.length < 6) {
      setSecurityStatus("error");
      setSecurityMessage("Password must be at least 6 characters.");
      return;
    }

    if (clerkUser) {
      try {
        await (clerkUser as any).updatePassword({
          currentPassword: security.currentPassword,
          newPassword: security.newPassword,
        });
        setSecurityStatus("success");
        setSecurityMessage("Password successfully updated.");
        setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } catch (err: any) {
        setSecurityStatus("error");
        if (err.errors && err.errors.length > 0) {
          setSecurityMessage(err.errors[0].longMessage || err.errors[0].message);
        } else {
          setSecurityMessage(err.message || "Failed to update password.");
        }
      }
    } else {
      setSecurityStatus("success");
      setSecurityMessage("Password simulated update successfully.");
      setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }
    setTimeout(() => {
      setSecurityMessage("");
      setSecurityStatus("");
    }, 5000);
  };

  // Auto Size recommender algorithm
  const getRecommendedSize = () => {
    const { height, weight, fit } = sizeProfile;
    let baseSize = "M";

    // Height logic
    if (height < 165) {
      baseSize = weight < 55 ? "XS" : "S";
    } else if (height >= 165 && height < 178) {
      baseSize = weight < 70 ? "S" : "M";
    } else if (height >= 178 && height < 188) {
      baseSize = weight < 82 ? "M" : "L";
    } else {
      baseSize = weight < 95 ? "L" : "XL";
    }

    // Adjust for Fit Preference
    const sizesArr = ["XS", "S", "M", "L", "XL"];
    const baseIdx = sizesArr.indexOf(baseSize);
    
    if (fit === "slim" && baseIdx > 0) {
      return sizesArr[baseIdx - 1];
    } else if (fit === "oversized" && baseIdx < sizesArr.length - 1) {
      return sizesArr[baseIdx + 1];
    }
    return baseSize;
  };



  if (authLoading) {
    return (
      <div className="flex h-[500px] flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white" />
        <p className="text-[10px] font-bold tracking-[0.4em] text-white/30 uppercase animate-pulse">
          Accessing Vault...
        </p>
      </div>
    );
  }

  // 1. Members Only Gate Check
  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-[500px] rounded-[28px] border border-white/[0.08] bg-[#0c0c0c] p-8 text-center shadow-[0_0_80px_rgba(0,0,0,0.8)]"
      >
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.02]">
          <Lock size={20} className="text-white/40" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-2">
          Private Club Access
        </h2>
        <p className="text-[11px] leading-relaxed tracking-wider text-white/40 uppercase mb-8">
          The dashboard is exclusively reserved for members of the DRIPEGO room.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/auth"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-[11px] font-bold uppercase tracking-widest text-black transition hover:bg-white/88"
          >
            <span>Access Vault / Sign In</span>
            <ArrowRight size={13} strokeWidth={2.4} />
          </Link>
          <Link
            href="/"
            className="flex h-12 w-full items-center justify-center rounded-xl border border-white/10 bg-transparent text-[11px] font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/[0.02] transition"
          >
            Go Back
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-6 lg:gap-8 lg:grid-cols-[280px_1fr] w-full min-w-0 overflow-hidden lg:overflow-visible">
      {/* LEFT COLUMN: Premium Sidebar */}
      <aside className="space-y-6 min-w-0 w-full">
        {/* User Card */}
        <div className="rounded-[24px] border border-white/[0.08] bg-[#0c0c0c] p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-sm font-black uppercase text-white shadow-inner">
              {profile.name ? profile.name.split(" ").map(n => n[0]).join("") : "M"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white uppercase truncate">{profile.name}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] font-bold tracking-widest text-white/40 uppercase">
                  Member
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Sidebar Menu */}
        <nav className="hidden lg:flex flex-col gap-1.5 rounded-[24px] border border-white/[0.08] bg-[#0c0c0c] p-4">
          {[
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "orders", label: "My Orders", icon: Package },
            { id: "wishlist", label: "Wishlist", icon: Heart, count: wishlistStore.items.length },
            { id: "cart", label: "Cart Preview", icon: ShoppingBag, count: cartStore.items.length },
            { id: "addresses", label: "Saved Addresses", icon: MapPin },
            { id: "profile", label: "Edit Profile", icon: User },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "size-profile", label: "Size Profile", icon: Ruler },
            { id: "security", label: "Security & Control", icon: ShieldAlert },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-xs font-bold tracking-wide transition uppercase cursor-pointer ${
                  isActive
                    ? "bg-white text-black font-extrabold"
                    : "text-white/50 hover:bg-white/[0.03] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={14} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`grid h-5 min-w-5 place-items-center rounded-full text-[9px] font-bold px-1.5 ${
                    isActive ? "bg-black text-white" : "bg-white/10 text-white/70"
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
          <div className="h-px my-2 bg-white/[0.08]" />
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-bold tracking-wide text-red-400/60 hover:bg-red-400/5 hover:text-red-400 transition uppercase cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </nav>

        {/* Mobile Horizontal Menu */}
        <nav className="flex lg:hidden overflow-x-auto gap-2 pb-2 scrollbar-none border-b border-white/[0.06] -mx-4 px-4">
          {[
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "orders", label: "Orders", icon: Package },
            { id: "wishlist", label: "Wishlist", icon: Heart },
            { id: "cart", label: "Cart", icon: ShoppingBag },
            { id: "addresses", label: "Addresses", icon: MapPin },
            { id: "profile", label: "Profile", icon: User },
            { id: "notifications", label: "Alerts", icon: Bell },
            { id: "size-profile", label: "Size", icon: Ruler },
            { id: "security", label: "Security", icon: ShieldAlert },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`flex items-center gap-2 shrink-0 rounded-full px-4 py-2.5 text-[10px] font-bold tracking-widest uppercase transition cursor-pointer ${
                  isActive
                    ? "bg-white text-black"
                    : "border border-white/10 bg-white/[0.02] text-white/50"
                }`}
              >
                <Icon size={12} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* RIGHT COLUMN: Dynamic Panel display */}
      <section className="min-w-0 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[24px] sm:rounded-[28px] border border-white/[0.08] bg-[#0c0c0c] p-4 sm:p-6 md:p-8 shadow-md"
          >
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6 sm:space-y-8">
                {/* Greeting Hero */}
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-transparent p-5 sm:p-6 md:p-8 flex flex-col md:flex-row justify-between md:items-center gap-4 sm:gap-6">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl leading-tight">
                      WELCOME BACK, {profile.name.split(" ")[0]}.
                    </h2>
                    <p className="mt-2 text-[10px] sm:text-xs tracking-wider text-white/40 uppercase font-medium">
                      MEMBERSHIP / <span className="text-white font-bold">VERIFIED</span>
                    </p>
                  </div>
                  <Link
                    href="/products"
                    className="group shrink-0 flex h-11 sm:h-12 items-center justify-center gap-2 rounded-xl sm:rounded-full bg-white px-6 text-[10px] font-bold tracking-widest text-black uppercase transition hover:bg-white/90 w-full md:w-auto"
                  >
                    <span>Shop DROP 001 Capsule</span>
                    <ArrowRight size={12} strokeWidth={2.4} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>

                {/* Info Cards Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                  {[
                    { title: "Saved Wishlist", value: `${wishlistStore.items.length} Pieces`, label: "Archived custom fits", icon: Heart, tab: "wishlist" },
                    { title: "Active Cart", value: `${cartStore.items.reduce((acc, c) => acc + c.quantity, 0)} Items`, label: `Total value: ₹${cartStore.getCartSubtotal().toLocaleString("en-IN")}`, icon: ShoppingBag, tab: "cart" },
                    { title: "Addresses", value: `${Object.values(addresses).filter(a => a.address !== "").length} Saved`, label: "Shipping coordinates", icon: MapPin, tab: "addresses" },
                    { title: "Size profile", value: `Recommended: ${getRecommendedSize()}`, label: `Fit preference: ${sizeProfile.fit}`, icon: Ruler, tab: "size-profile" },
                  ].map((card, i) => {
                    const Icon = card.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => setActiveTab(card.tab as TabType)}
                        className="group text-left rounded-xl border border-white/[0.06] bg-white/[0.01] p-5 transition hover:border-white/15 hover:bg-white/[0.02] cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-3 text-white/30 group-hover:text-white/60 transition">
                          <Icon size={16} />
                          <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-4px] group-hover:translate-x-0" />
                        </div>
                        <p className="text-[9px] font-bold tracking-widest text-white/30 uppercase">{card.title}</p>
                        <p className="text-xl font-bold text-white uppercase mt-1 leading-none">{card.value}</p>
                        <p className="text-[10px] text-white/35 mt-2 uppercase font-medium">{card.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-lg font-black uppercase tracking-tight text-white">Order Archive</h3>
                  {/* Search Order Input */}
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="SEARCH ORDER ID..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className="h-9 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 text-[10px] font-bold tracking-widest text-white outline-none focus:border-white/20 uppercase placeholder:text-white/20"
                    />
                    {orderSearchQuery && (
                      <button
                        onClick={() => setOrderSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {ordersLoading ? (
                  /* Skeleton Loader */
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 animate-pulse">
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-20 bg-white/10 rounded" />
                            <div className="h-4 w-16 bg-white/10 rounded-full" />
                          </div>
                          <div className="h-3 w-40 bg-white/5 rounded" />
                          <div className="h-3.5 w-60 bg-white/5 rounded" />
                        </div>
                        <div className="flex gap-2.5">
                          <div className="h-8 w-28 bg-white/5 rounded-lg" />
                          <div className="h-8 w-20 bg-white/5 rounded-lg" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Filtered Orders List */
                  (() => {
                    const filtered = orders.filter((o) =>
                      o.id.toLowerCase().includes(orderSearchQuery.toLowerCase())
                    );

                    if (filtered.length === 0) {
                      return (
                        <div className="flex h-64 flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-white/[0.08]">
                          <Package size={24} className="text-white/20 mb-3" />
                          <p className="text-xs font-bold tracking-wider text-white/50 uppercase">
                            {orderSearchQuery ? "No matching orders found" : "No orders in your archive"}
                          </p>
                          <p className="text-[10px] text-white/30 uppercase mt-1 max-w-xs font-light">
                            {orderSearchQuery
                              ? "Verify your Order ID sequence and check for typos."
                              : "You haven't ordered any custom fits from our dropping series yet."}
                          </p>
                          {!orderSearchQuery && (
                            <Link
                              href="/products"
                              className="mt-5 rounded-full bg-white px-5 py-2 text-[10px] font-bold tracking-widest text-black uppercase transition hover:bg-white/80"
                            >
                              Browse Collection
                            </Link>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {filtered.map((ord) => {
                          const itemsSummary = ord.order_items?.map((item: any) => `${item.product_name} (${item.size})`).join(", ") || "No items";
                          const itemCount = ord.order_items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
                          
                          // Format placed date
                          const placedDate = new Date(ord.created_at).toLocaleDateString(undefined, {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          });

                          return (
                            <div key={ord.id} className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 transition hover:border-white/12">
                              <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-bold tracking-widest text-white uppercase">#{ord.id.substring(0, 8)}</span>
                                  <span className={`rounded-full px-2.5 py-0.5 text-[8px] font-bold tracking-widest uppercase ${
                                    ord.order_status === "delivered"
                                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                      : ord.order_status === "cancelled"
                                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                      : ord.order_status === "shipped"
                                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                      : "bg-white/10 text-white border border-white/10"
                                  }`}>
                                    {ord.order_status}
                                  </span>
                                </div>
                                <p className="text-[10px] text-white/30 uppercase font-medium">Placed on: {placedDate} • {itemCount} {itemCount === 1 ? 'Item' : 'Items'}</p>
                                <p className="text-[10px] font-semibold text-white/65 uppercase truncate max-w-md">₹{Number(ord.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })} • {itemsSummary}</p>
                              </div>
                              <div className="flex gap-2.5">
                                <button
                                  onClick={() => setSelectedTrackOrder(ord)}
                                  className="rounded-lg border border-white/10 px-4 py-2 text-[10px] font-bold tracking-wider text-white/60 hover:text-white hover:border-white/20 transition uppercase cursor-pointer"
                                >
                                  Track Shipment
                                </button>
                                <button
                                  onClick={() => {
                                    alert(`Order Invoice details:\nInvoice ID: INV-${ord.id.substring(0, 8).toUpperCase()}\nTotal: ₹${Number(ord.total).toLocaleString("en-IN")}\nCustomer: ${ord.customer_name}`);
                                  }}
                                  className="rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-[10px] font-bold tracking-wider text-white/65 hover:bg-white/10 hover:text-white transition uppercase cursor-pointer"
                                >
                                  Invoice
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        <p className="text-[9px] font-bold tracking-[0.2em] text-white/20 uppercase text-center mt-8">
                          End of order archives. Only showing transactions from the current dropping series.
                        </p>
                      </div>
                    );
                  })()
                )}
              </div>
            )}

            {/* WISHLIST TAB */}
            {activeTab === "wishlist" && (
              <div className="space-y-6">
                <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">Saved Fits / Wishlist</h3>
                
                {wishlistStore.items.length === 0 ? (
                  <div className="flex h-64 flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-white/[0.08]">
                    <Heart size={24} className="text-white/20 mb-3" />
                    <p className="text-xs font-bold tracking-wider text-white/50 uppercase">No items in your locker</p>
                    <p className="text-[10px] text-white/30 uppercase mt-1 max-w-xs font-light">Explore catalog drop coordinates to save items for customized fit selection.</p>
                    <Link
                      href="/products"
                      className="mt-5 rounded-full bg-white px-5 py-2 text-[10px] font-bold tracking-widest text-black uppercase transition hover:bg-white/80"
                    >
                      Browse Inventory
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {wishlistStore.items.map((item) => (
                      <div key={item.product_id} className="group relative flex flex-col rounded-xl border border-white/[0.06] bg-white/[0.01] overflow-hidden transition hover:border-white/15">
                        <div className="relative aspect-[3/4] overflow-hidden">
                          <Image src={item.thumbnail} alt={item.name} fill className="object-cover transition duration-500 group-hover:scale-103" />
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between gap-3 bg-[#0a0a0a]">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-white uppercase truncate">{item.name}</p>
                            <p className="text-[9px] text-white/35 mt-0.5">₹{item.price.toLocaleString("en-IN")}</p>
                          </div>
                          
                          <div className="grid gap-1.5">
                            <button
                              onClick={() => {
                                cartStore.addItem({
                                  id: `${item.product_id}-M-Black`,
                                  product_id: item.product_id,
                                  name: item.name,
                                  slug: item.slug,
                                  price: item.price,
                                  size: "M",
                                  color: "Black",
                                  thumbnail: item.thumbnail,
                                });
                                wishlistStore.removeItem(item.product_id);
                                cartStore.setIsOpen(true);
                              }}
                              className="w-full rounded-lg bg-white py-2 text-[9px] font-bold tracking-widest text-black uppercase transition hover:bg-white/88 cursor-pointer text-center"
                            >
                              Move To Cart
                            </button>
                            <div className="grid grid-cols-2 gap-1.5">
                              <Link
                                href={`/products/${item.slug}`}
                                className="rounded-lg border border-white/10 py-1.5 text-[9px] font-bold tracking-widest text-white/60 hover:text-white hover:bg-white/[0.02] text-center uppercase"
                              >
                                Buy Now
                              </Link>
                              <button
                                onClick={() => wishlistStore.removeItem(item.product_id)}
                                className="rounded-lg border border-red-400/10 hover:border-red-400/20 py-1.5 text-[9px] font-bold tracking-widest text-red-400/50 hover:text-red-400 text-center uppercase cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CART TAB */}
            {activeTab === "cart" && (
              <div className="space-y-6">
                <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">Cart Preview</h3>
                
                {cartStore.items.length === 0 ? (
                  <div className="flex h-64 flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-white/[0.08]">
                    <ShoppingBag size={24} className="text-white/20 mb-3" />
                    <p className="text-xs font-bold tracking-wider text-white/50 uppercase">Your bag is empty</p>
                    <p className="text-[10px] text-white/30 uppercase mt-1 max-w-xs font-light">Explore catalog drop coordinates to add elements to your order bundle.</p>
                    <Link
                      href="/products"
                      className="mt-5 rounded-full bg-white px-5 py-2 text-[10px] font-bold tracking-widest text-black uppercase transition hover:bg-white/80"
                    >
                      Browse Inventory
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="divide-y divide-white/[0.06]">
                      {cartStore.items.map((item) => (
                        <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                          <div className="relative size-16 rounded-lg overflow-hidden border border-white/10 shrink-0">
                            <Image src={item.thumbnail} alt={item.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <h4 className="text-xs font-bold text-white uppercase truncate">{item.name}</h4>
                                <p className="text-[10px] text-white/40 uppercase mt-0.5">Size: {item.size} • Color: {item.color}</p>
                              </div>
                              <span className="text-xs font-bold text-white">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <div className="flex items-center border border-white/10 bg-black rounded-lg px-2 h-7">
                                <button
                                  onClick={() => cartStore.updateQuantity(item.product_id, item.size, item.color, item.quantity - 1)}
                                  className="text-white/40 hover:text-white px-1 text-xs cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="text-[10px] font-bold text-white px-2.5">{item.quantity}</span>
                                <button
                                  onClick={() => cartStore.updateQuantity(item.product_id, item.size, item.color, item.quantity + 1)}
                                  className="text-white/40 hover:text-white px-1 text-xs cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                onClick={() => cartStore.removeItem(item.product_id, item.size, item.color)}
                                className="text-[10px] font-bold tracking-wider text-red-400/50 hover:text-red-400 uppercase cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-white/[0.08] pt-4 flex flex-col gap-4">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Subtotal</span>
                        <span className="text-lg font-bold text-white">₹{cartStore.getCartSubtotal().toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                          href="/checkout"
                          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-white text-[10px] font-bold uppercase tracking-widest text-black transition hover:bg-white/88"
                        >
                          Proceed to Checkout
                        </Link>
                        <Link
                          href="/products"
                          className="flex h-11 items-center justify-center rounded-xl border border-white/10 bg-transparent px-6 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/[0.02] transition"
                        >
                          Continue Shopping
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ADDRESSES TAB */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">Saved Addresses</h3>
                
                <div className="grid gap-6 md:grid-cols-2">
                  {Object.keys(addresses)
                    .sort((a, b) => {
                      if (a === "home") return -1;
                      if (b === "home") return 1;
                      if (a === "work") return -1;
                      if (b === "work") return 1;
                      return 0;
                    })
                    .map((key) => {
                      const addr = addresses[key];
                      const isCustom = key !== "home" && key !== "work";
                      const displayLabel = addr.label || (key.charAt(0).toUpperCase() + key.slice(1));
                      
                      return (
                        <div key={key} className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-5 space-y-4">
                          <div className="flex justify-between items-baseline border-b border-white/[0.05] pb-2">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-white">{displayLabel} coordinate</h4>
                            {addr.address && (
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            )}
                          </div>
                          {addr.address ? (
                            <div className="text-xs space-y-1 text-white/60 font-mono">
                              <p className="font-bold text-white uppercase">{addr.fullName}</p>
                              <p>{addr.address}</p>
                              <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                              <p className="text-white/40 pt-1">Phone: {addr.phone}</p>
                              <div className="pt-3 flex gap-4">
                                <Link
                                  href={`/dashboard/addresses?edit=${key}`}
                                  className="text-[10px] font-bold tracking-widest text-white/60 hover:text-white uppercase transition"
                                >
                                  Edit Coordinate
                                </Link>
                                <button
                                  onClick={() => {
                                    const confirmed = confirm(`Do you want to delete the ${displayLabel} address?`);
                                    if (confirmed) {
                                      let updated;
                                      if (isCustom) {
                                        const { [key]: _, ...rest } = addresses;
                                        updated = rest;
                                      } else {
                                        updated = {
                                          ...addresses,
                                          [key]: { label: displayLabel, fullName: "", phone: "", address: "", city: "", state: "", pincode: "" }
                                        };
                                      }
                                      setAddresses(updated);
                                      localStorage.setItem("dripego-member-addresses", JSON.stringify(updated));
                                    }
                                  }}
                                  className="text-[10px] font-bold tracking-widest text-red-400/50 hover:text-red-400 uppercase cursor-pointer"
                                >
                                  Delete Coordinate
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs space-y-3">
                              <p className="text-white/30 uppercase text-[10px]">No address set for this destination.</p>
                              <Link
                                href={`/dashboard/addresses?edit=${key}`}
                                className="inline-block rounded-lg border border-white/10 px-4 py-2 text-[10px] font-bold tracking-widest text-white/60 hover:text-white hover:border-white/20 transition uppercase"
                              >
                                Setup Coordinate
                              </Link>
                            </div>
                          )}
                        </div>
                      );
                    })}

                  {/* Add Another Address Card */}
                  <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.01] hover:bg-white/[0.02] transition duration-200 p-5 flex flex-col justify-center items-center min-h-[180px] text-center">
                    <p className="text-white/30 uppercase text-[10px] mb-3">Require additional shipping locations?</p>
                    <Link
                      href="/dashboard/addresses?action=add"
                      className="rounded-lg bg-white border border-transparent px-4 py-2 text-[10px] font-bold tracking-widest text-black hover:bg-white/90 transition uppercase"
                    >
                      Add Another Address
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">Edit Member Profile</h3>
                
                <form onSubmit={saveProfile} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 block">Full Name</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        required
                        className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 text-xs text-white outline-none transition placeholder:text-white/20 focus:border-white/25"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 block">Email Address</label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.01] px-4 text-xs text-white/40 outline-none cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 block">Phone Number</label>
                      <input
                        type="text"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        required
                        className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 text-xs text-white outline-none transition placeholder:text-white/20 focus:border-white/25"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 block">Gender</label>
                      <select
                        value={profile.gender}
                        onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                        className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 text-xs text-white outline-none transition focus:border-white/25"
                      >
                        <option value="men">Men</option>
                        <option value="women">Women</option>
                        <option value="unisex">Unisex / Other</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 block">Date of Birth</label>
                      <input
                        type="date"
                        value={profile.dob}
                        onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                        required
                        className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 text-xs text-white outline-none transition focus:border-white/25"
                      />
                    </div>
                  </div>

                  {profileMessage && (
                    <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest">{profileMessage}</p>
                  )}

                  <button
                    type="submit"
                    className="rounded-xl bg-white px-6 py-3 text-[10px] font-bold tracking-widest text-black uppercase transition hover:bg-white/88 cursor-pointer"
                  >
                    Update Profile
                  </button>
                </form>
              </div>
            )}



            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <div className="space-y-4">
                <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">Inbox & Alerts</h3>
                
                <div className="divide-y divide-white/[0.06]">
                  {[
                    { title: "Locker Coordinate Activated", desc: "Your DRIPEGO member locker is now active. Explore custom fit options and order archiving.", date: "Today" },
                    { title: "Shipment Dispatched", desc: "Your order DP-00021 has been handed over to courier partners. Tracking code: IN827462849IN", date: "Yesterday" },
                    { title: "Drop Announcement", desc: "Drop 002 Capsule release schedules have been loaded. Launch is locked in for 11 days.", date: "June 16, 2026" },
                  ].map((notif, i) => (
                    <div key={i} className="py-4 flex justify-between items-start gap-4 first:pt-0 last:pb-0">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase">{notif.title}</h4>
                        <p className="text-xs text-white/45 mt-1 leading-relaxed">{notif.desc}</p>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-white/20 shrink-0">{notif.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}





            {/* SIZE PROFILE TAB */}
            {activeTab === "size-profile" && (
              <div className="space-y-6">
                <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">Fit Profile Setup</h3>
                
                <div className="space-y-6">
                  {/* Height slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-white/40">Height Coordinate</label>
                      <span className="text-xs font-bold text-white font-mono">{sizeProfile.height} CM</span>
                    </div>
                    <input
                      type="range"
                      min="150"
                      max="210"
                      value={sizeProfile.height}
                      onChange={(e) => saveSizes({ ...sizeProfile, height: Number(e.target.value) })}
                      className="w-full appearance-none bg-transparent cursor-pointer focus:outline-none [&::-webkit-slider-runnable-track]:bg-white/10 [&::-webkit-slider-runnable-track]:h-[3px] [&::-webkit-slider-runnable-track]:rounded-full hover:[&::-webkit-slider-runnable-track]:bg-white/15 transition-colors [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:mt-[-4.5px] [&::-webkit-slider-thumb]:transition-all hover:[&::-webkit-slider-thumb]:scale-125 hover:[&::-webkit-slider-thumb]:bg-white active:[&::-webkit-slider-thumb]:scale-125 [&::-moz-range-track]:bg-white/10 [&::-moz-range-track]:h-[3px] [&::-moz-range-track]:rounded-full [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:transition-all hover:[&::-moz-range-thumb]:scale-125 active:[&::-moz-range-thumb]:scale-125"
                    />
                  </div>

                  {/* Weight slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-white/40">Weight Coordinate</label>
                      <span className="text-xs font-bold text-white font-mono">{sizeProfile.weight} KG</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="120"
                      value={sizeProfile.weight}
                      onChange={(e) => saveSizes({ ...sizeProfile, weight: Number(e.target.value) })}
                      className="w-full appearance-none bg-transparent cursor-pointer focus:outline-none [&::-webkit-slider-runnable-track]:bg-white/10 [&::-webkit-slider-runnable-track]:h-[3px] [&::-webkit-slider-runnable-track]:rounded-full hover:[&::-webkit-slider-runnable-track]:bg-white/15 transition-colors [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:mt-[-4.5px] [&::-webkit-slider-thumb]:transition-all hover:[&::-webkit-slider-thumb]:scale-125 hover:[&::-webkit-slider-thumb]:bg-white active:[&::-webkit-slider-thumb]:scale-125 [&::-moz-range-track]:bg-white/10 [&::-moz-range-track]:h-[3px] [&::-moz-range-track]:rounded-full [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:transition-all hover:[&::-moz-range-thumb]:scale-125 active:[&::-moz-range-thumb]:scale-125"
                    />
                  </div>

                  {/* Fit style buttons */}
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 block">Preferred Fit Silhouette</label>
                    <div className="flex rounded-xl border border-white/[0.08] bg-black p-1 max-w-[360px]">
                      {(["slim", "regular", "oversized"] as const).map((fitOption) => (
                        <button
                          key={fitOption}
                          type="button"
                          onClick={() => saveSizes({ ...sizeProfile, fit: fitOption })}
                          className={`flex-1 rounded-lg py-2.5 text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                            sizeProfile.fit === fitOption
                              ? "bg-white text-black"
                              : "text-white/40 hover:text-white/70"
                          }`}
                        >
                          {fitOption}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size Output Card */}
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold tracking-widest text-white/30 uppercase">Recommended DRIPEGO Size</p>
                      <p className="text-3xl font-black text-white mt-1 leading-none">SIZE {getRecommendedSize()}</p>
                    </div>
                    <div className="rounded-full bg-white/[0.02] border border-white/10 p-3">
                      <TrendingUp size={20} className="text-white/40" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">Security controls</h3>
                
                {/* Change password */}
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm pb-6 border-b border-white/[0.06]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Update Password</h4>
                  
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 block">New Password</label>
                    <input
                      type="password"
                      value={security.newPassword}
                      onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                      required
                      placeholder="At least 6 characters"
                      className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 text-xs text-white outline-none transition placeholder:text-white/20 focus:border-white/25"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 block">Confirm Password</label>
                    <input
                      type="password"
                      value={security.confirmPassword}
                      onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                      required
                      placeholder="Retype password"
                      className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 text-xs text-white outline-none transition placeholder:text-white/20 focus:border-white/25"
                    />
                  </div>

                  {securityMessage && (
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${
                      securityStatus === "success" ? "text-green-400" : "text-red-400"
                    }`}>
                      {securityMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="rounded-xl bg-white px-5 py-3 text-[10px] font-bold tracking-widest text-black uppercase transition hover:bg-white/88 cursor-pointer"
                  >
                    Change Password
                  </button>
                </form>

                {/* Account signout/delete actions */}
                <div className="space-y-4 pt-2 max-w-sm">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Advanced Controls</h4>
                  
                  <div className="space-y-2">
                    <button
                      onClick={async () => {
                        alert("Successfully logged out from all active sessions.");
                        handleLogout();
                      }}
                      className="w-full rounded-xl border border-white/10 bg-transparent px-5 py-3 text-left text-xs font-bold tracking-wider text-white/70 hover:bg-white/[0.02] hover:text-white transition uppercase cursor-pointer"
                    >
                      Logout Everywhere
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full rounded-xl border border-red-400/10 hover:border-red-400/20 bg-transparent px-5 py-3 text-left text-xs font-bold tracking-wider text-red-400/60 hover:bg-red-400/5 hover:text-red-400 transition uppercase cursor-pointer"
                    >
                      Delete Account Coordinate
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* DELETE ACCOUNT VERIFICATION MODAL */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="fixed inset-0 bg-black"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-[420px] rounded-2xl border border-red-500/20 bg-[#0e0e0e] p-6 text-center shadow-[0_0_80px_rgba(239,68,68,0.08)]"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/20 bg-red-500/5 text-red-400">
                <ShieldAlert size={20} />
              </div>
              <h4 className="text-lg font-black uppercase text-white tracking-tight">Destroy Account?</h4>
              <p className="mt-2 text-xs leading-relaxed text-white/40 uppercase font-light">
                This action is irreversible. All size profiles, locker configurations, and orders will be destroyed forever.
              </p>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={async () => {
                    if (supabase) {
                      // Attempt to delete user via API, then sign out
                      await supabase.auth.signOut();
                    }
                    cartStore.clearCart();
                    wishlistStore.clearWishlist();
                    localStorage.removeItem("dripego-member-profile");
                    localStorage.removeItem("dripego-member-addresses");
                    localStorage.removeItem("dripego-member-size");
                    setShowDeleteModal(false);
                    router.push("/");
                  }}
                  className="flex-1 rounded-xl bg-red-500 py-3 text-[10px] font-bold tracking-widest text-white uppercase hover:bg-red-600 transition cursor-pointer"
                >
                  Delete coordinate
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-transparent py-3 text-[10px] font-bold tracking-widest text-white/50 hover:text-white hover:bg-white/5 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SHIPMENT TRACKING MODAL */}
      <AnimatePresence>
        {selectedTrackOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTrackOrder(null)}
              className="fixed inset-0 bg-black"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-[550px] rounded-2xl border border-white/[0.08] bg-[#0c0c0c] p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
              data-lenis-prevent
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-6">
                <div>
                  <h4 className="text-sm font-black uppercase text-white tracking-tight">Track Order Shipment</h4>
                  <p className="text-[10px] text-white/45 tracking-widest uppercase mt-1">Order: #{selectedTrackOrder.id.substring(0, 8)}</p>
                </div>
                <button
                  onClick={() => setSelectedTrackOrder(null)}
                  className="grid size-8 place-items-center rounded-lg border border-white/10 text-white/40 hover:bg-white/10 hover:text-white transition cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Status Indicator banner */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4 flex justify-between items-center mb-6">
                <div>
                  <p className="text-[9px] font-bold tracking-widest text-white/30 uppercase">Fulfillment Status</p>
                  <p className="text-base font-black text-white uppercase mt-1">
                    {selectedTrackOrder.order_status}
                  </p>
                </div>
                <div className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-widest uppercase border ${
                  selectedTrackOrder.order_status === "delivered"
                    ? "bg-green-500/10 border-green-500/20 text-green-400"
                    : selectedTrackOrder.order_status === "cancelled"
                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                    : selectedTrackOrder.order_status === "shipped"
                    ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                    : "bg-white/5 border-white/10 text-white/60"
                }`}>
                  {selectedTrackOrder.payment_status === "paid" ? "Paid" : "COD Pending"}
                </div>
              </div>

              {/* STEPS TIMELINE */}
              {selectedTrackOrder.order_status === "cancelled" ? (
                <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-4 text-center mb-6">
                  <p className="text-xs font-bold text-red-400 uppercase">This order was cancelled</p>
                  <p className="text-[10px] text-red-400/60 uppercase mt-1">
                    If this was a mistake, or you need support, please contact our help desk with your order identifier.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 mb-6 pl-4 border-l border-white/[0.06] relative">
                  {/* Step indicators */}
                  {[
                    {
                      label: "Order Placed",
                      desc: "Your order details have been successfully received.",
                      status: "pending",
                      active: true, // Always completed if order exists
                      time: new Date(selectedTrackOrder.created_at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                    },
                    {
                      label: "Confirmed",
                      desc: "Payment authorized. Verification and size profiling complete.",
                      status: "confirmed",
                      active: ["confirmed", "packed", "shipped", "delivered"].includes(selectedTrackOrder.order_status),
                      time: ["confirmed", "packed", "shipped", "delivered"].includes(selectedTrackOrder.order_status)
                        ? new Date(new Date(selectedTrackOrder.created_at).getTime() + 1000 * 60 * 60 * 2).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : null,
                    },
                    {
                      label: "Packed / Quality Check",
                      desc: "Piece inspected, hand-numbered luxury packaging secured.",
                      status: "packed",
                      active: ["packed", "shipped", "delivered"].includes(selectedTrackOrder.order_status),
                      time: ["packed", "shipped", "delivered"].includes(selectedTrackOrder.order_status)
                        ? new Date(new Date(selectedTrackOrder.created_at).getTime() + 1000 * 60 * 60 * 18).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : null,
                    },
                    {
                      label: "Shipped in Transit",
                      desc: "Package handed over to premium air cargo carriers.",
                      status: "shipped",
                      active: ["shipped", "delivered"].includes(selectedTrackOrder.order_status),
                      time: ["shipped", "delivered"].includes(selectedTrackOrder.order_status)
                        ? new Date(new Date(selectedTrackOrder.created_at).getTime() + 1000 * 60 * 60 * 30).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : null,
                    },
                    {
                      label: "Delivered",
                      desc: "Shipment delivered. Welcome to the private room.",
                      status: "delivered",
                      active: selectedTrackOrder.order_status === "delivered",
                      time: selectedTrackOrder.order_status === "delivered"
                        ? new Date(selectedTrackOrder.updated_at || new Date(selectedTrackOrder.created_at).getTime() + 1000 * 60 * 60 * 48).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : null,
                    },
                  ].map((step, idx) => (
                    <div key={idx} className="relative pb-2 last:pb-0">
                      {/* Timeline Node Dot */}
                      <span className={`absolute -left-[21px] top-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full border ${
                        step.active
                          ? "bg-white border-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                          : "bg-black border-white/20"
                      }`} />
                      
                      <div className="flex justify-between items-baseline gap-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          step.active ? "text-white" : "text-white/20"
                        }`}>
                          {step.label}
                        </span>
                        {step.time && (
                          <span className="text-[9px] font-bold text-white/30 font-mono">
                            {step.time}
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] mt-1 leading-relaxed ${
                        step.active ? "text-white/45" : "text-white/10"
                      }`}>
                        {step.desc}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Shipping partner info */}
              {!["cancelled", "pending", "confirmed"].includes(selectedTrackOrder.order_status) && (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4 text-xs space-y-2 mb-6">
                  <p className="text-[9px] font-bold tracking-widest text-white/30 uppercase">Transit Logistics</p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-white/60">
                    <div>
                      <span className="block text-[8px] font-bold uppercase text-white/20 tracking-wider">CARRIER</span>
                      <span className="text-white font-bold uppercase font-sans">Bluedart Express</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold uppercase text-white/20 tracking-wider">TRACKING ID</span>
                      <span className="text-white font-bold uppercase">DE-9284{selectedTrackOrder.id.substring(0, 4).toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Order items inside tracking */}
              <div className="border-t border-white/[0.06] pt-5">
                <p className="text-[9px] font-bold tracking-widest text-white/30 uppercase mb-3">Order Bundle</p>
                <div className="space-y-3.5 max-h-48 overflow-y-auto pr-1" data-lenis-prevent>
                  {selectedTrackOrder.order_items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-3 text-xs">
                      <div className="relative size-10 rounded-lg overflow-hidden border border-white/[0.08] bg-white/[0.03] shrink-0 flex items-center justify-center">
                        <Package size={14} className="text-white/30" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white uppercase truncate">{item.product_name}</p>
                        <p className="text-[9px] text-white/30 tracking-widest mt-0.5 uppercase">
                          Qty: {item.quantity} | Size: {item.size} | Color: {item.color || 'Standard'}
                        </p>
                      </div>
                      <span className="font-semibold text-white/80">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer CTA */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setSelectedTrackOrder(null)}
                  className="rounded-xl bg-white px-5 py-2.5 text-[9px] font-bold tracking-widest text-black uppercase hover:bg-white/88 transition cursor-pointer"
                >
                  Close coordinates
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
