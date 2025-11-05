'use client';

import React from 'react';

// Fungsi helper untuk status badge (bisa dipindahkan ke file util)
const getStatusClasses = (status: string) => {
  switch (status) {
    case 'Lunas': // Ganti "Lunas" dengan status "sukses" Anda
      return 'bg-green-100 text-green-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Gagal':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function SaleTable({ sales }: { sales: any[] }) {
  return (
    // Wrapper: Tambahkan shadow, border lebih spesifik, dan overflow-x-auto
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        {/* Header: Padding lebih besar, font diubah (uppercase,
            tracking-wider) */}
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-950"
            >
              ID
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-950"
            >
              Tanggal
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-950"
            >
              Produk
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-950"
            >
              Total
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-950"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-950"
            >
              Aksi
            </th>
          </tr>
        </thead>
        {/* Body: Padding lebih besar, ada efek hover, dan
            pemisah antar baris */}
        <tbody className="divide-y divide-gray-200 bg-white">
          {sales.map((s) => (
            <tr key={s.id} className="border-t hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.id}</td>
              <td className="px-6 py-4 text-sm text-gray-700">
                {s.tanggal_penjualan
                  ? new Date(s.tanggal_penjualan).toLocaleString('id-ID') // Gunakan locale 'id-ID'
                  : '-'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-800">
                {s.saleDetails.map((d: any) => d.productName).join(', ')}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Rp {Number(s.total_akhir).toLocaleString('id-ID')}
              </td>
              {/* Status Badge: Jauh lebih jelas secara visual */}
              <td className="px-4 py-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5 ${getStatusClasses(
                    s.status_pembayaran,
                  )}`}
                >
                  {s.status_pembayaran}
                </span>
              </td>
              <td className="px-4 py-2">
                <a
                  className="text-blue-600"
                  href={`/dashboard/sales/${s.id}`}
                >
                  Lihat
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}