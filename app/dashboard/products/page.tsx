// 1. Impor Model
import { getProducts } from '@/app/lib/data/product.data';

// 2. Impor View
import ProductTable from '@/app/components/dashboard/ProductTable';

import { Plus } from 'lucide-react';
import Link from 'next/link';

// Halaman ini adalah Server Component, jadi kita bisa buat 'async'
export default async function ProductsPage() {
  
  // 3. Panggil Model untuk mengambil data
  const products = await getProducts();

  // Serialize produk: ubah Decimal/BigInt/Date menjadi plain JS values
  const serializedProducts = products.map((p: any) => ({
    ...p,
    id: String(p.id),
    harga_jual: p.harga_jual
      ? typeof p.harga_jual === 'object' && typeof p.harga_jual.toNumber === 'function'
        ? p.harga_jual.toNumber()
        : Number(p.harga_jual)
      : null,
    harga_beli_terakhir: p.harga_beli_terakhir
      ? typeof p.harga_beli_terakhir === 'object' && typeof p.harga_beli_terakhir.toNumber === 'function'
        ? p.harga_beli_terakhir.toNumber()
        : Number(p.harga_beli_terakhir)
      : null,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : null,
  }));

  // 4. Controller memutuskan apa yang akan ditampilkan
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Manajemen Produk</h1>
        <Link
          href="/dashboard/products/create" // Nanti kita buat halaman ini
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Produk</span>
        </Link>
      </div>

      {/* 5. Teruskan data ke View untuk di-render */}
      <ProductTable products={serializedProducts} />
    </div>
  );
}