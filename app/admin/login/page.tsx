"use client";

import { supabase } from "@/lib/supabase";
import { useAdminStore } from "@/lib/adminStore";
import { useSignIn, useUser, useClerk } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const { setUser, setRole } = useAdminStore();
  
  const clerk = useClerk();
  const { signIn } = useSignIn();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut, setActive } = clerk;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // If Clerk user is loaded and exists, check if they are admin
    if (clerkLoaded && clerkUser) {
      const checkAdmin = async () => {
        const userEmail = clerkUser.primaryEmailAddress?.emailAddress || "";
        if (supabase) {
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("id")
              .eq("email", userEmail)
              .single();

            if (profile) {
              const { data: roleData } = await supabase
                .from("user_roles")
                .select("role")
                .eq("id", profile.id)
                .single();

              if (roleData && (roleData.role === "admin" || roleData.role === "super_admin")) {
                setUser({ email: userEmail });
                setRole(roleData.role);
                router.replace("/admin");
                return;
              }
            }
          } catch (e) {
            console.error("Error verifying admin role:", e);
          }
        }
        
        // Signed in under Clerk but not an admin, sign out immediately
        await signOut();
        setStatus("error");
        setMessage("Access denied. Admin privileges required.");
      };
      checkAdmin();
    }
  }, [clerkUser, clerkLoaded, router, setUser, setRole, signOut]);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    if (!clerk.client) {
      setStatus("error");
      setMessage("Clerk auth client is loading...");
      return;
    }

    const normEmail = email.trim().toLowerCase();
    if (!normEmail || password.length < 6) {
      setStatus("error");
      setMessage("Please fill out correct credentials.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      // 1. Authenticate with Clerk via password
      const result = await clerk.client.signIn.create({
        identifier: normEmail,
        password,
      }) as any;

      if (result.status === "complete") {
        // Resolve profile & role from database BEFORE setting session active
        if (supabase) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", normEmail)
            .single();

          if (!profile) {
            throw new Error("Administrator profile not configured in database.");
          }

          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("id", profile.id)
            .single();

          if (!roleData || (roleData.role !== "admin" && roleData.role !== "super_admin")) {
            throw new Error("Access denied. Admin privileges required.");
          }

          // Active session
          await setActive({ session: result.createdSessionId });
          setUser({ email: normEmail });
          setRole(roleData.role);
          setStatus("success");
          setMessage("Welcome. Access granted.");
          router.replace("/admin");
        } else {
          throw new Error("Database server is currently offline.");
        }
      } else {
        throw new Error(`Authentication incomplete. Status: ${result.status}`);
      }
    } catch (err: any) {
      console.error("Admin sign in failed:", err);
      setStatus("error");
      if (err.errors && err.errors.length > 0) {
        setMessage(err.errors[0].longMessage || err.errors[0].message);
      } else {
        setMessage(err.message || "Authentication failed.");
      }
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-[#060606] px-6">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.015)_0%,transparent_60%)]" />

      <motion.div
        className="relative z-10 w-full max-w-[400px] rounded-[24px] border border-white/[0.06] bg-[#0c0c0c] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-8 flex flex-col items-center">
          <p className="mb-2 text-[10px] font-semibold tracking-[0.5em] text-white/30 uppercase">
            Administrative
          </p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">
            DRIPEGO
          </h1>
          <p className="mt-1.5 text-xs text-white/40">Enter control panel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="sr-only" htmlFor="admin-email">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-white/20" size={16} />
              <input
                id="admin-email"
                type="email"
                placeholder="ADMIN EMAIL ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 w-full rounded-[16px] border border-white/[0.06] bg-white/[0.03] pl-11 pr-5 text-xs tracking-[0.08em] text-white outline-none transition placeholder:text-white/20 focus:border-white/18"
              />
            </div>
          </div>

          <div>
            <label className="sr-only" htmlFor="admin-password">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-white/20" size={16} />
              <input
                id="admin-password"
                type="password"
                placeholder="PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 w-full rounded-[16px] border border-white/[0.06] bg-white/[0.03] pl-11 pr-5 text-xs tracking-[0.08em] text-white outline-none transition placeholder:text-white/20 focus:border-white/18"
              />
            </div>
          </div>

          {message && (
            <p
              className={`text-center text-xs tracking-wide ${
                status === "success" ? "text-white/60" : "text-red-400/80"
              }`}
              role="status"
            >
              {message}
            </p>
          )}

          <motion.button
            type="submit"
            disabled={status === "loading"}
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-[16px] bg-white text-[11px] font-bold uppercase tracking-[0.12em] text-black transition hover:bg-white/88 disabled:opacity-50 cursor-pointer"
            whileTap={{ scale: 0.98 }}
          >
            {status === "loading" ? (
              <Loader2 className="animate-spin" size={15} />
            ) : (
              <>
                <span>Authenticate</span>
                <ArrowRight size={13} strokeWidth={2.2} />
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
