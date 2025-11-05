import prisma from '@/app/lib/prisma';
import { Prisma } from '@prisma/client';

// Helper untuk parsing id menjadi BigInt (mirip dengan product.data)
function parseIdToBigInt(id: string) {
  if (typeof id !== 'string') throw new Error('ID harus string');
  const trimmed = id.trim();
  try {
    return BigInt(trimmed);
  } catch (e) {
    const digits = trimmed.replace(/[^0-9-]/g, '');
    if (!digits) throw new Error('ID tidak valid');
    try {
      return BigInt(digits);
    } catch (err) {
      throw new Error('ID tidak dapat dikonversi ke BigInt');
    }
  }
}

export async function getSales() {
  try {
    const sales = await prisma.sale.findMany({
      include: { saleDetails: { include: { product: true } } },
      orderBy: { tanggal_penjualan: 'desc' },
    });
    return sales;
  } catch (error) {
    console.error('Gagal mengambil data sales:', error);
    return [];
  }
}

export async function getSaleById(id: string) {
  try {
    const bigintId = parseIdToBigInt(id);
    const sale = await prisma.sale.findUnique({
      where: { id: bigintId },
      include: { saleDetails: { include: { product: true } } },
    });
    return sale;
  } catch (error) {
    console.error('Gagal mengambil sale by ID:', error);
    return null;
  }
}

/**
 * Membuat sale beserta sale_details dan mengupdate stok produk (sederhana)
 * data.items => Array<{ productId: string, jumlah: number, harga_saat_jual: Prisma.Decimal }>
 */
export async function createSale(data: {
  userId: string;
  customerId?: string | null;
  tanggal_penjualan?: Date;
  subtotal: Prisma.Decimal;
  discount: Prisma.Decimal;
  total_akhir: Prisma.Decimal;
  status_pembayaran: 'lunas' | 'belum_lunas';
  note?: string | null;
  items: Array<{ productId: string; jumlah: number; harga_saat_jual: Prisma.Decimal }>; 
}) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1) create sale
      const sale = await tx.sale.create({
        data: {
          userId: parseIdToBigInt(data.userId),
          customerId: data.customerId ? parseIdToBigInt(data.customerId) : null,
          tanggal_penjualan: data.tanggal_penjualan || new Date(),
          subtotal: data.subtotal,
          discount: data.discount,
          total_akhir: data.total_akhir,
          status_pembayaran: data.status_pembayaran,
          note: data.note ?? null,
        },
      });

      // 2) create sale_details and update product stok
      for (const item of data.items) {
        const prodId = parseIdToBigInt(item.productId);
        await tx.saleDetail.create({
          data: {
            saleId: sale.id,
            productId: prodId,
            jumlah: item.jumlah,
            harga_saat_jual: item.harga_saat_jual,
          },
        });

        // Decrement stok pada product (jika product exists)
        try {
          await tx.product.update({
            where: { id: prodId },
            data: { stok: { decrement: item.jumlah } },
          });
        } catch (err) {
          // Jika product tidak ditemukan, lanjutkan — transaksi akan rollback jika error dilempar
          console.warn('Gagal update stok produk saat createSale:', err);
        }
      }

      return sale;
    });

    return result;
  } catch (error) {
    console.error('Gagal membuat sale:', error);
    throw new Error('Gagal membuat sale');
  }
}
