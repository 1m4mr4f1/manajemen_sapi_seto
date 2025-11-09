import CustomerForm from "@/app/components/dashboard/CustomerForm";
import { createCustomerAction } from "@/app/lib/actions/customer.actions";

export default function CreateCustomerPage() {
  return (
    <div className="w-full max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Tambah Pelanggan Baru
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Isi formulir di bawah ini untuk menambahkan data pelanggan baru.
        </p>
      </div>
      {/*
        Memberikan server action `createCustomerAction` ke form.
        Form ini tidak memiliki data `customer` awal.
      */}
      <CustomerForm action={createCustomerAction} />
    </div>
  );
}
