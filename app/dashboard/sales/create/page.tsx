import React from 'react';
import SaleForm from '@/app/components/dashboard/SaleForm';
import { createSaleAction } from '@/app/lib/actions/sale.actions';
import { getProducts } from '@/app/lib/data/product.data';

export default async function CreateSalePage() {
  const products = await getProducts();

  const serialized = products.map((p: any) => ({
    id: String(p.id),
    nama_barang: p.nama_barang,
    stok: p.stok,
    harga_jual: p.harga_jual != null ? Number(p.harga_jual) : null,
  }));

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Buat Penjualan</h1>
      {/* Pass the server action reference directly (must be imported from a server module) */}
      <SaleForm action={createSaleAction as any} products={serialized} />
    </div>
  );
}
