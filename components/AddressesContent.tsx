"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, Trash2, MapPin } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function AddressesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [addresses, setAddresses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);

  useEffect(() => {
    // Sync state from LocalStorage on mount
    const cachedAddresses = localStorage.getItem("dripego-member-addresses");
    let normalized: Record<string, any> = {};
    if (cachedAddresses) {
      try {
        normalized = JSON.parse(cachedAddresses);
      } catch (e) {
        console.error("Failed to parse addresses from cache:", e);
      }
    }

    // Get current profile to pre-fill name/phone if available
    const cachedProfile = localStorage.getItem("dripego-member-profile");
    let profileName = "";
    let profilePhone = "";
    if (cachedProfile) {
      try {
        const parsed = JSON.parse(cachedProfile);
        profileName = parsed.name || "";
        profilePhone = parsed.phone || "";
      } catch (e) {}
    }

    // Default home and work structure if missing or empty
    if (!normalized.home) {
      normalized.home = {
        label: "Home",
        fullName: profileName,
        phone: profilePhone,
        address: "",
        city: "",
        state: "",
        pincode: "",
      };
    } else if (!normalized.home.label) {
      normalized.home.label = "Home";
    }

    if (!normalized.work) {
      normalized.work = {
        label: "Work",
        fullName: profileName,
        phone: profilePhone,
        address: "",
        city: "",
        state: "",
        pincode: "",
      };
    } else if (!normalized.work.label) {
      normalized.work.label = "Work";
    }

    // Normalize other labels
    Object.keys(normalized).forEach((key) => {
      if (!normalized[key].label) {
        normalized[key].label = key.charAt(0).toUpperCase() + key.slice(1);
      }
    });

    const action = searchParams?.get("action");
    const edit = searchParams?.get("edit");

    if (action === "add") {
      const newKey = `custom_${Date.now()}`;
      normalized[newKey] = {
        label: "",
        fullName: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: ""
      };
      setActiveHighlight(newKey);
    } else if (edit) {
      setActiveHighlight(edit);
    }

    setAddresses(normalized);
    setLoading(false);
  }, [searchParams]);

  const updateAddressField = (key: string, field: string, value: string) => {
    setAddresses((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const handleAddNew = () => {
    const newKey = `custom_${Date.now()}`;
    setAddresses((prev) => ({
      ...prev,
      [newKey]: {
        label: "",
        fullName: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: ""
      }
    }));
    setActiveHighlight(newKey);
    setTimeout(() => {
      const element = document.getElementById(newKey);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleDelete = (key: string) => {
    const isCustom = key !== "home" && key !== "work";
    const label = addresses[key]?.label || key;
    const confirmed = confirm(`Are you sure you want to delete the ${label} coordinate?`);
    if (!confirmed) return;

    if (isCustom) {
      setAddresses((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    } else {
      setAddresses((prev) => ({
        ...prev,
        [key]: {
          label: key === "home" ? "Home" : "Work",
          fullName: "",
          phone: "",
          address: "",
          city: "",
          state: "",
          pincode: ""
        }
      }));
    }
  };

  const handleSaveAll = () => {
    // Validate inputs
    for (const key of Object.keys(addresses)) {
      const addr = addresses[key];
      const displayLabel = addr.label || (key === "home" ? "Home" : key === "work" ? "Work" : "Custom");
      
      // If address has any text in it, require complete fill
      const hasAnyField = addr.fullName || addr.phone || addr.address || addr.city || addr.state || addr.pincode;
      
      if (hasAnyField) {
        if (!addr.fullName || !addr.phone || !addr.address || !addr.city || !addr.pincode) {
          alert(`Please fill all fields for the ${displayLabel} coordinate.`);
          return;
        }
        if (key !== "home" && key !== "work" && !addr.label.trim()) {
          alert("Please provide a label name for your custom address.");
          return;
        }
      }
    }

    localStorage.setItem("dripego-member-addresses", JSON.stringify(addresses));
    alert("All shipping coordinates updated successfully.");
    router.push("/dashboard?tab=addresses");
  };

  if (loading) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white" />
        <p className="text-[10px] font-bold tracking-[0.4em] text-white/30 uppercase animate-pulse">
          Loading Registry...
        </p>
      </div>
    );
  }

  const addressKeys = Object.keys(addresses).sort((a, b) => {
    if (a === "home") return -1;
    if (b === "home") return 1;
    if (a === "work") return -1;
    if (b === "work") return 1;
    return 0;
  });

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-6">
        <div className="space-y-1">
          <Link
            href="/dashboard?tab=addresses"
            className="group inline-flex items-center gap-2 text-[10px] font-bold tracking-widest text-white/45 hover:text-white uppercase transition"
          >
            <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl mt-2">
            Shipping Coordinates
          </h2>
          <p className="text-[10px] text-white/30 tracking-wider uppercase font-medium">
            Registry / <span className="text-white">Coordinate Hub</span>
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="group flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-[10px] font-bold tracking-widest text-black uppercase transition hover:bg-white/90"
        >
          <Plus size={14} strokeWidth={2.4} />
          <span>Add Custom Coordinate</span>
        </button>
      </div>

      {/* Grid of Addresses */}
      <div className="grid gap-6 md:grid-cols-2">
        <AnimatePresence>
          {addressKeys.map((key) => {
            const addr = addresses[key];
            const isCustom = key !== "home" && key !== "work";
            const displayLabel = addr.label || (key === "home" ? "Home" : "Work");
            const isHighlighted = activeHighlight === key;

            return (
              <motion.div
                key={key}
                id={key}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`rounded-2xl border p-5 sm:p-6 space-y-5 transition-all duration-300 ${
                  isHighlighted
                    ? "border-green-500/40 bg-green-500/[0.02] shadow-[0_0_30px_rgba(34,197,94,0.03)]"
                    : "border-white/[0.08] bg-[#0c0c0c] hover:border-white/15"
                }`}
              >
                <div className="flex justify-between items-center border-b border-white/[0.05] pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className={isHighlighted ? "text-green-400" : "text-white/45"} />
                    <h3 className="text-xs font-black uppercase tracking-widest text-white">
                      {isCustom ? (addr.label ? `${addr.label} Coordinate` : "New Custom Coordinate") : `${displayLabel} Coordinate`}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(key)}
                    className="text-white/30 hover:text-red-400 transition"
                    title="Clear/Delete Coordinate"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {isCustom && (
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 block">
                        Coordinate Label *
                      </label>
                      <input
                        type="text"
                        required
                        value={addr.label}
                        onChange={(e) => updateAddressField(key, "label", e.target.value)}
                        placeholder="e.g. Office, Beach House, Gym"
                        className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 text-xs text-white outline-none transition focus:border-white/25 placeholder:text-white/20"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 block">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={addr.fullName}
                      onChange={(e) => updateAddressField(key, "fullName", e.target.value)}
                      placeholder="Recipient name"
                      className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 text-xs text-white outline-none transition focus:border-white/25 placeholder:text-white/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 block">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={addr.phone}
                      onChange={(e) => updateAddressField(key, "phone", e.target.value)}
                      placeholder="Contact number"
                      className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 text-xs text-white outline-none transition focus:border-white/25 placeholder:text-white/20"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 block">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={addr.address}
                      onChange={(e) => updateAddressField(key, "address", e.target.value)}
                      placeholder="Building, Street, Sector"
                      className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 text-xs text-white outline-none transition focus:border-white/25 placeholder:text-white/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 block">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={addr.city}
                      onChange={(e) => updateAddressField(key, "city", e.target.value)}
                      placeholder="City"
                      className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 text-xs text-white outline-none transition focus:border-white/25 placeholder:text-white/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 block">
                        State
                      </label>
                      <input
                        type="text"
                        value={addr.state}
                        onChange={(e) => updateAddressField(key, "state", e.target.value)}
                        placeholder="State"
                        className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 text-xs text-white outline-none transition focus:border-white/25 placeholder:text-white/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 block">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        required
                        value={addr.pincode}
                        onChange={(e) => updateAddressField(key, "pincode", e.target.value)}
                        placeholder="Pincode"
                        className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 text-xs text-white outline-none transition focus:border-white/25 placeholder:text-white/20"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer Save Button */}
      <div className="border-t border-white/[0.08] pt-6 flex flex-col sm:flex-row gap-3 justify-end">
        <Link
          href="/dashboard?tab=addresses"
          className="flex h-11 items-center justify-center rounded-xl border border-white/10 bg-transparent px-6 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/[0.02] transition"
        >
          Discard Changes
        </Link>
        <button
          onClick={handleSaveAll}
          className="flex h-11 items-center justify-center rounded-xl bg-white px-8 text-[10px] font-bold uppercase tracking-widest text-black transition hover:bg-white/90"
        >
          Save All Coordinates
        </button>
      </div>
    </div>
  );
}
