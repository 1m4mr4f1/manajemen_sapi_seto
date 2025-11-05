import prisma from '@/app/lib/prisma';
import { Prisma, Product } from '@prisma/client'; // Impor tipe Product jika ada

/**
 * Mengambil SEMUA produk (Sudah ada)
 */
export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        nama_barang: 'asc',
      },
    });
    return products;
  } catch (error) {
    console.error('Gagal mengambil data produk:', error);
    return [];
  }
}

// Helper untuk parsing id menjadi BigInt dengan toleransi terhadap format yang tidak diharapkan
function parseIdToBigInt(id: string) {
  if (typeof id !== 'string') {
    throw new Error('ID harus string');
  }

  const trimmed = id.trim();

  // Jika sudah berupa angka biasa, BigInt akan berhasil
  try {
    return BigInt(trimmed);
  } catch (e) {
    // Jika gagal, coba bersihkan karakter non-digit (mis. jika ada trailing 'n' atau spasi)
    const digits = trimmed.replace(/[^0-9-]/g, '');
    if (!digits) throw new Error('ID tidak valid');
    try {
      return BigInt(digits);
    } catch (err) {
      throw new Error('ID tidak dapat dikonversi ke BigInt');
    }
  }
}

/**
 * Mengambil SATU produk berdasarkan ID
 */
export async function getProductById(id: string) {
  try {
    const bigintId = parseIdToBigInt(id);
    const product = await prisma.product.findUnique({
      where: { id: bigintId },
    });
    return product;
  } catch (error) {
    console.error('Gagal mengambil produk by ID:', error);
    return null;
  }
}

/**
 * MEMBUAT produk baru
 */
// Tipe data di sini sudah benar. 'data' disiapkan oleh Server Action.
export async function createProduct(
  data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
) {
  try {
    const newProduct = await prisma.product.create({
      data: data,
    });
    return newProduct;
  } catch (error) {
    console.error('Gagal membuat produk:', error);
    throw new Error('Gagal membuat produk.');
  }
}

/**
 * MENGUPDATE produk
 */
export async function updateProduct(
  id: string,
  data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
) {
  try {
    const bigintId = parseIdToBigInt(id);
    const updatedProduct = await prisma.product.update({
      where: { id: bigintId },
      data: data,
    });
    return updatedProduct;
  } catch (error) {
    console.error('Gagal mengupdate produk:', error);
    throw new Error('Gagal mengupdate produk.');
  }
}

/**
 * MENGHAPUS produk
 */
export async function deleteProduct(id: string) {
  try {
    const bigintId = parseIdToBigInt(id);
    await prisma.product.delete({
      where: { id: bigintId },
    });
    return { success: true };
  } catch (error) {
    console.error('Gagal menghapus produk:', error);
    throw new Error('Gagal menghapus produk.');
  }
}
