'use server';

import { z } from 'zod';
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from '@/app/lib/data/product.data';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';

// Skema Validasi (Tetap gunakan nama input form HTML Anda, misal: 'nama_barang')
const ProductSchema = z.object({
  nama_barang: z.string().min(3, { message: 'Nama barang minimal 3 karakter' }),
  stok: z.coerce.number().gte(0, { message: 'Stok tidak boleh negatif' }),
  harga_jual: z.coerce
    .number()
    .gt(0, { message: 'Harga jual harus lebih dari 0' })
    .transform((val) => new Prisma.Decimal(val)),
  harga_beli_terakhir: z.coerce
    .number()
    .gt(0, { message: 'Harga beli harus lebih dari 0' })
    .transform((val) => new Prisma.Decimal(val)),
});

// Tipe State untuk error handling
export type State = {
  errors?: {
    nama_barang?: string[];
    stok?: string[];
    harga_jual?: string[];
    harga_beli_terakhir?: string[];
  };
  message?: string | null;
};

/**
 * SERVER ACTION: Create Product
 */
export async function createProductAction(prevState: State, formData: FormData) {
  // 1. Validasi data form (Input HTML)
  const validatedFields = ProductSchema.safeParse({
    nama_barang: formData.get('nama_barang'),
    stok: formData.get('stok'),
    harga_jual: formData.get('harga_jual'),
    harga_beli_terakhir: formData.get('harga_beli_terakhir'),
  });

  // 2. Jika validasi gagal, kembalikan error ke form
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Gagal membuat produk. Mohon periksa isian Anda.',
    };
  }

  // 3. Panggil model untuk simpan ke DB
  try {
    // PERBAIKAN UTAMA: Mapping dari Zod (Indo) ke Prisma (Inggris)
    await createProduct({
      product_name: validatedFields.data.nama_barang,       // Mapping ke DB
      stock: validatedFields.data.stok,                     // Mapping ke DB
      selling_price: validatedFields.data.harga_jual,       // Mapping ke DB
      last_purchase_price: validatedFields.data.harga_beli_terakhir, // Mapping ke DB
    });
  } catch (error) {
    console.error('Error createProductAction:', error);
    return {
      message: 'Database Error: Gagal membuat produk.',
    };
  }

  // 4. Revalidasi cache & Redirect
  revalidatePath('/dashboard/products');
  revalidatePath('/dashboard');
  redirect('/dashboard/products');
}

/**
 * SERVER ACTION: Update Product
 */
export async function updateProductAction(
  id: string,
  prevState: State,
  formData: FormData,
) {
  // 1. Validasi
  const validatedFields = ProductSchema.safeParse({
    nama_barang: formData.get('nama_barang'),
    stok: formData.get('stok'),
    harga_jual: formData.get('harga_jual'),
    harga_beli_terakhir: formData.get('harga_beli_terakhir'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Gagal mengupdate produk. Mohon periksa isian Anda.',
    };
  }

  // 2. Panggil model
  try {
    // PERBAIKAN UTAMA: Mapping dari Zod (Indo) ke Prisma (Inggris)
    await updateProduct(id, {
      product_name: validatedFields.data.nama_barang,
      stock: validatedFields.data.stok,
      selling_price: validatedFields.data.harga_jual,
      last_purchase_price: validatedFields.data.harga_beli_terakhir,
    });
  } catch (error) {
    console.error('Error updateProductAction:', error);
    return {
      message: 'Database Error: Gagal mengupdate produk.',
    };
  }

  // 3. Revalidasi & Redirect
  revalidatePath('/dashboard/products');
  revalidatePath('/dashboard');
  // revalidatePath(`/dashboard/products/${id}/edit`); // Opsional
  redirect('/dashboard/products');
}

/**
 * SERVER ACTION: Delete Product
 */
export async function deleteProductAction(id: string) {
  try {
    await deleteProduct(id);
    revalidatePath('/dashboard/products');
    revalidatePath('/dashboard');
    return { message: 'Produk berhasil dihapus.' };
  } catch (error) {
    console.error('Error deleteProductAction:', error);
    return { message: 'Database Error: Gagal menghapus produk.' };
  }
}