'use client';

import { useFormState, useFormStatus } from 'react-dom';
import type { State } from '@/app/lib/actions/product.actions';

// Tipe data produk
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

// Komponen Tombol Submit (Dipisah agar useFormStatus berfungsi)
function SubmitButton({ label }: { label: string }) {
  // Hook ini otomatis mendeteksi status loading dari form induknya
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center rounded-md px-6 py-2.5 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all
        ${pending 
          ? 'bg-blue-400 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700'
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
  
  // PERBAIKAN: Gunakan useFormState yang stabil
  const [state, dispatch] = useFormState(action, initialState);

  // Helper Default Value
  const defaultNama = product?.nama_barang ?? product?.product_name ?? '';
  const defaultJual = product?.harga_jual ?? product?.selling_price ?? '';
  const defaultBeli = product?.harga_beli_terakhir ?? product?.last_purchase_price ?? '';
  const defaultStok = product?.stok ?? 0;

  // STYLE INPUT & LABEL (Konsisten dengan Tambah Produk)
  const inputClass = "mt-1 block w-full rounded-md border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm placeholder-gray-400 border";
  const labelClass = "block text-sm font-medium text-gray-900";

  return (
    // Container Kartu Putih
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      <div className="p-6 sm:p-8">
        <form action={dispatch} className="space-y-6">
          
          {/* 1. Nama Barang */}
          <div>
            <label htmlFor="nama_barang" className={labelClass}>
              Nama Barang
            </label>
            <input
              type="text"
              id="nama_barang"
              name="nama_barang"
              defaultValue={defaultNama}
              placeholder="Contoh: Daging Sapi Sirloin"
              className={inputClass}
            />
            {state.errors?.nama_barang && (
              <p className="mt-1 text-sm text-red-600">{state.errors.nama_barang[0]}</p>
            )}
          </div>

          {/* 2. Grid Harga (2 Kolom) */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Harga Beli */}
            <div>
              <label htmlFor="harga_beli_terakhir" className={labelClass}>
                Harga Beli (Rp)
              </label>
              <input
                type="number"
                id="harga_beli_terakhir"
                name="harga_beli_terakhir"
                defaultValue={defaultBeli}
                placeholder="0"
                className={inputClass}
              />
              {state.errors?.harga_beli_terakhir && (
                <p className="mt-1 text-sm text-red-600">{state.errors.harga_beli_terakhir[0]}</p>
              )}
            </div>

            {/* Harga Jual */}
            <div>
              <label htmlFor="harga_jual" className={labelClass}>
                Harga Jual (Rp)
              </label>
              <input
                type="number"
                id="harga_jual"
                name="harga_jual"
                defaultValue={defaultJual}
                placeholder="0"
                className={inputClass}
              />
              {state.errors?.harga_jual && (
                <p className="mt-1 text-sm text-red-600">{state.errors.harga_jual[0]}</p>
              )}
            </div>
          </div>

          {/* 3. Stok */}
          <div>
            <label htmlFor="stok" className={labelClass}>
              Stok (kg/unit)
            </label>
            <input
              type="number"
              id="stok"
              name="stok"
              defaultValue={defaultStok}
              placeholder="0"
              className={inputClass}
            />
            {state.errors?.stok && (
              <p className="mt-1 text-sm text-red-600">{state.errors.stok[0]}</p>
            )}
          </div>

          {/* Pesan Error Global */}
          {state.message && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <p className="text-sm text-red-700 font-medium">{state.message}</p>
            </div>
          )}

          {/* Tombol Submit */}
          <div className="flex justify-end pt-2">
            <SubmitButton label={product ? 'Simpan Perubahan' : 'Buat Produk'} />
          </div>
        </form>
      </div>
    </div>
  );
}