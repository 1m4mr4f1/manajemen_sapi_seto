"use server";

import prisma from "@/app/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";

/**
 * Mengambil semua data pelanggan dari database.
 * Data diurutkan berdasarkan nama pelanggan.
 * Fungsi ini menggunakan `noStore()` untuk memastikan data selalu segar.
 */
export async function fetchCustomers() {
  noStore(); // Mencegah caching data ini

  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        nama_pelanggan: "asc",
      },
    });

    // Serialisasi data: Mengubah BigInt `id` menjadi string agar aman
    // untuk dikirim dari Server Component ke Client Component.
    return customers.map((customer) => ({
      ...customer,
      id: customer.id.toString(),
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil data pelanggan.");
  }
}

/**
 * Mengambil satu data pelanggan berdasarkan ID.
 * Berguna untuk halaman edit.
 * @param id ID pelanggan dalam format string.
 */
export async function fetchCustomerById(id: string) {
  noStore();

  try {
    const customer = await prisma.customer.findUnique({
      where: {
        id: BigInt(id), // Konversi string ID ke BigInt untuk query
      },
    });

    if (!customer) {
      return null; // Kembalikan null jika pelanggan tidak ditemukan
    }

    // Serialisasi data agar aman dikirim ke Client Component
    return {
      ...customer,
      id: customer.id.toString(),
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil data pelanggan.");
  }
}
