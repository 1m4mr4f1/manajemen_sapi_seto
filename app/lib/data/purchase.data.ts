import prisma from '@/app/lib/prisma';
import { Prisma } from '@prisma/client';

// Helper untuk parsing ID ke BigInt
function parseIdToBigInt(id: string | number | bigint) {
  if (!id) throw new Error("ID tidak valid");
  try {
    return BigInt(id.toString());
  } catch (e) {
    throw new Error("ID tidak dapat dikonversi ke BigInt");
  }
}

/**
 * MENGAMBIL SEMUA DATA PEMBELIAN
 */
export async function getPurchases() {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        purchaseDetails: { include: { product: true } },
        supplier: true,
        user: true, // Optional: Jika ingin menampilkan siapa yang input
      },
      orderBy: { tanggal_pembelian: 'desc' },
    });
    return purchases;
  } catch (error) {
    console.error('Gagal mengambil data pembelian:', error);
    return [];
  }
}

/**
 * MENGAMBIL SATU PEMBELIAN BY ID
 */
export async function getPurchaseById(id: string) {
  try {
    const bigintId = parseIdToBigInt(id);
    const purchase = await prisma.purchase.findUnique({
      where: { id: bigintId },
      include: {
        purchaseDetails: { include: { product: true } },
        supplier: true,
      },
    });
    return purchase;
  } catch (error) {
    console.error('Gagal mengambil pembelian by ID:', error);
    return null;
  }
}

/**
 * MEMBUAT PEMBELIAN BARU (TRANSAKSI)
 * 1. Buat Purchase Header
 * 2. Buat Purchase Details
 * 3. Update Stock Produk (Increment) & Update Harga Beli Terakhir
 */
interface CreatePurchaseInput {
  userId: string;
  supplierId: string;
  tanggal_pembelian?: Date;
  total_pembelian: Prisma.Decimal | number | string;
  status_pembayaran: 'lunas' | 'belum_lunas';
  note?: string | null;
  items: Array<{
    productId: string;
    jumlah: number;
    harga_saat_beli: Prisma.Decimal | number | string;
  }>;
}

export async function createPurchase(data: CreatePurchaseInput) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Purchase Header
      const purchase = await tx.purchase.create({
        data: {
          userId: parseIdToBigInt(data.userId),
          supplierId: parseIdToBigInt(data.supplierId),
          tanggal_pembelian: data.tanggal_pembelian || new Date(),
          total_pembelian: new Prisma.Decimal(data.total_pembelian),
          status_pembayaran: data.status_pembayaran,
          note: data.note ?? null,
        },
      });

      // 2. Create Details & Update Product Stock
      for (const item of data.items) {
        const prodId = parseIdToBigInt(item.productId);
        const hargaBeliDecimal = new Prisma.Decimal(item.harga_saat_beli);

        // Simpan Detail
        await tx.purchaseDetail.create({
          data: {
            purchaseId: purchase.id,
            productId: prodId,
            jumlah: item.jumlah,
            harga_saat_beli: hargaBeliDecimal,
          },
        });

        // PERBAIKAN UTAMA DISINI:
        // Update Stok Produk (Gunakan nama kolom Inggris sesuai schema: 'stock')
        await tx.product.update({
          where: { id: prodId },
          data: {
            stock: { increment: item.jumlah }, // Bahasa Inggris
            last_purchase_price: hargaBeliDecimal, // Bahasa Inggris
            update_at: new Date(), // Update timestamp
          },
        });
      }

      return purchase;
    });

    return result;
  } catch (error) {
    console.error('Gagal membuat pembelian:', error);
    throw new Error('Gagal membuat pembelian');
  }
}

/**
 * UPDATE PEMBELIAN
 * Logika:
 * 1. Kembalikan stok lama (Revert)
 * 2. Hapus detail lama
 * 3. Update header pembelian
 * 4. Masukkan detail baru & Update stok baru
 */
interface UpdatePurchaseInput {
  supplierId: string;
  items: Array<{
    productId: string;
    jumlah: number;
    harga_saat_beli: Prisma.Decimal | number | string;
  }>;
  total_pembelian?: Prisma.Decimal | number;
  // Tambahkan field lain jika diperlukan
}

