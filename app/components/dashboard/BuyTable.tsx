"use client";

import React from "react";

// Status badge helper function
const getStatusClasses = (status: string) => {
  switch (status) {
    case "Lunas":
      return "bg-green-100 text-green-800";
    case "Belum Lunas":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function BuyTable({ purchases }: { purchases: any[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
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
              Supplier
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
        <tbody className="divide-y divide-gray-200 bg-white">
          {purchases.map((p) => (
            <tr key={p.id} className="border-t hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {p.id}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                {p.tanggal_pembelian
                  ? new Date(p.tanggal_pembelian).toLocaleString("id-ID")
                  : "-"}
              </td>
              <td className="px-6 py-4 text-sm text-gray-800">
                {p.purchaseDetails.map((d: any) => d.productName).join(", ")}
              </td>
              <td className="px-6 py-4 text-sm text-gray-800">
                {p.supplierName}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Rp {Number(p.total_pembelian).toLocaleString("id-ID")}
              </td>
              <td className="px-4 py-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5 ${getStatusClasses(
                    p.status_pembayaran,
                  )}`}
                >
                  {p.status_pembayaran}
                </span>
              </td>
              <td className="px-4 py-2">
                <a
                  className="text-blue-600"
                  href={`/dashboard/purchases/${p.id}`}
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
