"use client";

import { useActionState } from "react";
import type { State } from "@/app/lib/actions/supplier.actions.ts";

// Tipe supplier yang diserialisasi
export type SerializedSupplier = {
  id: string;
  nama_supplier: string;
  kontak?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

// Komponen tombol submit (sama seperti di ProductForm)
function SubmitButton({ label, pending }: { label: string; pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-md px-4 py-2 text-sm font-medium text-white
        ${pending ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
    >
      {pending ? "Menyimpan..." : label}
    </button>
  );
}

// Komponen Form Utama
export default function SupplierForm({
  action,
  supplier,
}: {
  action: (prevState: State, formData: FormData) => Promise<State>;
  supplier?: SerializedSupplier | null;
}) {
  const initialState: State = { message: null, errors: {} };
  const [state, dispatch, pending] = useActionState(action, initialState) as [
    State,
    any,
    boolean,
  ];

  return (
    <form
      action={dispatch}
      className="space-y-6 rounded-lg bg-white p-6 shadow-md"
    >
      {/* Input Nama Supplier */}
      <div>
        <label
          htmlFor="nama_supplier"
          className="block text-sm font-medium text-gray-700"
        >
          Nama Supplier
        </label>
        <input
          type="text"
          id="nama_supplier"
          name="nama_supplier"
          defaultValue={supplier?.nama_supplier}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
          aria-describedby="nama-error"
        />
        <div id="nama-error" aria-live="polite" aria-atomic="true">
          {state.errors?.nama_supplier &&
            state.errors.nama_supplier.map((error: string) => (
              <p className="mt-1 text-xs text-red-600" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>

      {/* Input Kontak */}
      <div>
        <label
          htmlFor="kontak"
          className="block text-sm font-medium text-gray-700"
        >
          Kontak (No. HP/Email)
        </label>
        <input
          type="text"
          id="kontak"
          name="kontak"
          defaultValue={supplier?.kontak ?? ''}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
          aria-describedby="kontak-error"
        />
        <div id="kontak-error" aria-live="polite" aria-atomic="true">
          {state.errors?.kontak &&
            state.errors.kontak.map((error: string) => (
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
        <SubmitButton
          label={supplier ? "Update Supplier" : "Tambah Supplier"}
          pending={pending}
        />
      </div>
    </form>
  );
}