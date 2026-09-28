import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Returns — DRIPEGO",
  description: "DRIPEGO Shipping, Delivery, and Return Policies.",
};

export default function ShippingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#080808] px-4 pb-24 pt-36 sm:px-6 lg:px-10 text-[#f0ede8]">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-[10px] font-semibold tracking-[0.5em] text-white/30 uppercase">
            Client Care
          </p>
          <h1 className="text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">
            Shipping &amp; Returns
          </h1>
          <p className="mt-4 text-xs font-medium tracking-widest text-white/40 uppercase">
            Drop 001 Logistics &amp; Exchange Protocols
          </p>

          <div className="mt-12 space-y-10 border-t border-white/[0.08] pt-10 text-xs leading-relaxed text-white/60">
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                1. Order Fulfillment
              </h2>
              <p className="mt-2">
                All Drop 001 pieces are packaged in custom matte archival packaging. Orders are dispatched within 24 to 48 hours of order confirmation. Express courier tracking will be transmitted via email upon dispatch.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                2. Domestic &amp; Global Delivery
              </h2>
              <p className="mt-2">
                Complimentary standard insured delivery is provided on all orders within India. Express domestic deliveries typically arrive within 2–4 business days. International delivery timelines vary by destination territory.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                3. Return &amp; Exchange Window
              </h2>
              <p className="mt-2">
                Due to the limited numbered nature of each drop, returns are accepted within 7 days of verified delivery. Garments must remain unworn, unwashed, and in original condition with all garment tags and packaging intact.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                4. Initiating an Exchange
              </h2>
              <p className="mt-2">
                To begin a return or exchange request, email our concierge team with your order number at{" "}
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
