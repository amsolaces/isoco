import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — DRIPEGO",
  description: "DRIPEGO Terms and Conditions of Service.",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#080808] px-4 pb-24 pt-36 sm:px-6 lg:px-10 text-[#f0ede8]">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-[10px] font-semibold tracking-[0.5em] text-white/30 uppercase">
            Legal &amp; Compliance
          </p>
          <h1 className="text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-xs font-medium tracking-widest text-white/40 uppercase">
            Last Updated: 2026
          </p>

          <div className="mt-12 space-y-10 border-t border-white/[0.08] pt-10 text-xs leading-relaxed text-white/60">
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                1. Overview
              </h2>
              <p className="mt-2">
                By visiting our site and purchasing our products, you engage in our service and agree to be bound by these Terms of Service. DRIPEGO garments are produced in strictly limited quantities.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                2. Drop Allocations &amp; Orders
              </h2>
              <p className="mt-2">
                All orders are subject to stock availability and verification. Placing an item in your bag does not reserve the piece until checkout and payment confirmation are fully completed.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                3. Intellectual Property
              </h2>
              <p className="mt-2">
                All silhouettes, typography, graphic prints, campaign imagery, and branding are the exclusive intellectual property of DRIPEGO. Unauthorized reproduction or resale under false pretenses is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                4. Contact Information
              </h2>
              <p className="mt-2">
                Legal queries or notices may be directed to{" "}
                <a href="mailto:hello@dripego.com" className="text-white underline underline-offset-2">
                  hello@dripego.com
                </a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
