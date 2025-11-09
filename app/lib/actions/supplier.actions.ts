'use server';

import { z } from 'zod';
import {
  createSupplier,
  deleteSupplier,
  updateSupplier,
} from '@/app/lib/data/supplier.data.ts';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Skema validasi disesuaikan untuk supplier
const SupplierSchema = z.object({
  nama_supplier: z
    .string()
    .min(3, { message: 'Nama supplier minimal 3 karakter' }),
  kontak: z.string().max(100).optional().nullable(), // Boleh kosong atau null
});

// Tipe State untuk error handling
export type State = {
  errors?: {
    nama_supplier?: string[];
    kontak?: string[];
  };
  message?: string | null;
};

/**
 * SERVER ACTION: Create Supplier
 */
export async function createSupplierAction(prevState: State, formData: FormData) {
  // 1. Validasi data
  const validatedFields = SupplierSchema.safeParse({
    nama_supplier: formData.get('nama_supplier'),
    kontak: formData.get('kontak'),
  });

  // 2. Jika validasi gagal
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Gagal membuat supplier. Mohon periksa isian Anda.',
    };
  }

  // 3. Panggil model untuk simpan ke DB
  try {
    await createSupplier(validatedFields.data);
  } catch (error) {
    console.error('Error createSupplierAction:', error);
    return {
      message: 'Database Error: Gagal membuat supplier.',
    };
  }

  // 4. Revalidasi cache & Redirect
  revalidatePath('/dashboard/suppliers');
  revalidatePath('/dashboard');
  redirect('/dashboard/suppliers');
}

/**
 * SERVER ACTION: Update Supplier
 */
export async function updateSupplierAction(
  id: string,
  prevState: State,
  formData: FormData,
) {
  // 1. Validasi
  const validatedFields = SupplierSchema.safeParse({
    nama_supplier: formData.get('nama_supplier'),
    kontak: formData.get('kontak'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Gagal mengupdate supplier. Mohon periksa isian Anda.',
    };
  }

  // 2. Panggil model
  try {
    await updateSupplier(id, validatedFields.data);
  } catch (error) {
    console.error('Error updateSupplierAction:', error);
    return {
      message: 'Database Error: Gagal mengupdate supplier.',
    };
  }

  // 3. Revalidasi & Redirect
  revalidatePath('/dashboard/suppliers');
  revalidatePath('/dashboard');
  revalidatePath(`/dashboard/suppliers/${id}/edit`);
  redirect('/dashboard/suppliers');
}

/**
 * SERVER ACTION: Delete Supplier
 */
export async function deleteSupplierAction(id: string) {
  try {
    await deleteSupplier(id);
    revalidatePath('/dashboard/suppliers');
    revalidatePath('/dashboard');
    return { message: 'Supplier berhasil dihapus.' };
  } catch (error) { // <-- Tambahkan { di sini
    console.error('Error deleteSupplierAction:', error);
    return { message: 'Database Error: Gagal menghapus supplier.' };
  } // <-- Tambahkan } di sini
}
