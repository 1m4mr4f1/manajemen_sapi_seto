"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { type SerializedCustomer } from "./CustomerForm";
import { deleteCustomerAction } from "@/app/lib/actions/customer.actions"; // Anda perlu membuat file actions ini
import { useFormStatus } from "react-dom";
import { useEffect, useActionState } from "react";

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-label="Hapus pelanggan">
      {pending ? (
        <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-500"></span>
      ) : (
        <Trash2 className="h-4 w-4 text-red-600 hover:text-red-800" />
      )}
    </button>
  );
}

// Komponen kecil untuk form hapus
function DeleteCustomerForm({ id }: { id: string }) {
  const initialState = { message: null };
  const [state, dispatch] = useActionState(
    deleteCustomerAction.bind(null, id),
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

export default function CustomerTable({
  customers,
}: {
  customers: SerializedCustomer[];
}) {
  return (
    <div className="overflow-x-auto rounded-lg bg-white shadow-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Nama Pelanggan
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Kontak
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Tanggal Daftar
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white text-gray-900">
          {customers.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                Tidak ada data pelanggan.
              </td>
            </tr>
          ) : (
            customers.map((c) => (
              <tr key={c.id}>
                <td className="whitespace-nowrap px-6 py-4">
                  {c.nama_pelanggan}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {c.kontak ?? "-"}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {c.createdAt
                    ? new Date(c.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </td>
                <td className="flex items-center justify-end gap-4 whitespace-nowrap px-6 py-4">
                  <Link
                    href={`/dashboard/customers/${c.id}/edit`}
                    aria-label="Edit pelanggan"
                  >
                    <Pencil className="h-4 w-4 text-blue-600 hover:text-blue-800" />
                  </Link>
                  <DeleteCustomerForm id={c.id} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
