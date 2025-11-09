import React from "react";
import { getPurchases } from "@/app/lib/data/purchase.data"; // You will need to create this function
import BuyTable from "@/app/components/dashboard/BuyTable";
import { getProducts } from "@/app/lib/data/product.data";
import { getSuppliers } from "@/app/lib/data/supplier.data";

export default async function PurchasesPage() {
  const purchases = await getPurchases();
  const products = await getProducts();
  const suppliers = await getSuppliers();

  // Serialize values for client components
  const serialized = purchases.map((p: any) => ({
    ...p,
    id: String(p.id),
    total_pembelian: Number(p.total_pembelian),
    tanggal_pembelian: p.tanggal_pembelian
      ? new Date(p.tanggal_pembelian).toISOString()
      : null,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : null,
    supplierName:
      suppliers.find((s) => s.id === p.supplierId)?.nama_supplier ?? "N/A",
    purchaseDetails:
      p.purchaseDetails?.map((d: any) => ({
        id: String(d.id),
        purchaseId: String(d.purchaseId),
        productId: d.productId ? String(d.productId) : null,
        productName:
          products.find((prod) => prod.id === d.productId)?.nama_barang ??
          "N/A",
        jumlah: d.jumlah,
        harga_saat_beli: Number(d.harga_saat_beli),
      })) || [],
  }));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-950">Pembelian</h1>
        <a
          href="/dashboard/purchases/create"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Buat Pembelian
        </a>
      </div>
      <BuyTable purchases={serialized} />
    </div>
  );
}
