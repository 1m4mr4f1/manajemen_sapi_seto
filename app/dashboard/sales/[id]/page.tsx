import React from 'react';
import { getSaleById } from '@/app/lib/data/sale.data';

export default async function SaleDetailPage({ params }: { params: { id: string } }) {
  const sale = await getSaleById(params.id);
  if (!sale) return <div>Data tidak ditemukan</div>;

  const s = {
    ...sale,
    id: String(sale.id),
    subtotal: Number(sale.subtotal),
    discount: Number(sale.discount),
    total_akhir: Number(sale.total_akhir),
    tanggal_penjualan: sale.tanggal_penjualan ? new Date(sale.tanggal_penjualan).toISOString() : null,
    saleDetails: sale.saleDetails?.map((d: any) => ({
      ...d,
      id: String(d.id),
      productId: d.productId ? String(d.productId) : null,
      harga_saat_jual: Number(d.harga_saat_jual),
    })) || [],
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Detail Penjualan #{s.id}</h1>
      <div className="rounded bg-white p-6 shadow">
        <p>Tanggal: {s.tanggal_penjualan}</p>
        <p>Subtotal: Rp {s.subtotal.toLocaleString()}</p>
        <p>Discount: Rp {s.discount.toLocaleString()}</p>
        <p>Total Akhir: Rp {s.total_akhir.toLocaleString()}</p>
        <h2 className="mt-4 font-semibold">Items</h2>
        <ul>
          {s.saleDetails.map((d: any) => (
            <li key={d.id}>
              Produk: {d.productId} — Jumlah: {d.jumlah} — Harga: Rp {d.harga_saat_jual.toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
