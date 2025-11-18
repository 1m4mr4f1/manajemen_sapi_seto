'use client';

import React from 'react';
import Link from 'next/link'; // Gunakan Link dari next/link untuk performa lebih baik

// Fungsi helper untuk status badge
const getStatusClasses = (status: string) => {
  switch (status) {
    case 'lunas': // Sesuaikan dengan enum di database (huruf kecil)
      return 'bg-green-100 text-green-800';
    case 'belum_lunas': // Sesuaikan dengan enum di database
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Fungsi helper format label status agar lebih rapi (misal: belum_lunas -> Belum Lunas)
const formatStatusLabel = (status: string) => {
  return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

export default function SaleTable({ sales }: { sales: any[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Tanggal
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Produk
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Total
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {sales.length === 0 ? (
             <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                  Belum ada data penjualan.
                </td>
             </tr>
          ) : (
            sales.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {s.id.toString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {s.tanggal_penjualan
                    ? new Date(s.tanggal_penjualan).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-'}
                </td>
                
                {/* PERBAIKAN DISINI: Menampilkan Nama Produk */}
                <td className="px-6 py-4 text-sm text-gray-800 max-w-xs truncate" title={s.saleDetails?.map((d: any) => d.product?.product_name).join(', ')}>
                  {s.saleDetails && s.saleDetails.length > 0 
                    ? s.saleDetails.map((d: any) => d.product?.product_name ?? 'Produk Terhapus').join(', ')
                    : <span className="text-gray-400 italic">Tanpa Produk</span>
                  }
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Rp {Number(s.total_akhir).toLocaleString('id-ID')}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClasses(
                      s.status_pembayaran
                    )}`}
                  >
                    {formatStatusLabel(s.status_pembayaran)}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                  <Link
                    href={`/dashboard/sales/${s.id}`}
                    className="hover:text-blue-800 hover:underline"
                  >
                    Lihat
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}