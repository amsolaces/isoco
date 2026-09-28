"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "@clerk/nextjs";

interface DripegoLoaderProps {
  isTransition?: boolean;
}

export default function DripegoLoader({ isTransition = false }: DripegoLoaderProps) {
  const session = useSession();
  const [isReady, setIsReady] = useState(false);
  const [isMounted, setIsMounted] = useState(true);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  // Scroll locking for initial load
  useEffect(() => {
    if (!isTransition && isMounted) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      if (!isTransition) {
        document.body.style.overflow = "";
      }
    };
  }, [isTransition, isMounted]);

  // Readiness detection for initial load
  useEffect(() => {
    if (isTransition) return;

    let checkInterval: NodeJS.Timeout;
    let isDone = false;

    const checkReadiness = () => {
      if (isDone) return;

      const windowLoaded = typeof window !== "undefined" && document.readyState === "complete";
      const clerkLoaded = session?.isLoaded ?? true;

      if (windowLoaded && clerkLoaded) {
        isDone = true;
        setIsReady(true);
        clearInterval(checkInterval);
      }
    };

    checkReadiness();

    if (!isDone) {
      if (typeof window !== "undefined") {
        window.addEventListener("load", checkReadiness);
      }
      checkInterval = setInterval(checkReadiness, 100);
    }

    // Safety fallback timeout: Loader must never get permanently stuck
    const fallbackTimer = setTimeout(() => {
      if (!isDone) {
        console.warn("[DripegoLoader] Safety fallback triggered.");
        isDone = true;
        setIsReady(true);
        clearInterval(checkInterval);
      }
    }, 4500); // 4.5 seconds fallback

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("load", checkReadiness);
      }
      clearInterval(checkInterval);
      clearTimeout(fallbackTimer);
    };
  }, [session, isTransition]);

  // Trigger exit animation sequence
  useEffect(() => {
    if (isReady && !isTransition) {
      setIsAnimatingOut(true);
      const exitTimer = setTimeout(() => {
        setIsMounted(false);
        document.body.style.overflow = "";
      }, 700); // Duration matches the transition-all 700ms below
      return () => clearTimeout(exitTimer);
    }
  }, [isReady, isTransition]);

  if (!isMounted && !isTransition) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#050505] text-[#ede9e3] transition-all duration-700 ease-out select-none pointer-events-auto ${
        isAnimatingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center">
        {/* DRIPEGO Logo */}
        <div className="relative w-[90px] h-[45px] sm:w-[130px] sm:h-[65px] dripego-logo-animate">
          <Image
            src="/logo/de.svg"
            alt="DRIPEGO Logo"
            fill
            priority
            className="object-contain"
          />
        </div>

        {/* DRIPEGO spaced lettering */}
        <div className="mt-6 text-[11px] sm:text-[13px] font-light tracking-[0.8em] text-white uppercase select-none pl-[0.8em]">
          Dripego
        </div>

        {/* Loading segment indicator */}
        <div className="relative mt-8 h-[1px] w-[240px] sm:w-[320px] overflow-hidden bg-white/10">
          <div className="absolute top-0 bottom-0 w-1/3 bg-white dripego-travel-animate" />
        </div>
      </div>
    </div>
  );
}
