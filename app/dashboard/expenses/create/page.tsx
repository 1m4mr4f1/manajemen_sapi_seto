import ExpenseForm from "@/app/components/dashboard/ExpenseForm";
import { createExpenseAction } from "@/app/lib/actions/expense.actions";

export default function CreateExpensePage() {
  return (
    <div className="w-full max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Catat Pengeluaran Baru
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Isi formulir di bawah untuk mencatat pengeluaran.
        </p>
      </div>
      <ExpenseForm action={createExpenseAction} />
    </div>
  );
}
