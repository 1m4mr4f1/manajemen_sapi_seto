"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { type SerializedExpense } from "./ExpenseForm";
import { deleteExpenseAction } from "@/app/lib/actions/expense.actions";
import { useFormStatus } from "react-dom";
import { useEffect, useActionState } from "react";

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-label="Hapus pengeluaran">
      {pending ? (
        <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-500"></span>
      ) : (
        <Trash2 className="h-4 w-4 text-red-600 hover:text-red-800" />
      )}
    </button>
  );
}

// Form hapus
function DeleteExpenseForm({ id }: { id: string }) {
  const initialState = { message: null };
  const [state, dispatch] = useActionState(
    deleteExpenseAction.bind(null, id),
    initialState,
  );

  useEffect(() => {
    if (state?.message && !state.message.includes("berhasil")) {
      alert(`Error: ${state.message}`);
    }
  }, [state]);

  return (
    <form action={dispatch}>
      <DeleteButton />
    </form>
  );
}

export default function ExpenseTable({
  expenses,
}: {
  expenses: SerializedExpense[];
}) {
  return (
    <div className="overflow-x-auto rounded-lg bg-white shadow-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Tanggal
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Jenis Pengeluaran
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Nominal
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white text-gray-900">
          {expenses.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                Tidak ada data pengeluaran.
              </td>
            </tr>
          ) : (
            expenses.map((e) => (
              <tr key={e.id}>
                <td className="whitespace-nowrap px-6 py-4">
                  {new Date(e.tanggal_pengeluaran).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {e.jenis_pengeluaran}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(e.nominal)}
                </td>
                <td className="flex items-center justify-end gap-4 whitespace-nowrap px-6 py-4">
                  <Link
                    href={`/dashboard/expenses/${e.id}/edit`}
                    aria-label="Edit pengeluaran"
                  >
                    <Pencil className="h-4 w-4 text-blue-600 hover:text-blue-800" />
                  </Link>
                  <DeleteExpenseForm id={e.id} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
