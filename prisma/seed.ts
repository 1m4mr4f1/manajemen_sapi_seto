import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Mulai proses seeding...');

  // 1. HAPUS DATA LAMA (urutan terbalik dari relasi)
  console.log('Menghapus data lama...');
  await prisma.paymentPayable.deleteMany();
  await prisma.paymentReceivable.deleteMany();
  await prisma.purchaseDetail.deleteMany();
  await prisma.saleDetail.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // 2. BUAT USERS (dengan password di-hash)
  console.log('Membuat users...');
  const hashImam = await bcrypt.hash('Imamrafi?2255', 10);
  const hashKasir = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.create({
    data: {
      name: 'Imam Rafi',
      username: 'imamrafi',
      password: hashImam,
      role: 'admin',
    },
  });

  const kasirUser = await prisma.user.create({
    data: {
      name: 'Kasir Sapi Seto',
      username: 'kasir',
      password: hashKasir,
      role: 'kasir',
    },
  });

  // 3. BUAT SUPPLIERS
  console.log('Membuat suppliers...');
  const supplier1 = await prisma.supplier.create({
    data: {
      nama_supplier: 'Peternakan Jaya Abadi',
      kontak: '08123456789',
    },
  });

  // 4. BUAT CUSTOMERS
  console.log('Membuat customers...');
  const customer1 = await prisma.customer.create({
    data: {
      nama_pelanggan: 'Budi Resto',
      kontak: '08987654321',
    },
  });
  const customerWalkIn = await prisma.customer.create({
    data: { nama_pelanggan: 'Pelanggan Walk-in' },
  });

  // 5. BUAT PRODUCTS
  console.log('Membuat products...');
  const sirloin = await prisma.product.create({
    data: {
      nama_barang: 'Daging Sirloin (per kg)',
      stok: 50,
      harga_jual: 150000,
      harga_beli_terakhir: 120000,
    },
  });
  const ribeye = await prisma.product.create({
    data: {
      nama_barang: 'Daging Ribeye (per kg)',
      stok: 30,
      harga_jual: 170000,
      harga_beli_terakhir: 135000,
    },
  });
  const tenderloin = await prisma.product.create({
    data: {
      nama_barang: 'Daging Tenderloin (per kg)',
      stok: 25,
      harga_jual: 200000,
      harga_beli_terakhir: 160000,
    },
  });

  // 6. BUAT TRANSAKSI PEMBELIAN (Hutang)
  console.log('Membuat transaksi pembelian...');
  const purchase1 = await prisma.purchase.create({
    data: {
      userId: adminUser.id,
      supplierId: supplier1.id,
      tanggal_pembelian: new Date(new Date().setDate(new Date().getDate() - 5)), // 5 hari lalu
      total_pembelian: 1200000, // 10kg * 120000
      status_pembayaran: 'belum_lunas',
      note: 'Stok sirloin',
      // Buat detail pembeliannya sekaligus
      purchaseDetails: {
        create: {
          productId: sirloin.id,
          jumlah: 10,
          harga_saat_beli: 120000,
        },
      },
    },
  });

  // 7. BUAT TRANSAKSI PENJUALAN (Lunas & Piutang)
  console.log('Membuat transaksi penjualan...');
  const sale1 = await prisma.sale.create({ // Lunas
    data: {
      userId: kasirUser.id,
      customerId: customerWalkIn.id,
      tanggal_penjualan: new Date(new Date().setDate(new Date().getDate() - 1)), // Kemarin
      subtotal: 340000,
      discount: 0,
      total_akhir: 340000,
      status_pembayaran: 'lunas',
      // Buat detail penjualan sekaligus
      saleDetails: {
        create: {
          productId: ribeye.id,
          jumlah: 2,
          harga_saat_jual: 170000,
        },
      },
    },
  });

  const sale2 = await prisma.sale.create({ // Piutang
    data: {
      userId: kasirUser.id,
      customerId: customer1.id, // Budi Resto
      tanggal_penjualan: new Date(),
      subtotal: 750000,
      discount: 50000,
      total_akhir: 700000,
      status_pembayaran: 'belum_lunas',
      note: 'Tempo 7 hari',
      // Buat detail penjualan sekaligus
      saleDetails: {
        create: {
          productId: sirloin.id,
          jumlah: 5,
          harga_saat_jual: 150000,
        },
      },
    },
  });

  // 8. BUAT EXPENSES (Pengeluaran)
  console.log('Membuat expenses...');
  await prisma.expense.create({
    data: {
      userId: adminUser.id,
      tanggal_pengeluaran: new Date(),
      jenis_pengeluaran: 'Operasional',
      nominal: 150000,
      keterangan: 'Bayar listrik toko',
    },
  });

  // 9. BUAT PEMBAYARAN HUTANG/PIUTANG
  console.log('Membuat data pembayaran...');
  await prisma.paymentPayable.create({ // Bayar hutang pembelian
    data: {
      purchaseId: purchase1.id,
      tanggal_bayar: new Date(),
      jumlah_bayar: 500000, // Bayar 500rb dari total 1.2jt
    },
  });

  await prisma.paymentReceivable.create({ // Terima piutang penjualan
    data: {
      saleId: sale2.id,
      tanggal_bayar: new Date(),
      jumlah_bayar: 300000, // Terima 300rb dari total 700rb
    },
  });

  console.log('Proses seeding selesai.');
}

main()
  .catch((e) => {
    console.error('Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
