import prisma from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";

// Helper function to parse ID to BigInt
function parseIdToBigInt(id: string) {
  if (typeof id !== "string") throw new Error("ID harus berupa string");
  const trimmed = id.trim();
  if (!trimmed) throw new Error("ID tidak valid");
  try {
    return BigInt(trimmed);
  } catch (e) {
    throw new Error("ID tidak dapat dikonversi ke BigInt");
  }
}

export async function getPurchases() {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        purchaseDetails: { include: { product: true } },
        supplier: true,
      },
      orderBy: { tanggal_pembelian: "desc" },
    });
    return purchases;
  } catch (error) {
    console.error("Gagal mengambil data pembelian:", error);
    return [];
  }
}

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
    console.error("Gagal mengambil pembelian by ID:", error);
    return null;
  }
}

/**
 * Creates a purchase, its details, and updates product stock.
 * data.items => Array<{ productId: string, jumlah: number, harga_saat_beli: Prisma.Decimal }>
 */
export async function createPurchase(data: {
  userId: string;
  supplierId: string;
  tanggal_pembelian?: Date;
  total_pembelian: Prisma.Decimal;
  status_pembayaran: "lunas" | "belum_lunas";
  note?: string | null;
  items: Array<{
    productId: string;
    jumlah: number;
    harga_saat_beli: Prisma.Decimal;
  }>;
}) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the purchase
      const purchase = await tx.purchase.create({
        data: {
          userId: parseIdToBigInt(data.userId),
          supplierId: parseIdToBigInt(data.supplierId),
          tanggal_pembelian: data.tanggal_pembelian || new Date(),
          total_pembelian: data.total_pembelian,
          status_pembayaran: data.status_pembayaran,
          note: data.note ?? null,
        },
      });

      // 2. Create purchase_details and update product stock
      for (const item of data.items) {
        const prodId = parseIdToBigInt(item.productId);
        await tx.purchaseDetail.create({
          data: {
            purchaseId: purchase.id,
            productId: prodId,
            jumlah: item.jumlah,
            harga_saat_beli: item.harga_saat_beli,
          },
        });

        // Increment stock and update last purchase price
        await tx.product.update({
          where: { id: prodId },
          data: {
            stok: { increment: item.jumlah },
            harga_beli_terakhir: item.harga_saat_beli,
          },
        });
      }

      return purchase;
    });

    return result;
  } catch (error) {
    console.error("Gagal membuat pembelian:", error);
    throw new Error("Gagal membuat pembelian");
  }
}

/**
 * Updates a purchase, its details, and adjusts product stock.
 */
export async function updatePurchase(
  id: string,
  data: {
    supplierId: string;
    items: Array<{
      productId: string;
      jumlah: number;
      harga_saat_beli: Prisma.Decimal;
    }>;
    // ... other fields like total, status, etc.
  },
) {
  try {
    const bigintId = parseIdToBigInt(id);

    const result = await prisma.$transaction(async (tx) => {
      const existingPurchase = await tx.purchase.findUnique({
        where: { id: bigintId },
        include: { purchaseDetails: true },
      });

      if (!existingPurchase) {
        throw new Error("Pembelian tidak ditemukan");
      }

      // Revert stock changes from the original purchase
      for (const detail of existingPurchase.purchaseDetails) {
        await tx.product.update({
          where: { id: detail.productId! }, // Assuming productId is never null for a purchase detail
          data: { stok: { decrement: detail.jumlah } },
        });
      }

      // Delete old purchase details
      await tx.purchaseDetail.deleteMany({
        where: { purchaseId: bigintId },
      });

      const total_pembelian = data.items.reduce((acc, item) => {
        return acc + item.jumlah * Number(item.harga_saat_beli);
      }, 0);

      // Update the purchase
      const updatedPurchase = await tx.purchase.update({
        where: { id: bigintId },
        data: {
          supplierId: parseIdToBigInt(data.supplierId),
          total_pembelian: new Prisma.Decimal(total_pembelian),
          // update other fields as necessary
        },
      });

      // Create new purchase details and apply new stock changes
      for (const item of data.items) {
        const prodId = parseIdToBigInt(item.productId);
        await tx.purchaseDetail.create({
          data: {
            purchaseId: updatedPurchase.id,
            productId: prodId,
            jumlah: item.jumlah,
            harga_saat_beli: item.harga_saat_beli,
          },
        });

        await tx.product.update({
          where: { id: prodId },
          data: {
            stok: { increment: item.jumlah },
            harga_beli_terakhir: item.harga_saat_beli,
          },
        });
      }

      return updatedPurchase;
    });

    return result;
  } catch (error) {
    console.error("Gagal mengupdate pembelian:", error);
    throw new Error("Gagal mengupdate pembelian");
  }
}
