import ExpenseForm from "@/app/components/dashboard/ExpenseForm";
import { updateExpenseAction } from "@/app/lib/actions/expense.actions";
import { fetchExpenseById } from "@/app/lib/data/expense.data";
import { notFound } from "next/navigation";

export default async function EditExpensePage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;
  const expense = await fetchExpenseById(id);

  if (!expense) {
    notFound();
  }

  const updateActionWithId = updateExpenseAction.bind(null, id);

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Pengeluaran</h1>
        <p className="mt-1 text-sm text-gray-600">
          Ubah data pengeluaran di bawah ini.
        </p>
      </div>
      <ExpenseForm expense={expense} action={updateActionWithId} />
    </div>
  );
}
