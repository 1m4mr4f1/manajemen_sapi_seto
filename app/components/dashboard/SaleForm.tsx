'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useActionState } from 'react';
import { Loader2 } from 'lucide-react'; // Ikon untuk loading
import type { SaleState } from '@/app/lib/actions/sale.actions';

// Fungsi helper untuk format mata uang
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

export default function SaleForm({
  action,
  products = [],
}: {
  action: (state: void | SaleState, payload: FormData) => Promise<void | SaleState>;
  products?: Array<{ id: string; nama_barang: string; stok: number; harga_jual?: number | null }>;
}) {
  const initial = undefined;
  const [state, dispatch, pending] = useActionState(action, initial) as [SaleState | undefined, any, boolean];

  // State untuk item
  // Keep productId empty initially so dropdown placeholder shows and summary is empty
  const [productId, setProductId] = useState<string>('');
  // jumlah and discount start empty (user requested no default zeros)
  const [jumlah, setJumlah] = useState<string>('');
  const [discount, setDiscount] = useState<string>('');

  // Perhitungan turunan
  const selectedProduct = useMemo(() => products.find((p) => p.id === productId), [products, productId]);
  const harga = selectedProduct?.harga_jual ?? null; // null when no product selected
  const numJumlah = jumlah === '' ? null : Number(jumlah);
  const subtotal = harga != null && numJumlah != null ? harga * numJumlah : null;
  const discountPercent = discount === '' ? 0 : Number(discount);
  const discountAmount = subtotal != null ? subtotal * (discountPercent / 100) : null;
  const totalAkhir = subtotal != null ? subtotal - (discountAmount ?? 0) : null;

  // Tanggal penjualan default: sekarang di timezone Asia/Jakarta (UTC+7)
  const tanggalPenjualanJakarta = React.useMemo(() => {
    const now = new Date();
    const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    const jakarta = new Date(utc.getTime() + 7 * 60 * 60000);
    // Format as YYYY-MM-DDTHH:mm:ss (no ms, no timezone) matching DATETIME(0)
    return jakarta.toISOString().slice(0, 19);
  }, []);

  // items JSON string to send to server action
  const itemsJson = JSON.stringify(
    isNaN(Number(jumlah)) || productId === '' || harga == null
      ? []
      : [{ productId: productId ?? '', jumlah: Number(jumlah), harga_saat_jual: harga }]
  );

  // Simple client-side validity
  const isFormValid = productId !== '' && jumlah !== '' && Number(jumlah) >= 1 && harga != null;

  // Efek untuk set produk default
  useEffect(() => {
    // If products load later, set default productId only when current value is empty
    if ((productId === '' || productId == null) && products[0]) setProductId(products[0].id);
  }, [products, productId]);

  return (
    // Gunakan <main> atau wrapper dengan padding
    <main className="p-4 md:p-6">
      <form
        action={dispatch}
        // Gunakan `space-y-6` untuk jarak lebih besar
        className="max-w-2xl space-y-6 rounded-lg bg-white p-6 shadow-md"
      >
        {/* === BAGIAN INPUT UTAMA (GRID) === */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/*
           * FIX "TERTTUMPUK":
           * Menambahkan `relative z-10` di sini.
           * Ini memastikan wrapper dropdown memiliki tumpukan (stacking context)
           * yang lebih tinggi daripada elemen di bawahnya.
           */}
          <div className="relative z-10">
            <label htmlFor="productId" className="block text-sm font-medium text-gray-800">
              Pilih Barang
            </label>
            <select
              id="productId"
              name="productId" // Pastikan name ada untuk FormData
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={products.length === 0}
            >
              <option value="" disabled>
                {products.length === 0 ? 'Tidak ada produk tersedia' : 'Pilih produk...'}
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama_barang}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="jumlah" className="block text-sm font-medium text-gray-800">
              Jumlah
            </label>
            <input
              id="jumlah"
              type="number"
              name="jumlah" // Pastikan name ada untuk FormData
              min={1}
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder=""
            />
          </div>
        </div>

        {/* === BAGIAN DISKON === */}
        <div>
          <label htmlFor="discount" className="block text-sm font-medium text-gray-800">
            Discount (%) (opsional)
          </label>
          <input
            id="discount"
            type="number"
            name="discount" // Pastikan name ada untuk FormData
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Contoh: 10"
          />
        </div>

        {/* === BAGIAN RINGKASAN (READ-ONLY) === */}
        <div className="w-full rounded-md bg-gray-50 p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Ringkasan</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-600">Harga Satuan</div>
            <div className="font-medium text-gray-900">{harga != null ? formatCurrency(harga) : '-'}</div>

            <div className="text-gray-600">Subtotal</div>
            <div className="font-medium text-gray-900">{subtotal != null ? formatCurrency(subtotal) : '-'}</div>

            <div className="text-gray-600">Discount</div>
            <div className="font-medium text-gray-900">{discount === '' ? '-' : `${discountPercent}%`}</div>

            <div className="text-gray-600">Total Akhir</div>
            <div className="font-semibold text-gray-900">{totalAkhir != null ? formatCurrency(totalAkhir) : '-'}</div>
          </div>
        </div>

        {/* Hidden fields: send minimal inputs; backend akan menghitung subtotal/total/items */}
        <input type="hidden" name="tanggal_penjualan" value={tanggalPenjualanJakarta} />
        <input type="hidden" name="status_pembayaran" value="belum_lunas" />

        {/* === BAGIAN AKSI (TOMBOL) === */}
        <div className="flex items-center justify-end gap-4 w-full">
          {/* Server validation message */}
          {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

          {/* Field errors from server (zod) */}
          {state?.errors && (
            <div className="mr-auto text-sm text-red-600">
              {Object.entries(state.errors).map(([field, msgs]) => (
                <div key={field}>
                  <strong>{field}:</strong> {(msgs || []).join(', ')}
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={pending || !isFormValid}
            className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              pending || !isFormValid ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              'Buat Penjualan'
            )}
          </button>
        </div>
      </form>
    </main>
  );
}