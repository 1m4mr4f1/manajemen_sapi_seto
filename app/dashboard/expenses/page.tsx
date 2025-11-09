import Link from "next/link";
import ExpenseTable from "@/app/components/dashboard/ExpenseTable";
import { fetchExpenses } from "@/app/lib/data/expense.data";
import { Plus } from "lucide-react";

export default async function ExpensesPage() {
  const expenses = await fetchExpenses();

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Daftar Pengeluaran</h1>
        <Link
          href="/dashboard/expenses/create"
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Catat Pengeluaran</span>
        </Link>
      </div>

      <div className="mt-6">
        <ExpenseTable expenses={expenses} />
      </div>
    </div>
  );
}
