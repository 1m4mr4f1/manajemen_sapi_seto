// Ini adalah "View" kita.
// Perhatikan bahwa ini BUKAN 'use client'. Ini adalah Server Component.
// Ia tidak memiliki state atau hooks, hanya menerima props.

import { Prisma } from '@prisma/client';

// Kita definisikan tipe data yang diharapkan dari controller
// Ini adalah array dari 'Product', tapi kita ambil tipenya dari Prisma
type Product = Prisma.ProductGetPayload<{}>;

interface ProductTableProps {
  products: Product[]; // View ini HARUS menerima prop 'products'
}

export default function ProductTable({ products }: ProductTableProps) {
  return (
    <div className="rounded-lg border bg-white shadow-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Nama Barang
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Stok
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Harga Jual
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Harga Beli Terakhir
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {product.nama_barang}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm text-gray-900">{product.stok}</div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm text-gray-900">
                  Rp {product.harga_jual.toLocaleString('id-ID')}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm text-gray-900">
                  Rp {product.harga_beli_terakhir?.toLocaleString('id-ID') || '-'}
                </div>
              </td>
            </tr>
          ))}

          {products.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="px-6 py-12 text-center text-sm text-gray-500"
              >
                Tidak ada data produk ditemukan.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

