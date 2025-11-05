'use server';

import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { createSale } from '@/app/lib/data/sale.data';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const SaleItem = z.object({
  productId: z.string(),
  jumlah: z.coerce.number().int().min(1),
  harga_saat_jual: z.coerce.number().gt(0).transform((v) => new Prisma.Decimal(v)),
});

const SaleSchema = z.object({
  userId: z.string(),
  customerId: z.string().nullable().optional(),
  tanggal_penjualan: z.string().optional(),
  items: z.array(SaleItem).min(1),
  subtotal: z.coerce.number().gt(0).transform((v) => new Prisma.Decimal(v)),
  discount: z.coerce.number().min(0).transform((v) => new Prisma.Decimal(v)),
  total_akhir: z.coerce.number().gt(0).transform((v) => new Prisma.Decimal(v)),
  status_pembayaran: z.enum(['lunas', 'belum_lunas']),
  note: z.string().optional().nullable(),
});

export type SaleState = {
  message?: string | null;
  errors?: Record<string, string[]>;
  redirectTo?: string;
};

export async function createSaleAction(prev: SaleState, formData: FormData) {
  const session: any = await getServerSession(authOptions as any);
  if (!session || !session.user || !session.user.id) {
    return { message: 'Unauthorized: user not authenticated' } as SaleState;
  }
  const userIdFromSession = String(session.user.id);

  // parse items safely first to give clearer errors
  // Now server computes items/subtotal/total from minimal inputs
  const productId = String(formData.get('productId') || '');
  const jumlahRaw = formData.get('jumlah');
  const discountRaw = formData.get('discount');
  const tanggalRaw = formData.get('tanggal_penjualan');

  const jumlah = jumlahRaw != null && String(jumlahRaw) !== '' ? Number(jumlahRaw) : null;
  const discountPercent = discountRaw != null && String(discountRaw) !== '' ? Number(discountRaw) : 0;

  if (!productId) {
    return { errors: { productId: ['Product harus dipilih'] }, message: 'Validasi gagal' };
  }
  if (jumlah == null || isNaN(jumlah) || jumlah < 1) {
    return { errors: { jumlah: ['Jumlah tidak valid'] }, message: 'Validasi gagal' };
  }

  // fetch product harga
  try {
    const { getProductById } = await import('@/app/lib/data/product.data');
    const product = await getProductById(productId);
    if (!product) return { message: 'Produk tidak ditemukan' } as SaleState;

    const harga = Number(product.harga_jual);
    const subtotal = harga * jumlah;
    const discountAmount = subtotal * (discountPercent / 100);
    const total_akhir = subtotal - discountAmount;

    const items = [{ productId: productId, jumlah: jumlah, harga_saat_jual: new Prisma.Decimal(harga) }];

    // prepare payload
    // convert tanggal_penjualan to JS Date (handle missing timezone) or default to now
    let tanggalObj: Date | undefined = undefined;
    if (tanggalRaw && String(tanggalRaw) !== '') {
      tanggalObj = new Date(String(tanggalRaw));
      if (isNaN(tanggalObj.getTime())) {
        // invalid date string -> fallback to current server time
        tanggalObj = new Date();
      }
    } else {
      tanggalObj = new Date();
    }

    const payload = {
      userId: userIdFromSession,
      customerId: null,
      tanggal_penjualan: tanggalObj,
      items,
      subtotal: new Prisma.Decimal(subtotal),
      discount: new Prisma.Decimal(discountAmount ?? 0),
      total_akhir: new Prisma.Decimal(total_akhir),
      status_pembayaran: String(formData.get('status_pembayaran') || 'belum_lunas'),
      note: null,
    } as any;

    // call createSale
    try {
      await createSale(payload);
    } catch (err: any) {
      console.error('Error createSaleAction (during createSale):', err);
      return { message: 'Gagal membuat sale (db error)' } as SaleState;
    }

    revalidatePath('/dashboard/sales');
    // Return a redirect instruction to client instead of calling redirect() which throws NEXT_REDIRECT
    return { redirectTo: '/dashboard/sales' } as SaleState;
  } catch (err) {
    console.error('Error createSaleAction:', err);
    return { message: 'Gagal memproses permintaan' } as SaleState;
  }
}
