import ProductForm from '@/app/components/dashboard/ProductForm';
import { createProductAction } from '@/app/lib/actions/product.actions';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateProductPage() {
  return (
    <div>
      <Link
        href="/dashboard/products"
        className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Manajemen Produk
      </Link>
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Tambah Produk Baru</h1>

      {/* Gunakan Server Action di sini */}
      <ProductForm action={createProductAction} />
    </div>
  );
}