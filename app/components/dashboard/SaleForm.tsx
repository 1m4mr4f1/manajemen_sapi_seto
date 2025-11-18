'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom'; // PENTING: Gunakan hook stabil
import { Loader2 } from 'lucide-react';
import type { SaleState } from '@/app/lib/actions/sale.actions';

// Helper format Rupiah
const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

// Komponen Tombol Submit (Dipisah untuk useFormStatus)
function SubmitButton({ isValid }: { isValid: boolean }) {
  const { pending } = useFormStatus();
  const disabled = pending || !isValid;

  return (
    <button
      type="submit"
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-md px-6 py-2.5 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all
        ${disabled 
          ? 'bg-blue-400 cursor-not-allowed opacity-70' 
          : 'bg-blue-600 hover:bg-blue-700'
        }`}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Memproses...
        </>
      ) : (
        'Buat Penjualan'
      )}
    </button>
  );
}

export default function SaleForm({
  action,
  products = [],
  customers = [],
}: {
  action: (state: SaleState, payload: FormData) => Promise<SaleState>;
  products?: Array<{ id: string; nama_barang: string; stok: number; harga_jual?: number | null }>;
  customers?: Array<{ id: string; nama_pelanggan: string }>;
}) {
  const initialState: SaleState = { message: null, errors: {} };
  
  // PERBAIKAN: Menggunakan useFormState
  const [state, dispatch] = useFormState(action, initialState);

  // State Lokal
  const [productId, setProductId] = useState<string>('');
  const [jumlah, setJumlah] = useState<string>('');
  const [discount, setDiscount] = useState<string>('');
  const [paymentType, setPaymentType] = useState<'lunas' | 'cicil'>('lunas');
  const [downPayment, setDownPayment] = useState<string>('');

  // Kalkulasi Realtime
  const selectedProduct = useMemo(() => products.find((p) => p.id === productId), [products, productId]);
  const harga = selectedProduct?.harga_jual ?? 0;
  const stokTersedia = selectedProduct?.stok ?? 0;
  
  const numJumlah = jumlah === '' ? 0 : Number(jumlah);
  const subtotal = harga * numJumlah;
  const discountPercent = discount === '' ? 0 : Number(discount);
  const discountAmount = subtotal * (discountPercent / 100);
  const totalAkhir = subtotal - discountAmount;

  // Tanggal (Hidden Input)
  const tanggalPenjualanJakarta = useMemo(() => {
    const now = new Date();
    const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    const jakarta = new Date(utc.getTime() + 7 * 60 * 60000);
    return jakarta.toISOString().slice(0, 19);
  }, []);

  // Validasi Client-Side Sederhana
  const isFormValid = 
    productId !== '' && 
    numJumlah >= 1 && 
    numJumlah <= stokTersedia &&
    (paymentType === 'lunas' || (paymentType === 'cicil' && Number(downPayment) >= 0));

  // Auto-select produk pertama jika ada
  useEffect(() => {
    if (!productId && products.length > 0) {
      setProductId(products[0].id);
    }
  }, [products, productId]);

  // STYLE INPUT (Kontras Tinggi)
  const inputClass = "mt-1 block w-full rounded-md border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm placeholder-gray-400 border";
  const labelClass = "block text-sm font-medium text-gray-900 mb-1";

  return (
    <main className="p-4 md:p-6">
      {/* Container Kartu Putih */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-6 sm:p-8">
          <form action={dispatch} className="space-y-8">
            
            {/* === GRID UTAMA: PRODUK & JUMLAH === */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Pilih Produk */}
              <div className="relative">
                <label htmlFor="productId" className={labelClass}>
                  Pilih Barang
                </label>
                <select
                  id="productId"
                  name="productId"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className={inputClass}
                  disabled={products.length === 0}
                >
                  {products.length === 0 ? (
                    <option value="" disabled>Stok Habis / Kosong</option>
                  ) : (
                    products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nama_barang} (Stok: {p.stok})
                      </option>
                    ))
                  )}
                </select>
                {state.errors?.productId && (
                  <p className="mt-1 text-sm text-red-600">{state.errors.productId[0]}</p>
                )}
              </div>

              {/* Input Jumlah */}
              <div>
                <label htmlFor="jumlah" className={labelClass}>
                  Jumlah (Stok: {stokTersedia})
                </label>
                <input
                  id="jumlah"
                  name="jumlah"
                  type="number"
                  min={1}
                  max={stokTersedia}
                  value={jumlah}
                  onChange={(e) => setJumlah(e.target.value)}
                  className={inputClass}
                  placeholder="0"
                />
                {numJumlah > stokTersedia && (
                  <p className="mt-1 text-sm text-red-600">Stok tidak mencukupi!</p>
                )}
                {state.errors?.jumlah && (
                  <p className="mt-1 text-sm text-red-600">{state.errors.jumlah[0]}</p>
                )}
              </div>
            </div>

            {/* === GRID KEDUA: PELANGGAN & DISKON === */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Pilih Pelanggan */}
              <div>
                <label htmlFor="customerId" className={labelClass}>
                  Pelanggan (Opsional)
                </label>
                <select
                  id="customerId"
                  name="customerId"
                  defaultValue=""
                  className={inputClass}
                >
                  <option value="">-- Pelanggan Umum --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nama_pelanggan}
                    </option>
                  ))}
                </select>
                {state.errors?.customerId && (
                  <p className="mt-1 text-sm text-red-600">{state.errors.customerId[0]}</p>
                )}
              </div>

              {/* Diskon */}
              <div>
                <label htmlFor="discount" className={labelClass}>
                  Diskon (%)
                </label>
                <input
                  id="discount"
                  name="discount"
                  type="number"
                  min={0}
                  max={100}
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className={inputClass}
                  placeholder="0"
                />
                {state.errors?.discount && (
                  <p className="mt-1 text-sm text-red-600">{state.errors.discount[0]}</p>
                )}
              </div>
            </div>

            {/* === METODE PEMBAYARAN === */}
            <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Metode Pembayaran
              </label>
              <div className="flex gap-6 mb-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status_pembayaran"
                    value="lunas"
                    checked={paymentType === 'lunas'}
                    onChange={() => setPaymentType('lunas')}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-900">Lunas</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status_pembayaran"
                    value="belum_lunas"
                    checked={paymentType === 'cicil'}
                    onChange={() => setPaymentType('cicil')}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-900">Cicil / Tempo</span>
                </label>
              </div>

              {/* Input DP jika Cicil */}
              {paymentType === 'cicil' && (
                <div className="mt-2">
                  <label htmlFor="downPayment" className={labelClass}>
                    Pembayaran Awal (DP)
                  </label>
                  <input
                    id="downPayment"
                    name="downPayment"
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value)}
                    className={inputClass}
                    placeholder="Masukkan jumlah DP"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Sisa Tagihan: <span className="font-semibold text-red-600">{formatCurrency(totalAkhir - (Number(downPayment) || 0))}</span>
                  </p>
                </div>
              )}
            </div>

            {/* === RINGKASAN TRANSAKSI === */}
            <div className="bg-blue-50 rounded-md p-5 border border-blue-100">
              <h3 className="text-sm font-semibold text-blue-900 mb-3 border-b border-blue-200 pb-2">Ringkasan Transaksi</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-800">Harga Satuan</span>
                  <span className="font-medium text-blue-900">{formatCurrency(harga)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-800">Subtotal</span>
                  <span className="font-medium text-blue-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-800">Diskon ({discountPercent}%)</span>
                  <span className="font-medium text-red-600">- {formatCurrency(discountAmount)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-blue-200 text-base">
                  <span className="font-bold text-blue-900">Total Akhir</span>
                  <span className="font-bold text-blue-900">{formatCurrency(totalAkhir)}</span>
                </div>
              </div>
            </div>

            {/* Hidden Inputs untuk Server Action */}
            <input type="hidden" name="tanggal_penjualan" value={tanggalPenjualanJakarta} />
            <input type="hidden" name="total_akhir" value={totalAkhir ?? 0} />
            <input type="hidden" name="subtotal" value={subtotal ?? 0} />
            <input type="hidden" name="discount_amount" value={discountAmount ?? 0} />
            <input type="hidden" name="discount_percent" value={discountPercent} />

            {/* === ERROR MESSAGE & SUBMIT === */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-2">
              {/* Pesan Error Global dari Server */}
              {state?.message && (
                <p className="text-sm text-red-600 font-medium bg-red-50 px-3 py-2 rounded-md border border-red-100">
                  {state.message}
                </p>
              )}
              
              <SubmitButton isValid={isFormValid} />
            </div>

          </form>
        </div>
      </div>
    </main>
  );
}