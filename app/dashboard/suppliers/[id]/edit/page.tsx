import React from 'react';
import { notFound } from 'next/navigation';
import { getSupplierById } from '@/app/lib/data/supplier.data';
import { updateSupplierAction } from '@/app/lib/actions/supplier.actions';
import SupplierForm from '@/app/components/dashboard/SupplierForm';

// ...existing code...
// ...existing code...
export default async function EditSupplierPage({
  params,
}: {
  // params bisa Promise di Next 16, terima kedua bentuk
  params: { id?: string } | Promise<{ id?: string }>;
}) {
  // unwrap params yang mungkin Promise
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  // Guard: pastikan id ada
  if (!id) return notFound();

  // Ambil supplier; jika tidak ada atau terjadi error -> notFound()/debug
  let supplier;
  try {
    supplier = await getSupplierById(id);
  } catch (err) {
    console.error('getSupplierById error:', err);
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold">Debug getSupplierById error</h2>
        <pre className="mt-4 text-sm text-red-600">{String(err)}</pre>
        <p className="mt-4">params.id: {String(id)}</p>
      </div>
    );
  }

  if (!supplier) {
    console.error('Supplier not found for id:', id);
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold">Debug: Supplier not found</h2>
        <p className="mt-2">Requested id: <strong>{String(id)}</strong></p>
        <p className="mt-2">Cek tabel suppliers di database, pastikan record dengan id ini ada.</p>
      </div>
    );
  }

  // ...existing code...
  const serializedSupplier = {
    ...supplier,
    id: String(supplier.id),
    createdAt: supplier.createdAt ? new Date(supplier.createdAt).toISOString() : null,
    updatedAt: supplier.updatedAt ? new Date(supplier.updatedAt).toISOString() : null,
  };

  const updateActionWithId = updateSupplierAction.bind(null, String(supplier.id));

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-800">
        Edit Supplier: {supplier.nama_supplier}
      </h1>

      <SupplierForm action={updateActionWithId} supplier={serializedSupplier} />
    </div>
  );
}
// ...existing code...
