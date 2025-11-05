'use client';

import { deleteProductAction } from '@/app/lib/actions';
import type { Product } from '@prisma/client';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useTransition } from 'react';

// Fungsi untuk format mata uang
function formatCurrency(amount: number | string | any) {
  // Konversi 'any' (dari Decimal) ke number
  const numericAmount = typeof amount === 'object' ? Number(amount) : amount;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(numericAmount);
}

// Tombol Delete
function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      startTransition(async () => {
        await deleteProductAction(id);
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className={`rounded p-1.5 text-sm font-medium 
                  ${isPending ? 'text-gray-400' : 'text-red-600 hover:bg-red-100'}`}
      aria-label="Hapus produk"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
}

// Komponen Tabel Utama
export default function ProductTable({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return <p className="text-gray-500">Belum ada produk.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Nama Barang
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Harga Beli
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Harga Jual
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Stok (kg)
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                {product.nama_barang}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {formatCurrency(product.harga_beli_terakhir)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {formatCurrency(product.harga_jual)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {product.stok}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/dashboard/products/${product.id}/edit`}
                    className="rounded p-1.5 text-blue-600 hover:bg-blue-100"
                    aria-label="Edit produk"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <DeleteButton id={product.id.toString()} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}