"use server";

import { z } from "zod";
import prisma from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// 1. Skema Validasi menggunakan Zod untuk data pelanggan.
// Skema ini mencocokkan model `customers` di `migration.sql`.
const CustomerSchema = z.object({
  id: z.string(), // ID akan datang sebagai string dari form/URL
  nama_pelanggan: z
    .string({ invalid_type_error: "Nama pelanggan harus berupa teks." })
    .min(3, { message: "Nama pelanggan minimal harus 3 karakter." }),
  kontak: z
    .string()
    .optional()
    .nullable()
    // Aturan refine memastikan bahwa jika kontak diisi, panjangnya minimal 8 karakter.
    // Ini mengizinkan field kontak untuk kosong atau null.
    .refine(
      (val) => val === null || val === undefined || val === "" || val.length >= 8,
      {
        message: "Kontak minimal 8 karakter jika diisi.",
      },
    ),
});

// Skema ini digunakan untuk form 'create' dan 'update' yang tidak menyertakan 'id'.
const FormCustomerSchema = CustomerSchema.omit({ id: true });

// 2. Definisi Tipe `State` untuk mengelola state form di sisi client.
// Ini membantu memberikan umpan balik (feedback) error yang jelas kepada pengguna.
export type State = {
  errors?: {
    nama_pelanggan?: string[];
    kontak?: string[];
  };
  message?: string | null;
};

/**
 * Server Action untuk MEMBUAT pelanggan baru.
 * @param prevState State sebelumnya dari form (digunakan oleh useActionState).
 * @param formData Data yang dikirim dari form.
 */
export async function createCustomerAction(prevState: State, formData: FormData) {
  // Validasi data form menggunakan skema Zod.
  const validatedFields = FormCustomerSchema.safeParse({
    nama_pelanggan: formData.get("nama_pelanggan"),
    kontak: formData.get("kontak"),
  });

  // Jika validasi gagal, kembalikan pesan error yang terstruktur.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Gagal membuat pelanggan. Mohon periksa kembali isian form.",
    };
  }

  // Jika validasi berhasil, lanjutkan untuk menyimpan data ke database.
  try {
    await prisma.customer.create({
      data: {
        nama_pelanggan: validatedFields.data.nama_pelanggan,
        kontak: validatedFields.data.kontak,
      },
    });
  } catch (error) {
    console.error("Database Error:", error);
    return {
      message: "Terjadi kesalahan pada database. Gagal membuat pelanggan.",
    };
  }

  // Setelah berhasil, revalidasi cache untuk halaman daftar pelanggan.
  revalidatePath("/dashboard/customers");
  // Arahkan pengguna kembali ke halaman daftar pelanggan.
  redirect("/dashboard/customers");
}

/**
 * Server Action untuk MENGUPDATE data pelanggan yang ada.
 * @param id ID pelanggan yang akan diupdate.
 * @param prevState State sebelumnya dari form.
 * @param formData Data baru dari form.
 */
export async function updateCustomerAction(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = FormCustomerSchema.safeParse({
    nama_pelanggan: formData.get("nama_pelanggan"),
    kontak: formData.get("kontak"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Gagal mengupdate pelanggan. Mohon periksa kembali isian form.",
    };
  }

  try {
    await prisma.customer.update({
      where: { id: BigInt(id) }, // Konversi ID dari string ke BigInt untuk pencocokan di DB
      data: {
        nama_pelanggan: validatedFields.data.nama_pelanggan,
        kontak: validatedFields.data.kontak,
      },
    });
  } catch (error) {
    console.error("Database Error:", error);
    return {
      message: "Terjadi kesalahan pada database. Gagal mengupdate pelanggan.",
    };
  }

  // Revalidasi cache untuk halaman daftar dan halaman edit.
  revalidatePath("/dashboard/customers");
  revalidatePath(`/dashboard/customers/${id}/edit`);
  // Redirect ke halaman daftar.
  redirect("/dashboard/customers");
}

/**
 * Server Action untuk MENGHAPUS seorang pelanggan.
 * @param id ID pelanggan yang akan dihapus.
 */
export async function deleteCustomerAction(id: string) {
    try {
        await prisma.customer.delete({
            where: { id: BigInt(id) },
        });
        // Revalidasi cache agar daftar pelanggan di UI terupdate.
        revalidatePath("/dashboard/customers");
        return { message: "Pelanggan berhasil dihapus." };
    } catch (error) {
        console.error("Database Error:", error);
        // Tangani kasus di mana pelanggan tidak dapat dihapus karena terikat dengan data lain (misalnya, penjualan).
        // @ts-ignore
        if (error.code === 'P2003') { // Kode error Prisma untuk foreign key constraint failure
             return { message: "Gagal menghapus. Pelanggan ini sudah memiliki riwayat transaksi." };
        }
        return { message: "Terjadi kesalahan pada database. Gagal menghapus pelanggan." };
    }
}
