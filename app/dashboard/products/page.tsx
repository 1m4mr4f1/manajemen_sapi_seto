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
  const serializedProducts = products.map((p) => ({
    ...p,
    // 1. Ubah BigInt ke String
    id: p.id.toString(),

    // 2. Ubah Decimal ke Number
    // PENTING: Gunakan key 'selling_price' (sesuai database) untuk menimpa object Decimal bawaan Prisma
    selling_price: p.selling_price ? p.selling_price.toNumber() : 0,
    
    // PENTING: Gunakan key 'last_purchase_price' (sesuai database)
    last_purchase_price: p.last_purchase_price ? p.last_purchase_price.toNumber() : 0,

    // 3. Ubah Date ke String ISO
    // Gunakan key 'created_at' dan 'update_at' (sesuai database)
    created_at: p.created_at ? new Date(p.created_at).toISOString() : null,
    update_at: p.update_at ? new Date(p.update_at).toISOString() : null,
  }));

  // 4. Controller memutuskan apa yang akan ditampilkan
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Manajemen Produk</h1>
        <Link
          href="/dashboard/products/create" 
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