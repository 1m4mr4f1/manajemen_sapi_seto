import React from 'react';
import SaleForm from '@/app/components/dashboard/SaleForm';
import { createSaleAction } from '@/app/lib/actions/sale.actions';
import { getProducts } from '@/app/lib/data/product.data';
import { fetchCustomers } from '@/app/lib/data/customer.data';

export default async function CreateSalePage() {
  const [products, customers] = await Promise.all([
    getProducts(),
    fetchCustomers(),
  ]);

  const serialized = products.map((p: any) => ({
    id: String(p.id),
    nama_barang: p.nama_barang,
    stok: p.stok,
    harga_jual: p.harga_jual != null ? Number(p.harga_jual) : null,
  }));

  const serializedCustomers = customers.map((c: any) => ({
    id: String(c.id),
    nama_pelanggan: c.nama_pelanggan,
  }));

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Buat Penjualan</h1>
      {/* Pass the server action reference directly (must be imported from a server module) */}
      <SaleForm 
        action={createSaleAction as any} 
        products={serialized}
        customers={serializedCustomers}
      />
    </div>
  );
}
