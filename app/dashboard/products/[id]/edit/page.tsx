import ProductForm from '@/app/components/dashboard/ProductForm';
import { updateProductAction } from '@/app/lib/actions';
import { getProductById } from '@/app/lib/data/product';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Ini adalah Server Component, jadi bisa async
export default async function EditProductPage({
  params,
}: {
  params: any; // params bisa berupa Promise tergantung versi Next
}) {
  // Unwrap params (toleran jika params adalah Promise atau objek biasa)
  const resolvedParams = (await params) as { id?: string };
  const id = resolvedParams?.id;

  if (!id) {
    console.error('[debug] EditProductPage: id undefined in params', resolvedParams);
    notFound();
  }

  // 1. Memanggil fungsi yang sudah kita perbaiki (menggunakan BigInt)
  const product = await getProductById(id);

  // Debug: log id dan product ke server console untuk ketahui masalah
  // (lihat terminal dev server Anda saat membuka halaman ini)
  console.log('[debug] EditProductPage id =', id);
  console.log('[debug] EditProductPage product =', product);

  // 2. Jika product benar-benar tidak ada di DB, tampilkan 404
  if (!product) {
    // Tambahkan pesan log sebelum notFound untuk keperluan debugging
    console.error('[debug] Product tidak ditemukan untuk id:', id);
    notFound();
  }

  // 3. 'Bind' ID (string) ke Server Action. Ini sudah benar.
  //    Server Action (updateProductAction) akan menerima 'id' sebagai argumen pertama.
  const updateProductWithId = updateProductAction.bind(null, id);

  // Serialize product for client component: convert Decimal/BigInt/Date to plain JS types
  const serializedProduct = {
    ...product,
    id: String((product as any).id),
    harga_jual: (product as any).harga_jual
      ? typeof (product as any).harga_jual === 'object' && typeof (product as any).harga_jual.toNumber === 'function'
        ? (product as any).harga_jual.toNumber()
        : Number((product as any).harga_jual)
      : null,
    harga_beli_terakhir: (product as any).harga_beli_terakhir
      ? typeof (product as any).harga_beli_terakhir === 'object' && typeof (product as any).harga_beli_terakhir.toNumber === 'function'
        ? (product as any).harga_beli_terakhir.toNumber()
        : Number((product as any).harga_beli_terakhir)
      : null,
    createdAt: product.createdAt ? new Date(product.createdAt).toISOString() : null,
    updatedAt: product.updatedAt ? new Date(product.updatedAt).toISOString() : null,
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/dashboard/products"
        className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Manajemen Produk
      </Link>
      <h1 className="mb-6 text-3xl font-bold text-gray-800">
        Edit: {product.nama_barang}
      </h1>

      {/* 4. Meneruskan action dan data 'product' ke form.
           ProductForm akan menggunakan 'product' untuk mengisi nilai default.
           Ini semua sudah benar.
      */}
      <ProductForm action={updateProductWithId} product={serializedProduct} />
    </div>
  );
}
