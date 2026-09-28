"use client";

import { supabase } from "@/lib/supabase";
import { useUser, useSession } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("men");
  const [dob, setDob] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.replace("/auth");
      } else {
        const userEmail = user.primaryEmailAddress?.emailAddress || "";
        setEmail(userEmail);
        
        // Check if profile already exists in Supabase
        const checkExistingProfile = async () => {
          if (supabase) {
            try {
              const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("email", userEmail)
                .single();
                
              if (data && data.first_name) {
                // Profile already populated, skip onboarding
                router.replace("/dashboard");
              }
            } catch (err) {
              console.log("No existing profile found or mock mode is active:", err);
            }
          }
        };
        checkExistingProfile();
      }
    }
  }, [user, isLoaded, router]);

  async function handleOnboarding(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    if (!supabase) { setStatus("error"); setMessage("Service unavailable."); return; }
    if (fullName.trim().length < 2) { setStatus("error"); setMessage("Name must be at least 2 characters."); return; }
    if (!user) { setStatus("error"); setMessage("User session expired."); return; }
    
    setStatus("loading");
    setMessage("");

    try {
      const checkEmail = email.trim().toLowerCase();
      const firstName = fullName.trim().split(" ")[0];
      const lastName = fullName.trim().split(" ").slice(1).join(" ") || "";

      // 1. Check if profile already exists by email
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", checkEmail)
        .single();

      let dbError;
      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from("profiles")
          .update({
            clerk_user_id: user.id,
            first_name: firstName,
            last_name: lastName,
            phone: phone.trim(),
            gender: gender,
            dob: dob || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingProfile.id);
        dbError = error;
      } else {
        // Insert new profile
        const { error } = await supabase
          .from("profiles")
          .insert({
            clerk_user_id: user.id,
            email: checkEmail,
            first_name: firstName,
            last_name: lastName,
            phone: phone.trim(),
            gender: gender,
            dob: dob || null,
          });
        dbError = error;
      }

      if (dbError) {
        setStatus("error");
        setMessage(dbError.message || "Failed to update profile record in Supabase.");
        return;
      }

      // 2. Sync to local storage for frontend cache
      const profileData = {
        name: fullName.trim(),
        email: email,
        phone: phone.trim(),
        gender: gender,
        dob: dob,
      };
      localStorage.setItem("dripego-member-profile", JSON.stringify(profileData));

      setStatus("success");
      router.replace("/dashboard");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "An unexpected error occurred.");
    }
  }

  if (!isLoaded || status === "loading" && email === "") {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#060606] text-white">
        <Loader2 className="animate-spin text-white/50" size={24} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060606] px-4 py-12 sm:px-6 lg:px-8">
      {/* Background logo texture */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.015] pointer-events-none select-none">
        <div className="relative w-[80vw] h-[80vw] max-w-[800px] max-h-[800px]">
          <Image src="/logo/de.svg" alt="" fill />
        </div>
      </div>

      <motion.div
        className="w-full max-w-[420px] rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 backdrop-blur-md shadow-2xl"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative h-7 w-12 mb-6">
            <Image src="/logo/de.svg" alt="DRIPEGO" fill />
          </div>
          <h1 className="text-xl font-black uppercase tracking-wider text-white">Create Coordinate Registry</h1>
          <p className="mt-2 text-xs text-white/30">Set up your member credentials to access your private coordinates dashboard.</p>
        </div>

        <form onSubmit={handleOnboarding} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="block text-[10px] font-bold uppercase tracking-widest text-white/40">Full Name</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Arpan Munshi"
              required
              className="h-11 w-full rounded-[12px] border border-white/[0.08] bg-white/[0.04] px-4 text-[13px] text-white outline-none transition placeholder:text-white/20 focus:border-white/20"
            />
          </div>

          {/* Contact Phone */}
          <div className="space-y-1.5">
            <label htmlFor="phone" className="block text-[10px] font-bold uppercase tracking-widest text-white/40">Contact Phone</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              required
              className="h-11 w-full rounded-[12px] border border-white/[0.08] bg-white/[0.04] px-4 text-[13px] text-white outline-none transition placeholder:text-white/20 focus:border-white/20"
            />
          </div>

          {/* Silhouette Preference */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40">Silhouette Line</label>
            <div className="grid grid-cols-3 gap-2 rounded-[12px] border border-white/[0.08] bg-white/[0.03] p-1">
              {(["men", "women", "unisex"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`rounded-[9px] py-2 text-[10px] font-bold uppercase tracking-[0.1em] transition-all duration-200 ${
                    gender === g ? "bg-white text-black" : "text-white/30 hover:text-white/55"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Date of Birth */}
          <div className="space-y-1.5">
            <label htmlFor="dob" className="block text-[10px] font-bold uppercase tracking-widest text-white/40">Date of Birth</label>
            <input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
              className="h-11 w-full rounded-[12px] border border-white/[0.08] bg-white/[0.04] px-4 text-[13px] text-white outline-none transition uppercase tracking-wider focus:border-white/20"
            />
          </div>

          {message && (
            <p className="text-[11px] text-red-400/75" role="status">
              {message}
            </p>
          )}

          <motion.button
            type="submit"
            disabled={status === "loading"}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-white text-[11px] font-bold uppercase tracking-[0.1em] text-black transition hover:bg-white/88 disabled:opacity-50 mt-6"
            whileTap={{ scale: 0.98 }}
          >
            {status === "loading" ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <><User size={13} strokeWidth={2} /><span>Register Coordinates</span><ArrowRight size={12} /></>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
