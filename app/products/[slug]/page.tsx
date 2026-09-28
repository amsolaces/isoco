import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProductDetailsClient from "@/components/ProductDetailsClient";
import { supabase } from "@/lib/supabase";
import { Metadata } from "next";
import { notFound } from "next/navigation";

const mockProductsDetail = [
  {
    id: 1,
    name: "DROP 001 STATEMENT TEE",
    slug: "statement-tee",
    price: 9600.00,
    compare_price: 12000.00,
    description: "Constructed from 300 GSM custom heavyweight cotton jersey. Structured drop-shoulder silhouette, thick ribbed mock collar, and high-density screenprint across the chest. Built to maintain its drape and shape through extensive wear.",
    short_description: "300 GSM heavyweight cotton statement tee.",
    thumbnail: "/products/tee_front.webp",
    images: ["/products/tee_front.webp", "/products/tee_back.webp", "/products/tee_folded.webp"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Washed Obsidian", "Bone White"],
    material: "100% Combed Heavyweight Cotton (300 GSM)",
    weight: 0.35,
    stock_quantity: 12,
    collection: "Drop 001",
    gender: "unisex",
  },
  {
    id: 2,
    name: "DROP 001 SIGNATURE BACK TEE",
    slug: "signature-back-tee",
    price: 9600.00,
    compare_price: 12000.00,
    description: "Constructed from 300 GSM custom heavyweight cotton jersey. Features a clean architectural front panel and our signature Drop 001 campaign typography screenprint across the back yoke. Double-needle hem and structured drop shoulders.",
    short_description: "300 GSM heavyweight back graphic tee.",
    thumbnail: "/products/tee_back.webp",
    images: ["/products/tee_back.webp", "/products/tee_front.webp", "/products/tee_folded.webp"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Washed Obsidian"],
    material: "100% Combed Heavyweight Cotton (300 GSM)",
    weight: 0.35,
    stock_quantity: 10,
    collection: "Drop 001",
    gender: "unisex",
  },
  {
    id: 3,
    name: "STUDIO FOLD MINIMAL TEE",
    slug: "studio-fold-minimal-tee",
    price: 9600.00,
    compare_price: null,
    description: "Pure form and minimal detailing. Engineered from 300 GSM loopback heavyweight cotton with precision panel construction and blind-stitched hemline. Subtle tonal branding for quiet presence.",
    short_description: "Structured 300 GSM minimal panel tee.",
    thumbnail: "/products/tee_folded.webp",
    images: ["/products/tee_folded.webp", "/products/tee_front.webp", "/products/tee_hanging.webp"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Washed Obsidian", "Bone White"],
    material: "100% Combed Heavyweight Cotton (300 GSM)",
    weight: 0.35,
    stock_quantity: 8,
    collection: "Drop 001",
    gender: "men",
  },
  {
    id: 4,
    name: "CAMPAIGN EXCLUSIVE HANG TEE",
    slug: "campaign-exclusive-hang-tee",
    price: 9600.00,
    compare_price: 12000.00,
    description: "Drop 001 studio campaign edition. Individual garment wash with subtle enzyme softening, preserving structural weight. Features custom neck tape and internal collection numbering.",
    short_description: "Drop 001 studio campaign exclusive tee.",
    thumbnail: "/products/tee_hanging.webp",
    images: ["/products/tee_hanging.webp", "/products/tee_front.webp", "/products/tee_back.webp"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Washed Obsidian"],
    material: "100% Combed Heavyweight Cotton (300 GSM)",
    weight: 0.35,
    stock_quantity: 6,
    collection: "Drop 001",
    gender: "unisex",
  },
  {
    id: 5,
    name: "ARCHIVE FOLD SILHOUETTE TEE",
    slug: "archive-fold-silhouette-tee",
    price: 9600.00,
    compare_price: null,
    description: "Archive cut tailored with a relaxed boxy fit. Heavyweight rib collar and reinforced shoulder line engineered to hold crisp presence across daily rotation.",
    short_description: "Relaxed boxy silhouette heavyweight tee.",
    thumbnail: "/products/tee_folded.webp",
    images: ["/products/tee_folded.webp", "/products/tee_hanging.webp"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Washed Obsidian"],
    material: "100% Combed Heavyweight Cotton (300 GSM)",
    weight: 0.35,
    stock_quantity: 15,
    collection: "Drop 001",
    gender: "men",
  },
  {
    id: 6,
    name: "ESSENTIAL HEAVYWEIGHT TEE",
    slug: "essential-heavyweight-tee",
    price: 9600.00,
    compare_price: 12000.00,
    description: "The core foundational piece of Drop 001. Minimal branding, relaxed drape, and tactile 300 GSM cotton body.",
    short_description: "Foundational 300 GSM heavy cotton tee.",
    thumbnail: "/products/tee_front.webp",
    images: ["/products/tee_front.webp", "/products/tee_back.webp"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Washed Obsidian", "Bone White"],
    material: "100% Combed Heavyweight Cotton (300 GSM)",
    weight: 0.35,
    stock_quantity: 7,
    collection: "Drop 001",
    gender: "women",
  },
];

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  let product = null;

  if (supabase) {
    try {
      const { data } = await supabase
        .from("products")
        .select("name, description, thumbnail")
        .eq("slug", slug)
        .single();
      product = data;
    } catch (e) {
      console.error("Metadata fetch error:", e);
    }
  }

  if (!product) {
    product = mockProductsDetail.find((p) => p.slug === slug);
  }

  if (!product) {
    return {
      title: "Product Not Found — DRIPEGO",
    };
  }

  return {
    title: `${product.name} — DRIPEGO`,
    description: product.description || "Luxury fashion streetwear.",
    openGraph: {
      title: `${product.name} — DRIPEGO`,
      description: product.description || "Luxury fashion streetwear.",
      images: [
        {
          url: product.thumbnail || "/models/hero_model.webp",
        },
      ],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  let product = null;
  let error = null;

  if (supabase) {
    try {
      const { data, error: err } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();
      product = data;
      error = err;
    } catch (e) {
      console.error("Product detail fetch error:", e);
    }
  }

  if (!product) {
    // Fallback to mock product
    const mock = mockProductsDetail.find((p) => p.slug === slug);
    if (mock) {
      product = mock;
    } else {
      return notFound();
    }
  }

  // Fetch related products (same category or collection, limit 4)
  let relatedProducts: any[] = [];
  if (supabase && product.id) {
    try {
      const { data: related } = await supabase
        .from("products")
        .select("*")
        .eq("status", "published")
        .neq("id", product.id)
        .or(`category_id.eq.${product.category_id || 0},collection.eq.${product.collection || 'none'}`)
        .limit(4);

      if (related) {
        relatedProducts = related;
      }
    } catch (err) {
      console.error("Related products fetch failed:", err);
    }
  }

  // Fallback related products if database query yields empty
  if (relatedProducts.length === 0) {
    relatedProducts = mockProductsDetail
      .filter((p) => p.slug !== slug && (p.gender === product.gender || p.collection === product.collection))
      .slice(0, 4);
    if (relatedProducts.length === 0) {
      relatedProducts = mockProductsDetail.filter((p) => p.slug !== slug).slice(0, 4);
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || "DRIPEGO Luxury Streetwear piece.",
    image: product.thumbnail ? [product.thumbnail] : [],
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "INR",
      availability:
        (product.stock_quantity ?? 1) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `https://dripego.com/products/${product.slug}`,
    },
    brand: {
      "@type": "Brand",
      name: "DRIPEGO",
    },
  };

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-[#060606] px-4 pb-20 pt-28 sm:px-6 lg:px-10 text-[#ede9e3]">
        <div className="mx-auto max-w-[1400px]">
          <ProductDetailsClient product={product} relatedProducts={relatedProducts} />
        </div>
      </main>
      <Footer />
    </>
  );
}
