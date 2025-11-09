import React from "react";
import BuyForm from "@/app/components/dashboard/BuyForm";
import { createPurchaseAction } from "@/app/lib/actions/purchase.actions";
import { getProducts } from "@/app/lib/data/product.data";
import { getSuppliers } from "@/app/lib/data/supplier.data";

export default async function CreatePurchasePage() {
  const products = await getProducts();
  const suppliers = await getSuppliers();

  const serializedProducts = products.map((p: any) => ({
    id: String(p.id),
    nama_barang: p.nama_barang,
    stok: p.stok,
    harga_beli_terakhir:
      p.harga_beli_terakhir != null ? Number(p.harga_beli_terakhir) : null,
  }));

  const serializedSuppliers = suppliers.map((s: any) => ({
    id: String(s.id),
    nama_supplier: s.nama_supplier,
  }));

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Buat Pembelian</h1>
      <BuyForm
        action={createPurchaseAction as any}
        products={serializedProducts}
        suppliers={serializedSuppliers}
      />
    </div>
  );
}