export async function updatePurchase(id: string, data: UpdatePurchaseInput) {
  try {
    const bigintId = parseIdToBigInt(id);

    const result = await prisma.$transaction(async (tx) => {
      // Ambil data lama untuk revert stok
      const existingPurchase = await tx.purchase.findUnique({
        where: { id: bigintId },
        include: { purchaseDetails: true },
      });

      if (!existingPurchase) {
        throw new Error('Pembelian tidak ditemukan');
      }

      // 1. Revert Stock (Kurangi stok produk berdasarkan jumlah pembelian lama)
      for (const detail of existingPurchase.purchaseDetails) {
        if (detail.productId) {
          await tx.product.update({
            where: { id: detail.productId },
            data: { 
              stock: { decrement: detail.jumlah } // Gunakan 'stock'
            }, 
          });
        }
      }

      // 2. Hapus Detail Lama
      await tx.purchaseDetail.deleteMany({
        where: { purchaseId: bigintId },
      });

      // Hitung total baru jika tidak disediakan
      let totalBaru = new Prisma.Decimal(0);
      if (data.total_pembelian) {
         totalBaru = new Prisma.Decimal(data.total_pembelian);
      } else {
         // Hitung manual dari items
         totalBaru = data.items.reduce((acc, item) => {
            return acc.plus(new Prisma.Decimal(item.harga_saat_beli).times(item.jumlah));
         }, new Prisma.Decimal(0));
      }

      // 3. Update Header Purchase
      const updatedPurchase = await tx.purchase.update({
        where: { id: bigintId },
        data: {
          supplierId: parseIdToBigInt(data.supplierId),
          total_pembelian: totalBaru,
        },
      });

      // 4. Masukkan Item Baru & Tambah Stok Baru
      for (const item of data.items) {
        const prodId = parseIdToBigInt(item.productId);
        const hargaBeliDecimal = new Prisma.Decimal(item.harga_saat_beli);

        await tx.purchaseDetail.create({
          data: {
            purchaseId: updatedPurchase.id,
            productId: prodId,
            jumlah: item.jumlah,
            harga_saat_beli: hargaBeliDecimal,
          },
        });

        await tx.product.update({
          where: { id: prodId },
          data: {
            stock: { increment: item.jumlah }, // Gunakan 'stock'
            last_purchase_price: hargaBeliDecimal, // Gunakan 'last_purchase_price'
            update_at: new Date(),
          },
        });
      }

      return updatedPurchase;
    });

    return result;
  } catch (error) {
    console.error('Gagal mengupdate pembelian:', error);
    throw new Error('Gagal mengupdate pembelian');
  }
}

/**
 * DELETE PEMBELIAN
 * Penting: Stok harus dikurangi kembali saat pembelian dihapus.
 */
export async function deletePurchase(id: string) {
    try {
      const purchaseId = parseIdToBigInt(id);
  
      await prisma.$transaction(async (tx) => {
        // 1. Ambil detail untuk tahu barang apa yang harus dikembalikan stoknya
        const purchase = await tx.purchase.findUnique({
          where: { id: purchaseId },
          include: { purchaseDetails: true },
        });
  
        if (!purchase) {
          throw new Error('Pembelian tidak ditemukan');
        }
  
        // 2. Kembalikan Stok Produk (Reverse Stock)
        for (const detail of purchase.purchaseDetails) {
          if (detail.productId) {
            await tx.product.update({
              where: { id: detail.productId },
              data: {
                stock: { decrement: detail.jumlah }, // Gunakan 'stock'
              },
            });
          }
        }
  
        // 3. Hapus Record Pembelian
        // Detail akan terhapus otomatis karena onDelete: Cascade di schema
        await tx.purchase.delete({
          where: { id: purchaseId },
        });
      });
  
      return { success: true };
    } catch (error) {
      console.error('Gagal menghapus pembelian:', error);
      throw new Error('Gagal menghapus pembelian.');
    }
  }