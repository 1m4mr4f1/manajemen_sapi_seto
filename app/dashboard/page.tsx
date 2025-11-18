import ProductTable from '@/app/components/dashboard/ProductTable';
import { getProducts } from '@/app/lib/data/product.data';
import Link from 'next/link';

export default async function DashboardPage() {
  const products = await getProducts();

  // Serialize products: convert BigInt/Decimal/Date to plain JS values
  const serializedProducts = products.map((p) => ({
    ...p,
    // 1. Konversi BigInt ke String
    id: p.id.toString(),

    // 2. Konversi Decimal ke Number
    // PENTING: Akses properti asli dari database ('selling_price'), bukan 'harga_jual'
    selling_price: p.selling_price ? p.selling_price.toNumber() : 0,
    
    // Akses properti asli ('last_purchase_price'), bukan 'harga_beli_terakhir'
    last_purchase_price: p.last_purchase_price ? p.last_purchase_price.toNumber() : 0,

    // 3. Konversi Date ke String ISO
    // Akses properti asli ('created_at' & 'update_at'), bukan 'createdAt'/'updatedAt'
    created_at: p.created_at ? new Date(p.created_at).toISOString() : null,
    update_at: p.update_at ? new Date(p.update_at).toISOString() : null,
  }));

  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600">Ringkasan produk dan stok.</p>
        </div>

        <div>
          <Link
            href="/dashboard/products"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Lihat Produk
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-sm text-gray-700">Total produk: {serializedProducts.length}</div>

        {/* Pastikan ProductTable Anda siap menerima props dengan nama key bahasa Inggris (selling_price, dsb) */}
        <ProductTable products={serializedProducts} />
      </div>
    </div>
  );
}