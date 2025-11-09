"use server";

import prisma from "@/app/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";

/**
 * Mengambil semua data pengeluaran dari database.
 * Data diurutkan berdasarkan tanggal pengeluaran (terbaru dulu).
 */
export async function fetchExpenses() {
  noStore(); // Mencegah caching data

  try {
    const expenses = await prisma.expense.findMany({
      orderBy: {
        tanggal_pengeluaran: "desc",
      },
    });

    // Serialisasi data agar aman dikirim ke Client Component.
    // BigInt -> string, Decimal -> number, Date -> string
    return expenses.map((expense) => ({
      ...expense,
      id: expense.id.toString(),
      userId: expense.userId.toString(),
      nominal: expense.nominal.toNumber(), // Convert Decimal to number
      tanggal_pengeluaran: expense.tanggal_pengeluaran.toISOString(),
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil data pengeluaran.");
  }
}

/**
 * Mengambil satu data pengeluaran berdasarkan ID.
 * Berguna untuk halaman edit.
 * @param id ID pengeluaran dalam format string.
 */
export async function fetchExpenseById(id: string) {
  noStore();

  try {
    const expense = await prisma.expense.findUnique({
      where: {
        id: BigInt(id), // Konversi string ID ke BigInt untuk query
      },
    });

    if (!expense) {
      return null; // Kembalikan null jika tidak ditemukan
    }

    // Serialisasi data
    return {
      ...expense,
      id: expense.id.toString(),
      userId: expense.userId.toString(),
      nominal: expense.nominal.toNumber(),
      tanggal_pengeluaran: expense.tanggal_pengeluaran.toISOString(),
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil data pengeluaran.");
  }
}
