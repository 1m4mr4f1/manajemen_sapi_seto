import CustomerForm from "@/app/components/dashboard/CustomerForm";
import { updateCustomerAction } from "@/app/lib/actions/customer.actions";
import { fetchCustomerById } from "@/app/lib/data/customer.data";
import { notFound } from "next/navigation";

export default async function EditCustomerPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;

  // 1. Ambil data pelanggan berdasarkan ID
  const customer = await fetchCustomerById(id);

  // 2. Jika pelanggan tidak ditemukan, tampilkan halaman 404
  if (!customer) {
    notFound();
  }

  // 3. Bind `updateCustomerAction` dengan ID pelanggan
  const updateActionWithId = updateCustomerAction.bind(null, id);

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Pelanggan</h1>
        <p className="mt-1 text-sm text-gray-600">
          Ubah data pelanggan di bawah ini.
        </p>
      </div>

      {/*
        Form diisi dengan data `customer` yang sudah ada dan
        diberi server action `updateActionWithId`.
      */}
      <CustomerForm customer={customer} action={updateActionWithId} />
    </div>
  );
}
