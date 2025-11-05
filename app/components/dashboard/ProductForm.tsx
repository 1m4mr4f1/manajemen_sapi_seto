'use client';

import { useActionState } from 'react';
// Tipe produk yang dikirim dari Server Component setelah diserialisasi
export type SerializedProduct = {
  id: string;
  nama_barang: string;
  stok: number;
  harga_jual?: number | null;
  harga_beli_terakhir?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};
import type { State } from '@/app/lib/actions/product.actions';

// Komponen tombol submit
function SubmitButton({ label, pending }: { label: string; pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-md px-4 py-2 text-sm font-medium text-white 
                  ${pending ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
    >
      {pending ? 'Menyimpan...' : label}
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
  const [state, dispatch, pending] = useActionState(action, initialState) as [State, any, boolean];

  return (
    <form action={dispatch} className="space-y-6 rounded-lg bg-white p-6 shadow-md">
      {/* Input Nama Barang */}
      <div>
        <label htmlFor="nama_barang" className="block text-sm font-medium text-gray-700">
          Nama Barang
        </label>
        <input
          type="text"
          id="nama_barang"
          name="nama_barang"
          defaultValue={product?.nama_barang}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          aria-describedby="nama-error"
        />
        <div id="nama-error" aria-live="polite" aria-atomic="true">
          {state.errors?.nama_barang &&
            state.errors.nama_barang.map((error: string) => (
              <p className="mt-1 text-xs text-red-600" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>

      {/* Input Harga Beli Terakhir */}
      <div>
        <label htmlFor="harga_beli_terakhir" className="block text-sm font-medium text-gray-700">
          Harga Beli Terakhir (Rp)
        </label>
        <input
          type="number"
          id="harga_beli_terakhir"
          name="harga_beli_terakhir"
          defaultValue={product?.harga_beli_terakhir != null ? String(product.harga_beli_terakhir) : undefined}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          aria-describedby="hargabeli-error"
        />
        <div id="hargabeli-error" aria-live="polite" aria-atomic="true">
          {state.errors?.harga_beli_terakhir &&
            state.errors.harga_beli_terakhir.map((error: string) => (
              <p className="mt-1 text-xs text-red-600" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>

      {/* Input Harga Jual */}
      <div>
        <label htmlFor="harga_jual" className="block text-sm font-medium text-gray-700">
          Harga Jual (Rp)
        </label>
        <input
          type="number"
          id="harga_jual"
          name="harga_jual"
          defaultValue={product?.harga_jual != null ? String(product.harga_jual) : undefined}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          aria-describedby="hargajual-error"
        />
        <div id="hargajual-error" aria-live="polite" aria-atomic="true">
          {state.errors?.harga_jual &&
            state.errors.harga_jual.map((error: string) => (
              <p className="mt-1 text-xs text-red-600" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>

      {/* Input Stok */}
      <div>
        <label htmlFor="stok" className="block text-sm font-medium text-gray-700">
          Stok (kg)
        </label>
        <input
          type="number"
          id="stok"
          name="stok"
          defaultValue={product?.stok}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          aria-describedby="stok-error"
        />
        <div id="stok-error" aria-live="polite" aria-atomic="true">
          {state.errors?.stok &&
            state.errors.stok.map((error: string) => (
              <p className="mt-1 text-xs text-red-600" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>

      {/* Pesan Error Global */}
      {state.message && (
        <div className="text-sm text-red-600" aria-live="polite">
          {state.message}
        </div>
      )}

      {/* Tombol Submit */}
      <div className="flex justify-end">
        <SubmitButton label={product ? 'Update Produk' : 'Tambah Produk'} pending={pending} />
      </div>
    </form>
  );
}