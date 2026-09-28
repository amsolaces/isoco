import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AddressesContent from "@/components/AddressesContent";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Shipping Coordinates — DRIPEGO",
  description: "Manage your registered shipping coordinates, home, work, and custom locations.",
};

export default function AddressesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#060606] text-[#ede9e3] pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1400px]">
          <Suspense
            fallback={
              <div className="flex h-[500px] flex-col items-center justify-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white" />
                <p className="text-[10px] font-bold tracking-[0.4em] text-white/30 uppercase animate-pulse">
                  Entering Registry...
                </p>
              </div>
            }
          >
            <AddressesContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
