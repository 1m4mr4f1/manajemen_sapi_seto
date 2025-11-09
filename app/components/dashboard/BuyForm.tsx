"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import type { BuyState } from "@/app/lib/actions/buy.actions"; // You will need to create this type

// Define the shape of a serialized purchase for the form
export type SerializedPurchase = {
  id: string;
  supplierId: string;
  purchaseDetails: {
    productId: string;
    jumlah: number;
    harga_saat_beli: number;
  }[];
  // ... other purchase fields if needed
};

// Currency formatting helper function
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

export default function BuyForm({
  action,
  products = [],
  suppliers = [],
  purchase = null, // Accept an optional purchase object for editing
}: {
  action: (
    state: void | BuyState,
    payload: FormData,
  ) => Promise<void | BuyState>;
  products?: Array<{
    id: string;
    nama_barang: string;
    stok: number;
    harga_beli_terakhir?: number | null;
  }>;
  suppliers?: Array<{ id: string; nama_supplier: string }>;
  purchase?: SerializedPurchase | null;
}) {
  const initial = undefined;
  const [state, dispatch, pending] = useActionState(action, initial) as [
    BuyState | undefined,
    any,
    boolean,
  ];

  // For simplicity, this form assumes one product per purchase.
  const purchaseDetail = purchase?.purchaseDetails?.[0];

  // State for form items, pre-populated if in edit mode
  const [productId, setProductId] = useState<string>(
    purchaseDetail?.productId || "",
  );
  const [supplierId, setSupplierId] = useState<string>(
    purchase?.supplierId || "",
  );
  const [jumlah, setJumlah] = useState<string>(
    purchaseDetail?.jumlah?.toString() || "",
  );
  const [hargaBeli, setHargaBeli] = useState<string>(
    purchaseDetail?.harga_saat_beli?.toString() || "",
  );

  // Derived calculations
  const numJumlah = jumlah === "" ? null : Number(jumlah);
  const numHargaBeli = hargaBeli === "" ? null : Number(hargaBeli);
  const totalPembelian =
    numJumlah != null && numHargaBeli != null ? numJumlah * numHargaBeli : null;

  // Default purchase date: now in Asia/Jakarta timezone (UTC+7)
  const tanggalPembelianJakarta = React.useMemo(() => {
    const now = new Date();
    const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    const jakarta = new Date(utc.getTime() + 7 * 60 * 60000);
    return jakarta.toISOString().slice(0, 19); // YYYY-MM-DDTHH:mm:ss
  }, []);

  // Set default product/supplier if not in edit mode
  useEffect(() => {
    if (!purchase && products.length > 0 && !productId) {
      setProductId(products[0].id);
    }
  }, [products, productId, purchase]);

  useEffect(() => {
    if (!purchase && suppliers.length > 0 && !supplierId) {
      setSupplierId(suppliers[0].id);
    }
  }, [suppliers, supplierId, purchase]);

  // Client-side form validity
  const isFormValid =
    productId !== "" &&
    supplierId !== "" &&
    jumlah !== "" &&
    Number(jumlah) >= 1 &&
    hargaBeli !== "" &&
    Number(hargaBeli) > 0;

  const buttonText = purchase ? "Update Pembelian" : "Buat Pembelian";

  return (
    <main className="p-4 md:p-6">
      <form
        action={dispatch}
        className="max-w-2xl space-y-6 rounded-lg bg-white p-6 shadow-md"
      >
        {/* === MAIN INPUT SECTION (GRID) === */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="relative z-10">
            <label
              htmlFor="productId"
              className="block text-sm font-medium text-gray-800"
            >
              Pilih Barang
            </label>
            <select
              id="productId"
              name="productId"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={products.length === 0}
            >
              <option value="" disabled>
                {products.length === 0
                  ? "Tidak ada produk tersedia"
                  : "Pilih produk..."}
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama_barang}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="supplierId"
              className="block text-sm font-medium text-gray-800"
            >
              Pilih Supplier
            </label>
            <select
              id="supplierId"
              name="supplierId"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={suppliers.length === 0}
            >
              <option value="" disabled>
                {suppliers.length === 0
                  ? "Tidak ada supplier tersedia"
                  : "Pilih supplier..."}
              </option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama_supplier}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="jumlah"
              className="block text-sm font-medium text-gray-800"
            >
              Jumlah
            </label>
            <input
              id="jumlah"
              type="number"
              name="jumlah"
              min={1}
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder=""
            />
          </div>

          <div>
            <label
              htmlFor="harga_beli"
              className="block text-sm font-medium text-gray-800"
            >
              Harga Beli Satuan
            </label>
            <input
              id="harga_beli"
              type="number"
              name="harga_beli"
              value={hargaBeli}
              onChange={(e) => setHargaBeli(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Contoh: 50000"
            />
          </div>
        </div>

        {/* === SUMMARY SECTION (READ-ONLY) === */}
        <div className="w-full rounded-md bg-gray-50 p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Ringkasan</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-600">Total Pembelian</div>
            <div className="font-semibold text-gray-900">
              {totalPembelian != null ? formatCurrency(totalPembelian) : "-"}
            </div>
          </div>
        </div>

        {/* Hidden fields */}
        <input
          type="hidden"
          name="tanggal_pembelian"
          value={tanggalPembelianJakarta}
        />
        <input type="hidden" name="status_pembayaran" value="belum_lunas" />

        {/* === ACTIONS SECTION (BUTTONS) === */}
        <div className="flex items-center justify-end gap-4 w-full">
          {/* Server validation message */}
          {state?.message && (
            <p className="text-sm text-red-600">{state.message}</p>
          )}

          {/* Field errors from server (zod) */}
          {state?.errors && (
            <div className="mr-auto text-sm text-red-600">
              {Object.entries(state.errors).map(([field, msgs]) => (
                <div key={field}>
                  <strong>{field}:</strong> {(msgs || []).join(", ")}
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={pending || !isFormValid}
            className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              pending || !isFormValid
                ? "bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              buttonText
            )}
          </button>
        </div>
      </form>
    </main>
  );
}
