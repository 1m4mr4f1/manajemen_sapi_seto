'use client';

import { useActionState } from 'react';
import type { State } from '@/app/lib/actions/product.actions';

// Tipe data produk yang diterima form
export type SerializedProduct = {
  id?: string;
  nama_barang?: string;
  product_name?: string;
  stok: number;
  harga_jual?: number | null;
  selling_price?: number | null;
  harga_beli_terakhir?: number | null;
  last_purchase_price?: number | null;
};

// Komponen Tombol Submit
function SubmitButton({ label, pending }: { label: string; pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={`flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white transition-colors shadow-sm
        ${pending 
          ? 'bg-blue-400 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }`}
    >
      {pending ? (
        <>
          <svg className="mr-2 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Menyimpan...
        </>
      ) : (
        label
      )}
    </button>
  );
}

// Komponen Form Utama
export default function ProductForm({
  action,
  product,
}: {
  action: (prevState: State, formData: FormData) => Promise<State>;
  product?: SerializedProduct | null;
}) {
  const initialState: State = { message: null, errors: {} };
  const [state, dispatch, pending] = useActionState(action, initialState);

  // Helper nilai default
  const defaultNama = product?.nama_barang ?? product?.product_name ?? '';
  const defaultJual = product?.harga_jual ?? product?.selling_price ?? '';
  const defaultBeli = product?.harga_beli_terakhir ?? product?.last_purchase_price ?? '';
  const defaultStok = product?.stok ?? 0;

  // Style input yang konsisten dan KONTRAS TINGGI
  const inputClass = "block w-full rounded-md border border-gray-300 bg-white p-2.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 sm:text-sm";
  const labelClass = "block text-sm font-semibold text-gray-900 mb-1";

  return (
    <form action={dispatch} className="space-y-6 p-6">
      
      {/* Input Nama Barang */}
      <div>
        <label htmlFor="nama_barang" className={labelClass}>
          Nama Barang
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="nama_barang"
            name="nama_barang"
            defaultValue={defaultNama}
            placeholder="Contoh: Daging Sapi Sirloin"
            className={inputClass}
            aria-describedby="nama-error"
          />
        </div>
        <div id="nama-error" aria-live="polite" aria-atomic="true">
          {state.errors?.nama_barang &&
            state.errors.nama_barang.map((error: string) => (
              <p className="mt-1 text-xs text-red-600 font-medium" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Input Harga Beli */}
        <div>
          <label htmlFor="harga_beli_terakhir" className={labelClass}>
            Harga Beli (Rp)
          </label>
          <div className="mt-1">
            <input
              type="number"
              id="harga_beli_terakhir"
              name="harga_beli_terakhir"
              defaultValue={defaultBeli}
              placeholder="0"
              className={inputClass}
              aria-describedby="hargabeli-error"
            />
          </div>
          <div id="hargabeli-error" aria-live="polite" aria-atomic="true">
            {state.errors?.harga_beli_terakhir &&
              state.errors.harga_beli_terakhir.map((error: string) => (
                <p className="mt-1 text-xs text-red-600 font-medium" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Input Harga Jual */}
        <div>
          <label htmlFor="harga_jual" className={labelClass}>
            Harga Jual (Rp)
          </label>
          <div className="mt-1">
            <input
              type="number"
              id="harga_jual"
              name="harga_jual"
              defaultValue={defaultJual}
              placeholder="0"
              className={inputClass}
              aria-describedby="hargajual-error"
            />
          </div>
          <div id="hargajual-error" aria-live="polite" aria-atomic="true">
            {state.errors?.harga_jual &&
              state.errors.harga_jual.map((error: string) => (
                <p className="mt-1 text-xs text-red-600 font-medium" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
      </div>

      {/* Input Stok */}
      <div>
        <label htmlFor="stok" className={labelClass}>
          Stok (kg/unit)
        </label>
        <div className="mt-1">
          <input
            type="number"
            id="stok"
            name="stok"
            defaultValue={defaultStok}
            placeholder="0"
            className={inputClass}
            aria-describedby="stok-error"
          />
        </div>
        <div id="stok-error" aria-live="polite" aria-atomic="true">
          {state.errors?.stok &&
            state.errors.stok.map((error: string) => (
              <p className="mt-1 text-xs text-red-600 font-medium" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>

      {/* Pesan Error Global */}
      {state.message && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Perhatian</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{state.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tombol Submit */}
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <SubmitButton label={product ? 'Simpan Perubahan' : 'Buat Produk'} pending={pending} />
      </div>
    </form>
  );
}