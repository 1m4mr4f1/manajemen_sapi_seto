import ProductTable from '@/app/components/dashboard/ProductTable';
import { getProducts } from '@/app/lib/data/product.data';
import Link from 'next/link';

export default async function DashboardPage() {
  const products = await getProducts();

  // Serialize products: convert BigInt/Decimal/Date to plain JS values
  const serializedProducts = products.map((p: any) => ({
    ...p,
    id: String(p.id),
    harga_jual:
      p.harga_jual && typeof p.harga_jual === 'object' && typeof p.harga_jual.toNumber === 'function'
        ? p.harga_jual.toNumber()
        : Number(p.harga_jual),
    harga_beli_terakhir:
      p.harga_beli_terakhir && typeof p.harga_beli_terakhir === 'object' && typeof p.harga_beli_terakhir.toNumber === 'function'
        ? p.harga_beli_terakhir.toNumber()
        : Number(p.harga_beli_terakhir),
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : null,
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

        <ProductTable products={serializedProducts} />
      </div>
    </div>
  );
}
