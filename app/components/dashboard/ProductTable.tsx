'use client';

import { Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { deleteProductAction } from '@/app/lib/actions/product.actions'; // 1. Import Action Hapus

// Definisi tipe data
interface Product {
  id: string;
  product_name: string;
  stock: number;
  selling_price: number;
  last_purchase_price: number;
}

interface ProductTableProps {
  products: Product[];
}

export default function ProductTable({ products }: ProductTableProps) {
  
  // Helper untuk format Rupiah
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // 2. Buat fungsi handler untuk menghapus
  const handleDelete = async (id: string) => {
    const confirmed = confirm('Yakin ingin menghapus produk ini? Data yang dihapus tidak dapat dikembalikan.');
    
    if (confirmed) {
      try {
        // Panggil Server Action
        await deleteProductAction(id);
        // Tidak perlu reload manual, Server Action akan melakukan revalidatePath
      } catch (error) {
        console.error('Gagal menghapus:', error);
        alert('Gagal menghapus produk.');
      }
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nama Barang
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Harga Beli
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Harga Jual
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stok
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                Belum ada data produk.
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {product.product_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatRupiah(product.last_purchase_price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatRupiah(product.selling_price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.stock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/dashboard/products/${product.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900 transition-colors"
                    >
                      <Pencil className="h-5 w-5" />
                    </Link>
                    
                    {/* 3. Hubungkan tombol dengan fungsi handleDelete */}
                    <button
                      className="text-red-600 hover:text-red-900 transition-colors"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}