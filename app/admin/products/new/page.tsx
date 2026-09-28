import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white">Add Product</h1>
        <p className="text-xs text-white/45">Create a new product entry in the catalog database.</p>
      </div>
      <ProductForm />
    </div>
  );
}
