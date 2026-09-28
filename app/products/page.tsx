import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductsContent from "@/components/ProductsContent";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Inventory — DRIPEGO",
  description: "Browse the complete inventory of premium streetwear.",
};

export default function ProductsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#080808] text-[#f0ede8] pt-32 pb-20 px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1400px]">
          <Suspense
            fallback={
              <div className="flex h-96 flex-col items-center justify-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white" />
                <p className="text-[10px] font-semibold tracking-widest text-white/30 uppercase animate-pulse">
                  Accessing Vault...
                </p>
              </div>
            }
          >
            <ProductsContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
