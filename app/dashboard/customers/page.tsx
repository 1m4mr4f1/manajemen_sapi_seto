import Link from "next/link";
import CustomerTable from "@/app/components/dashboard/CustomerTable";
import { fetchCustomers } from "@/app/lib/data/customer.data";
import { Plus } from "lucide-react";

export default async function CustomersPage() {
  // 1. Mengambil data pelanggan dari database
  const customers = await fetchCustomers();

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Daftar Pelanggan</h1>
        <Link
          href="/dashboard/customers/create"
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Pelanggan</span>
        </Link>
      </div>

      <div className="mt-6">
        {/* 2. Menampilkan data dalam komponen tabel */}
        <CustomerTable customers={customers} />
      </div>
    </div>
  );
}
