import { getSuppliers } from '@/app/lib/data/supplier.data.ts';
import SupplierTable from '@/app/components/dashboard/SupplierTable.tsx';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Supplier } from '@prisma/client'; // Impor tipe asli

export default async function SuppliersPage() {
  
  // 1. Panggil Model
  const suppliers = await getSuppliers();

  // 2. Serialize data (Mirip products, tapi lebih sederhana)
  const serializedSuppliers = suppliers.map((s: Supplier) => ({
    ...s,
    id: String(s.id), // Ubah BigInt jadi String
    // kontak sudah string | null
    // nama_supplier sudah string
    createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : null,
    updatedAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : null,
  }));

  // 3. Controller memutuskan apa yang akan ditampilkan
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Manajemen Supplier</h1>
        <Link
          href="/dashboard/suppliers/create"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Supplier</span>
        </Link>
      </div>

      {/* 4. Teruskan data ke View untuk di-render */}
      <SupplierTable suppliers={serializedSuppliers} />
    </div>
  );
}