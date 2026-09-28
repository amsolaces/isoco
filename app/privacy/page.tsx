import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — DRIPEGO",
  description: "DRIPEGO Privacy Policy and Data Handling.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#080808] px-4 pb-24 pt-36 sm:px-6 lg:px-10 text-[#f0ede8]">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-[10px] font-semibold tracking-[0.5em] text-white/30 uppercase">
            Legal &amp; Compliance
          </p>
          <h1 className="text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-xs font-medium tracking-widest text-white/40 uppercase">
            Effective Date: Drop 001 Release — 2026
          </p>

          <div className="mt-12 space-y-10 border-t border-white/[0.08] pt-10 text-xs leading-relaxed text-white/60">
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                1. Data We Collect
              </h2>
              <p className="mt-2">
                DRIPEGO collects minimal operational data necessary to fulfill orders and communicate waitlist updates. This includes your name, email address, delivery shipping address, and order transaction history. Payment card details are processed directly through encrypted payment infrastructure and are never stored on our servers.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                2. Use of Information
              </h2>
              <p className="mt-2">
                We use collected information solely to process orders, verify deliveries, notify members of drop schedules, and provide client care. We do not sell, rent, or lease customer data to third-party brokers.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                3. Cookies and Session Storage
              </h2>
              <p className="mt-2">
                We use essential session tokens to manage authentication and preserve shopping bag items across visits.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                4. Client Inquiries
              </h2>
              <p className="mt-2">
                For any questions regarding personal data or account erasure, contact concierge at{" "}
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
