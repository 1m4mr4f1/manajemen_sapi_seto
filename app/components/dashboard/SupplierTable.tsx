"use client";

import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { type SerializedSupplier } from './SupplierForm';
import { deleteSupplierAction } from '@/app/lib/actions/supplier.actions.ts';
import { useFormStatus } from 'react-dom'; // <-- 1. Hapus useFormState
import { useEffect, useActionState } from 'react'; // <-- 2. Impor useActionState

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-label="Hapus supplier">
      {pending ? (
        <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-500"></span>
      ) : (
        <Trash2 className="h-4 w-4 text-red-600 hover:text-red-800" />
      )}
    </button>
  );
}

// Komponen kecil untuk form hapus
function DeleteSupplierForm({ id }: { id: string }) {
  const initialState = { message: null };
  // 3. Ganti useFormState menjadi useActionState
  const [state, dispatch] = useActionState(
    deleteSupplierAction.bind(null, id),
    initialState,
  );

  useEffect(() => {
    if (state?.message && !state.message.includes('berhasil')) {
      alert(`Error: ${state.message}`);
    }
  }, [state]);

  return (
    <form action={dispatch}>
      <DeleteButton />
    </form>
  );
}

export default function SupplierTable({
  suppliers,
}: {
  suppliers: SerializedSupplier[];
}) {
  return (
    <div className="overflow-x-auto rounded-lg bg-white shadow-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Nama Supplier
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Kontak
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Bergabung Sejak
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white text-gray-900">
          {suppliers.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                Tidak ada data supplier.
              </td>
            </tr>
          ) : (
            suppliers.map((s) => (
              <tr key={s.id}>
                <td className="whitespace-nowrap px-6 py-4">
                  {s.nama_supplier}
                </td>
                <td className="whitespace-nowrap px-6 py-4">{s.kontak ?? '-'}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  {s.createdAt
                    ? new Date(s.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : '-'}
                </td>
                <td className="flex items-center justify-end gap-4 whitespace-nowrap px-6 py-4">
                  <Link
                    href={`/dashboard/suppliers/${s.id}/edit`}
                    aria-label="Edit supplier"
                  >
                    <Pencil className="h-4 w-4 text-blue-600 hover:text-blue-800" />
                  </Link>
                  <DeleteSupplierForm id={s.id} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}