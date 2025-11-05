import React from 'react';
import { getSales } from '@/app/lib/data/sale.data';
import SaleTable from '@/app/components/dashboard/SaleTable';

export default async function SalesPage() {
  const sales = await getSales();

  // Serialize values for client components
  const serialized = sales.map((s: any) => ({
    ...s,
    id: String(s.id),
    subtotal: Number(s.subtotal),
    discount: Number(s.discount),
    total_akhir: Number(s.total_akhir),
    tanggal_penjualan: s.tanggal_penjualan ? new Date(s.tanggal_penjualan).toISOString() : null,
    createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : null,
    updatedAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : null,
    saleDetails: s.saleDetails?.map((d: any) => ({
      id: String(d.id),
      saleId: String(d.saleId),
      productId: d.productId ? String(d.productId) : null,
      productName: d.product?.nama_barang ?? null,
      productHarga: d.product?.harga_jual != null ? Number(d.product.harga_jual) : null,
      jumlah: d.jumlah,
      harga_saat_jual: Number(d.harga_saat_jual),
    })) || [],
  }));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-950">Penjualan</h1>
        <a href="/dashboard/sales/create" className="rounded bg-blue-600 px-4 py-2 text-gray-950">Buat Penjualan</a>
      </div>
      <SaleTable sales={serialized} />
    </div>
  );
}
