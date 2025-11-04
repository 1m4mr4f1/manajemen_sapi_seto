import prisma from '@/app/lib/prisma'; // Menggunakan prisma.ts Anda yang sudah ada

/**
 * Controller akan memanggil fungsi ini untuk mendapatkan semua produk.
 */
export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      // Kita urutkan berdasarkan nama barang, A-Z
      orderBy: {
        nama_barang: 'asc',
      },
    });
    return products;
  } catch (error) {
    console.error('Gagal mengambil data produk:', error);
    // Kembalikan array kosong jika terjadi error
    return [];
  }
}

// Nanti kita bisa tambahkan fungsi lain di sini, seperti:
// export async function getProductById(id) { ... }
// export async function createProduct(data) { ... }
