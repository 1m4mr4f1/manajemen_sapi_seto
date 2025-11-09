"use client";

import { useActionState } from "react";
import type { State } from "@/app/lib/actions/expense.actions";

// Tipe pengeluaran yang diserialisasi
export type SerializedExpense = {
  id: string;
  userId: string;
  tanggal_pengeluaran: string;
  jenis_pengeluaran: string;
  nominal: number;
  keterangan?: string | null;
  createdAt: string;
  updatedAt: string;
};

// Komponen tombol submit
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
export default function ExpenseForm({
  action,
  expense,
}: {
  action: (prevState: State, formData: FormData) => Promise<State>;
  expense?: SerializedExpense | null;
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
      {/* Tanggal Pengeluaran */}
      <div>
        <label
          htmlFor="tanggal_pengeluaran"
          className="block text-sm font-medium text-gray-700"
        >
          Tanggal Pengeluaran
        </label>
        <input
          type="date"
          id="tanggal_pengeluaran"
          name="tanggal_pengeluaran"
          defaultValue={
            expense ? expense.tanggal_pengeluaran.split("T")[0] : ""
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
          aria-describedby="tanggal-error"
        />
        <div id="tanggal-error" aria-live="polite" aria-atomic="true">
          {state.errors?.tanggal_pengeluaran?.map((error: string) => (
            <p className="mt-1 text-xs text-red-600" key={error}>
              {error}
            </p>
          ))}
        </div>
      </div>

      {/* Jenis Pengeluaran */}
      <div>
        <label
          htmlFor="jenis_pengeluaran"
          className="block text-sm font-medium text-gray-700"
        >
          Jenis Pengeluaran
        </label>
        <input
          type="text"
          id="jenis_pengeluaran"
          name="jenis_pengeluaran"
          defaultValue={expense?.jenis_pengeluaran}
          placeholder="Contoh: Biaya Listrik, Sewa Toko"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
          aria-describedby="jenis-error"
        />
        <div id="jenis-error" aria-live="polite" aria-atomic="true">
          {state.errors?.jenis_pengeluaran?.map((error: string) => (
            <p className="mt-1 text-xs text-red-600" key={error}>
              {error}
            </p>
          ))}
        </div>
      </div>

      {/* Nominal */}
      <div>
        <label
          htmlFor="nominal"
          className="block text-sm font-medium text-gray-700"
        >
          Nominal (Rp)
        </label>
        <input
          type="number"
          id="nominal"
          name="nominal"
          defaultValue={expense?.nominal}
          placeholder="Contoh: 500000"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
          aria-describedby="nominal-error"
        />
        <div id="nominal-error" aria-live="polite" aria-atomic="true">
          {state.errors?.nominal?.map((error: string) => (
            <p className="mt-1 text-xs text-red-600" key={error}>
              {error}
            </p>
          ))}
        </div>
      </div>

      {/* Keterangan */}
      <div>
        <label
          htmlFor="keterangan"
          className="block text-sm font-medium text-gray-700"
        >
          Keterangan (Opsional)
        </label>
        <textarea
          id="keterangan"
          name="keterangan"
          rows={3}
          defaultValue={expense?.keterangan ?? ""}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
        />
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
          label={expense ? "Update Pengeluaran" : "Simpan Pengeluaran"}
          pending={pending}
        />
      </div>
    </form>
  );
}
