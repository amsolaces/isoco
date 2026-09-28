"use client";

import ProductForm from "@/components/admin/ProductForm";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || !supabase) return;

    async function loadProduct() {
      try {
        const { data, error: fetchError } = await supabase!
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchError) throw fetchError;
        if (!data) {
          setError("Product not found.");
          return;
        }

        setProduct(data);
      } catch (err: any) {
        console.error("Error loading product detail:", err);
        setError(err.message || "Failed to load product details.");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin text-white/40 mb-3" size={24} />
        <p className="text-[10px] tracking-[0.2em] text-white/30 uppercase">
          Loading catalog specifications...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-10 text-center">
        <p className="text-sm text-red-400 font-semibold">{error || "Product not found."}</p>
        <button
          onClick={() => router.push("/admin/products")}
          className="mt-4 inline-flex h-9 items-center rounded-xl bg-white px-5 text-[10px] font-bold uppercase tracking-wider text-black hover:bg-white/80"
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white">Edit Product</h1>
        <p className="text-xs text-white/45">Modify product properties and catalog parameters.</p>
      </div>
      <ProductForm initialData={product} productId={id} />
    </div>
  );
}
