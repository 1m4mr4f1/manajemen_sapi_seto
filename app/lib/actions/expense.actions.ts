"use server";

import { z } from "zod";
import prisma from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const ExpenseSchema = z.object({
  id: z.string(),

  userId: z.bigint().default(BigInt(1)), // Default ini sebenarnya tidak terpakai jika userId tidak ada di input form
  tanggal_pengeluaran: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Tanggal pengeluaran harus diisi.",
  }),
  jenis_pengeluaran: z
    .string({ invalid_type_error: "Jenis pengeluaran harus berupa teks." })
    .min(3, { message: "Jenis pengeluaran minimal 3 karakter." }),
  nominal: z.coerce // Mengubah string dari form menjadi number
    .number({ invalid_type_error: "Nominal harus berupa angka." })
    .positive({ message: "Nominal harus lebih besar dari 0." }),
  keterangan: z.string().optional().nullable(),
});

// Skema untuk form 'create' dan 'update' yang tidak menyertakan 'id'.
const FormExpenseSchema = ExpenseSchema.omit({ id: true, userId: true }); // userId juga diomit dari form, karena akan diisi manual di action

// 2. Definisi Tipe `State` untuk feedback form.
export type State = {
  errors?: {
    tanggal_pengeluaran?: string[];
    jenis_pengeluaran?: string[];
    nominal?: string[];
    keterangan?: string[];
  };
  message?: string | null;
};

/**
 * Server Action untuk MEMBUAT pengeluaran baru.
 */
export async function createExpenseAction(
  prevState: State,
  formData: FormData,
) {
  // Validasi data form.
  const validatedFields = FormExpenseSchema.safeParse({
    tanggal_pengeluaran: formData.get("tanggal_pengeluaran"),
    jenis_pengeluaran: formData.get("jenis_pengeluaran"),
    nominal: formData.get("nominal"),
    keterangan: formData.get("keterangan"),
  });

  // Jika validasi gagal, kembalikan errors.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Gagal mencatat pengeluaran. Mohon periksa kembali isian form.",
    };
  }

  const { tanggal_pengeluaran, ...data } = validatedFields.data;

  // Simpan data ke database.
  try {
    await prisma.expense.create({
      data: {
        ...data,
        userId: BigInt(1), // <<< PERBAIKAN: Secara eksplisit menambahkan userId
        tanggal_pengeluaran: new Date(tanggal_pengeluaran),
      },
    });
  } catch (error) {
    console.error("Database Error:", error);
    return {
      message: "Terjadi kesalahan pada database. Gagal mencatat pengeluaran.",
    };
  }

  revalidatePath("/dashboard/expenses");
  redirect("/dashboard/expenses");
}

/**
 * Server Action untuk MENGUPDATE data pengeluaran.
 */
export async function updateExpenseAction(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = FormExpenseSchema.safeParse({
    tanggal_pengeluaran: formData.get("tanggal_pengeluaran"),
    jenis_pengeluaran: formData.get("jenis_pengeluaran"),
    nominal: formData.get("nominal"),
    keterangan: formData.get("keterangan"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message:
        "Gagal mengupdate pengeluaran. Mohon periksa kembali isian form.",
    };
  }

  const { tanggal_pengeluaran, ...data } = validatedFields.data;

  try {
    await prisma.expense.update({
      where: { id: BigInt(id) },
      data: {
        ...data,
        userId: BigInt(1), // <<< PERBAIKAN: Secara eksplisit menambahkan userId
        tanggal_pengeluaran: new Date(tanggal_pengeluaran),
      },
    });
  } catch (error) {
    console.error("Database Error:", error);
    return {
      message: "Terjadi kesalahan pada database. Gagal mengupdate pengeluaran.",
    };
  }

  revalidatePath("/dashboard/expenses");
  revalidatePath(`/dashboard/expenses/${id}/edit`);
  redirect("/dashboard/expenses");
}

/**
 * Server Action untuk MENGHAPUS pengeluaran.
 */
export async function deleteExpenseAction(id: string) {
  try {
    await prisma.expense.delete({
      where: { id: BigInt(id) },
    });
    revalidatePath("/dashboard/expenses");
    return { message: "Pengeluaran berhasil dihapus." };
  } catch (error) {
    console.error("Database Error:", error);
    return {
      message: "Terjadi kesalahan pada database. Gagal menghapus pengeluaran.",
    };
  }
}
