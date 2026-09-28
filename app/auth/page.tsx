"use client";

import { supabase } from "@/lib/supabase";
import { useSignIn, useSignUp, useClerk } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const clerk = useClerk();
  const { signIn: signInRaw } = useSignIn();
  const { signUp: signUpRaw } = useSignUp();
  const signIn = signInRaw as any;
  const signUp = signUpRaw as any;
  const { setActive } = clerk;

  const [step, setStep] = useState<"email" | "otp">("email");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signInMethod, setSignInMethod] = useState<"otp" | "password">("otp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    if (searchParams.get("error")) {
      setStatus("error");
      setMessage("Authentication failed. Please try again.");
    }
  }, [searchParams]);

  // Handle Clerk error mapping
  function handleClerkError(err: any) {
    console.error("Clerk auth error:", err);
    setStatus("error");
    if (err && err.errors && err.errors.length > 0) {
      const firstError = err.errors[0];
      if (firstError.code === "form_identifier_exists") {
        setMessage("This email is already registered. Please sign in instead.");
      } else if (firstError.code === "form_identifier_not_found" || firstError.code === "strategy_not_supported") {
        setMessage("Account not found. Please sign up first.");
      } else if (firstError.code === "form_code_incorrect") {
        setMessage("The verification code is incorrect. Please try again.");
      } else if (firstError.code === "form_password_incorrect") {
        setMessage("Incorrect password. Please try again.");
      } else {
        setMessage(firstError.longMessage || firstError.message || "An error occurred during authentication.");
      }
    } else {
      setMessage(err.message || "An unexpected authentication error occurred.");
    }
  }

  async function handleSendOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    if (!clerk.client) {
      setStatus("error");
      setMessage("Clerk auth client is loading...");
      return;
    }
    if (!emailPattern.test(email)) {
      setStatus("error");
      setMessage("Enter a valid email.");
      return;
    }
    
    console.log("Active Publishable Key:", process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
    setStatus("loading");
    setMessage("");
    
    try {
      if (mode === "signin") {
        // Start Clerk Sign-In
        await clerk.client.signIn.create({ identifier: email });
        const firstFactor = clerk.client.signIn.supportedFirstFactors?.find(
          (f: any) => f.strategy === "email_code"
        );
        if (!firstFactor) {
          throw new Error("Email OTP code is not enabled in Clerk dashboard. Please enable it.");
        }
        await clerk.client.signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: (firstFactor as any).emailAddressId,
        });
      } else {
        // Start Clerk Sign-Up
        // Generate a secure random password under-the-hood to satisfy dashboard requirements
        const randomPassword = Math.random().toString(36).slice(-10) + 
                               Math.random().toString(36).toUpperCase().slice(-10) + 
                               "!" + Math.floor(Math.random() * 100);
        await clerk.client.signUp.create({ 
          emailAddress: email,
          password: randomPassword,
        });
        await clerk.client.signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      }
      
      setStep("otp");
      setStatus("success");
      setCooldown(60);
      setMessage("A 6-digit verification code has been sent to your email.");
    } catch (err: any) {
      handleClerkError(err);
    }
  }

  async function handleVerifyOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    if (!clerk.client) return;
    if (otpCode.length < 6) {
      setStatus("error");
      setMessage("Please enter the 6-digit code.");
      return;
    }
    
    setStatus("loading");
    setMessage("");

    try {
      let completeSignUpOrIn;
      if (mode === "signin") {
        completeSignUpOrIn = await clerk.client.signIn.attemptFirstFactor({
          strategy: "email_code",
          code: otpCode,
        });
      } else {
        completeSignUpOrIn = await clerk.client.signUp.attemptEmailAddressVerification({
          code: otpCode,
        });
      }

      if (completeSignUpOrIn.status === "complete") {
        const clerkUserId = completeSignUpOrIn.createdSessionId; // Session ID (or user ID, let's use active session)
        await setActive({ session: completeSignUpOrIn.createdSessionId });

        // Retrieve real user ID from Clerk
        const clerkUser = mode === "signin" ? clerk.client.signIn.userData : clerk.client.signUp.createdUserId; 
        const actualClerkUserId = completeSignUpOrIn.status === "complete" && mode === "signin" 
          ? clerk.client.signIn.createdSessionId // Clerk handles active session mapping
          : clerk.client.signUp.createdUserId;

        // Check if profile exists in Supabase database
        if (supabase) {
          const checkEmail = email.trim().toLowerCase();
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("email", checkEmail)
            .single();

          if (profileData && profileData.first_name) {
            // Already has profile, sync local cache and redirect to dashboard
            const localProfile = {
              name: `${profileData.first_name} ${profileData.last_name || ""}`.trim(),
              email: profileData.email,
              phone: profileData.phone || "",
              gender: profileData.gender || "men",
              dob: profileData.dob || "",
            };
            localStorage.setItem("dripego-member-profile", JSON.stringify(localProfile));
            router.replace("/dashboard");
          } else {
            // New user, redirect to onboarding to fill profile
            router.replace("/auth/onboarding");
          }
        } else {
          router.replace("/auth/onboarding");
        }
      } else {
        console.log("Clerk authentication incomplete details:", {
          status: completeSignUpOrIn.status,
          missingFields: (completeSignUpOrIn as any).missingFields?.join(", ") || "none",
          unverifiedFields: (completeSignUpOrIn as any).unverifiedFields?.join(", ") || "none",
          requiredFields: (completeSignUpOrIn as any).requiredFields?.join(", ") || "none",
        });
        throw new Error(`Authentication incomplete. Status: ${completeSignUpOrIn.status}`);
      }
    } catch (err: any) {
      handleClerkError(err);
    }
  }

  async function handleResendCode() {
    if (cooldown > 0 || status === "loading") return;
    if (!clerk.client) return;
    setStatus("loading");
    setMessage("");
    try {
      if (mode === "signin") {
        const firstFactor = clerk.client.signIn.supportedFirstFactors?.find(
          (f: any) => f.strategy === "email_code"
        );
        if (!firstFactor) {
          throw new Error("Email OTP code is not enabled in Clerk dashboard. Please enable it.");
        }
        await clerk.client.signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: (firstFactor as any).emailAddressId,
        });
      } else {
        await clerk.client.signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      }
      setCooldown(60);
      setStatus("success");
      setMessage("A new verification code has been sent.");
    } catch (err: any) {
      handleClerkError(err);
    }
  }

  async function handlePasswordSignIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    if (!clerk.client) return;
    if (!emailPattern.test(email)) {
      setStatus("error");
      setMessage("Enter a valid email.");
      return;
    }
    if (password.length < 6) {
      setStatus("error");
      setMessage("Password must be at least 6 characters.");
      return;
    }
    
    setStatus("loading");
    setMessage("");

    try {
      const result = await clerk.client.signIn.create({
        identifier: email,
        password: password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });

        if (supabase) {
          const checkEmail = email.trim().toLowerCase();
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("email", checkEmail)
            .single();

          if (profileData && profileData.first_name) {
            const localProfile = {
              name: `${profileData.first_name} ${profileData.last_name || ""}`.trim(),
              email: profileData.email,
              phone: profileData.phone || "",
              gender: profileData.gender || "men",
              dob: profileData.dob || "",
            };
            localStorage.setItem("dripego-member-profile", JSON.stringify(localProfile));
            router.replace("/dashboard");
          } else {
            router.replace("/auth/onboarding");
          }
        } else {
          router.replace("/dashboard");
        }
      } else {
        throw new Error(`Authentication incomplete. Status: ${result.status}`);
      }
    } catch (err: any) {
      handleClerkError(err);
    }
  }

  async function handleGoogle() {
    if (!clerk.client) return;
    setStatus("loading");
    try {
      await clerk.client.signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/auth/callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: any) {
      handleClerkError(err);
    }
  }

  function handleBackToEmail() {
    setStep("email");
    setOtpCode("");
    setStatus("idle");
    setMessage("");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#060606]">

      {/* LEFT — full bleed image, no padding */}
      <div className="relative hidden lg:block lg:w-1/2">
        <Image
          src="/models/hero_model.png"
          alt="DRIPEGO campaign"
          fill
          unoptimized
          priority
          sizes="50vw"
          className="object-cover object-top"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#060606]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060606]/70 via-transparent to-transparent" />

        {/* Logo top-left */}
        <div className="absolute left-8 top-8 z-10">
          <Link href="/" className="relative block h-9 w-16">
            <Image src="/logo/de.svg" alt="DRIPEGO" fill />
          </Link>
        </div>

        {/* Brand copy bottom-left */}
        <div className="absolute bottom-10 left-8 z-10">
          <p className="mb-2 text-[10px] font-semibold tracking-[0.5em] text-white/30 uppercase">Drop 001</p>
          <h2 className="text-5xl font-black uppercase leading-none tracking-tight text-white">
            Own The<br />Room.
          </h2>
          <p className="mt-3 text-[13px] leading-6 text-white/35">
            For those who stopped asking for permission.
          </p>
        </div>
      </div>

      {/* RIGHT — form panel, no excess padding */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Mobile logo */}
        <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5 lg:hidden">
          <Link href="/" className="relative block h-8 w-14">
            <Image src="/logo/de.svg" alt="DRIPEGO" fill />
          </Link>
          <Link href="/" className="text-[10px] font-semibold tracking-[0.2em] text-white/30 uppercase hover:text-white/60">
            ← Back
          </Link>
        </div>

        {/* Desktop back link */}
        <div className="hidden items-center justify-end border-b border-white/[0.07] px-8 py-5 lg:flex">
          <Link href="/" className="text-[10px] font-semibold tracking-[0.2em] text-white/30 uppercase hover:text-white/60">
            ← Back to site
          </Link>
        </div>

        {/* Form — centered in remaining space */}
        <div className="flex flex-1 items-center justify-center px-6 py-8 sm:px-10">
          <motion.div
            className="w-full max-w-[380px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Tab switcher */}
            {step === "email" && (
              <div className="mb-5 flex rounded-[12px] border border-white/[0.08] bg-white/[0.03] p-1">
                {(["signin", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    suppressHydrationWarning
                    onClick={() => {
                      setMode(m);
                      setMessage("");
                      setStatus("idle");
                      if (m === "signup") {
                        setSignInMethod("otp");
                      }
                    }}
                    className={`flex-1 rounded-[9px] py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] transition-all duration-200 ${
                      mode === m ? "bg-white text-black" : "text-white/30 hover:text-white/55"
                    }`}
                  >
                    {m === "signin" ? "Sign In" : "Sign Up"}
                  </button>
                ))}
              </div>
            )}

            {/* Sign in method switcher (OTP vs Password) */}
            {mode === "signin" && step === "email" && (
              <div className="mb-6 flex rounded-[12px] border border-white/[0.08] bg-white/[0.03] p-1">
                {(["otp", "password"] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => { setSignInMethod(method); setMessage(""); setStatus("idle"); }}
                    className={`flex-1 rounded-[9px] py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] transition-all duration-200 ${
                      signInMethod === method ? "bg-white/10 text-white" : "text-white/30 hover:text-white/55"
                    }`}
                  >
                    {method === "otp" ? "Use OTP" : "Use Password"}
                  </button>
                ))}
              </div>
            )}

            <h1 className="mb-1 text-2xl font-black uppercase tracking-tight text-white">
              {step === "email" 
                ? (mode === "signin" ? "Welcome back." : "Join the room.")
                : "Verify Coordinate."}
            </h1>
            <p className="mb-6 text-[12px] text-white/30">
              {step === "email"
                ? (mode === "signin" ? "Sign in to your DRIPEGO account." : "Get early access to Drop 001.")
                : `Enter the 6-digit code sent to ${email}`}
            </p>

            {/* Google */}
            {step === "email" && (
              <>
                <button
                  suppressHydrationWarning
                  onClick={handleGoogle}
                  disabled={status === "loading"}
                  className="mb-3 flex h-11 w-full items-center justify-center gap-3 rounded-[12px] border border-white/[0.1] bg-white/[0.04] text-[12px] font-semibold text-white/65 transition hover:bg-white/[0.09] hover:text-white disabled:opacity-50"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                {/* Divider */}
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/[0.07]" />
                  <span className="text-[10px] font-medium tracking-[0.2em] text-white/18 uppercase">or</span>
                  <div className="h-px flex-1 bg-white/[0.07]" />
                </div>
              </>
            )}

            {/* Form switcher (OTP vs Password) */}
            {step === "email" ? (
              signInMethod === "password" && mode === "signin" ? (
                <form onSubmit={handlePasswordSignIn} className="space-y-2.5">
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    suppressHydrationWarning
                    autoComplete="email"
                    required
                    className="h-11 w-full rounded-[12px] border border-white/[0.08] bg-white/[0.04] px-4 text-[13px] text-white outline-none transition placeholder:text-white/22 focus:border-white/20"
                  />
                  <input
                    id="auth-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    suppressHydrationWarning
                    autoComplete="current-password"
                    required
                    className="h-11 w-full rounded-[12px] border border-white/[0.08] bg-white/[0.04] px-4 text-[13px] text-white outline-none transition placeholder:text-white/22 focus:border-white/20"
                  />

                  {message && (
                    <p className={`text-[11px] ${status === "success" ? "text-white/55" : "text-red-400/75"}`} role="status">
                      {message}
                    </p>
                  )}

                  <motion.button
                    type="submit"
                    disabled={status === "loading"}
                    suppressHydrationWarning
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-white text-[11px] font-bold uppercase tracking-[0.1em] text-black transition hover:bg-white/88 disabled:opacity-50"
                    whileTap={{ scale: 0.98 }}
                  >
                    {status === "loading" ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <><Mail size={13} strokeWidth={2} /><span>Sign In with Password</span></>
                    )}
                  </motion.button>
                </form>
              ) : (
                <form onSubmit={handleSendOtp} className="space-y-2.5">
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    suppressHydrationWarning
                    autoComplete="email"
                    required
                    className="h-11 w-full rounded-[12px] border border-white/[0.08] bg-white/[0.04] px-4 text-[13px] text-white outline-none transition placeholder:text-white/22 focus:border-white/20"
                  />

                  {message && (
                    <p className={`text-[11px] ${status === "success" ? "text-white/55" : "text-red-400/75"}`} role="status">
                      {message}
                    </p>
                  )}

                  <motion.button
                    type="submit"
                    disabled={status === "loading"}
                    suppressHydrationWarning
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-white text-[11px] font-bold uppercase tracking-[0.1em] text-black transition hover:bg-white/88 disabled:opacity-50"
                    whileTap={{ scale: 0.98 }}
                  >
                    {status === "loading" ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <><Mail size={13} strokeWidth={2} /><span>Send Verification Code</span></>
                    )}
                  </motion.button>
                </form>
              )
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-2.5">
                <input
                  id="auth-otp"
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="6-digit OTP code"
                  suppressHydrationWarning
                  autoComplete="one-time-code"
                  required
                  className="h-11 w-full rounded-[12px] border border-white/[0.08] bg-white/[0.04] px-4 text-[13px] text-white tracking-[0.3em] text-center outline-none transition placeholder:text-white/22 placeholder:tracking-normal focus:border-white/20"
                />

                {message && (
                  <p className={`text-[11px] ${status === "success" ? "text-green-400/85" : "text-red-400/75"}`} role="status">
                    {message}
                  </p>
                )}

                <motion.button
                  type="submit"
                  disabled={status === "loading"}
                  suppressHydrationWarning
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-white text-[11px] font-bold uppercase tracking-[0.1em] text-black transition hover:bg-white/88 disabled:opacity-50"
                  whileTap={{ scale: 0.98 }}
                >
                  {status === "loading" ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <><ArrowRight size={13} strokeWidth={2.2} /><span>Verify & Sign In</span></>
                  )}
                </motion.button>

                <div className="flex flex-col gap-2 mt-4 text-center">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={cooldown > 0 || status === "loading"}
                    className="text-[10px] font-bold tracking-widest text-white/35 hover:text-white uppercase transition disabled:opacity-40 cursor-pointer"
                  >
                    {cooldown > 0 ? `Resend Code in ${cooldown}s` : "Resend Code"}
                  </button>
                  <button
                    type="button"
                    onClick={handleBackToEmail}
                    className="text-[10px] font-bold tracking-widest text-white/35 hover:text-white uppercase transition cursor-pointer"
                  >
                    Change Email / Back
                  </button>
                </div>
              </form>
            )}

            <p className="mt-6 text-center text-[10px] leading-5 text-white/18">
              By continuing you agree to our{" "}
              <Link href="/terms" className="underline underline-offset-2 hover:text-white/45">Terms</Link>
              {" "}&amp;{" "}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-white/45">Privacy Policy</Link>.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
