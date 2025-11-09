import SupplierForm from '@/app/components/dashboard/SupplierForm';
import { createSupplierAction } from '@/app/lib/actions/supplier.actions.ts';

export default function CreateSupplierPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-800">
        Tambah Supplier Baru
      </h1>
      
      {/* Form ini adalah Client Component, 
        tapi action-nya adalah Server Action.
      */}
      <SupplierForm action={createSupplierAction} />
    </div>
  );
}