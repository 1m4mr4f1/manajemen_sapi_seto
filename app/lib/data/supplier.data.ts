import prisma from '@/app/lib/prisma';
import type { Supplier } from '@prisma/client';

/**
 * Normalize various id types to BigInt for Prisma queries.
 * Accepts string | number | bigint and returns bigint.
 * Throws with clear message when id is missing or invalid.
 */
function parseIdToBigInt(id: string | number | bigint) {
  if (id === null || id === undefined) {
    throw new Error(
      'ID harus ada. Pastikan Anda memanggil function dengan supplier.id atau params.id yang valid (string | number | bigint).'
    );
  }

  if (typeof id === 'bigint') return id;

  if (typeof id === 'number') {
    if (!Number.isInteger(id)) throw new Error('ID number harus integer');
    return BigInt(id);
  }

  if (typeof id === 'string') {
    const trimmed = id.trim();
    if (trimmed.length === 0) throw new Error('ID harus string tidak kosong');

    const cleaned = trimmed.replace(/[^0-9-]/g, '');
    if (cleaned.length === 0) throw new Error('ID string tidak valid');

    try {
      return BigInt(cleaned);
    } catch {
      throw new Error('ID string harus representasi angka yang valid');
    }
  }

  throw new Error('ID harus bertipe string | number | bigint');
}

/**
 * Ambil semua supplier
 */
export async function getSuppliers(): Promise<Supplier[]> {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { nama_supplier: 'asc' },
    });
    return suppliers;
  } catch (error) {
    console.error('Gagal mengambil data supplier:', error);
    return [];
  }
}

/**
 * Ambil satu supplier berdasarkan ID
 */
export async function getSupplierById(id: string | number | bigint): Promise<Supplier | null> {
  if (id === null || id === undefined) {
    throw new Error('getSupplierById: parameter id tidak boleh kosong. Pastikan params.id dikirim dari route.');
  }
  try {
    const bigintId = parseIdToBigInt(id);
    const supplier = await prisma.supplier.findUnique({
      where: { id: bigintId },
    });
    return supplier;
  } catch (error) {
    console.error('Gagal mengambil supplier by ID:', error);
    return null;
  }
}

/**
 * Buat supplier baru
 */
export async function createSupplier(
  data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>
) {
  try {
    const newSupplier = await prisma.supplier.create({
      data,
    });
    return newSupplier;
  } catch (error) {
    console.error('Gagal membuat supplier:', error);
    throw new Error('Gagal membuat supplier.');
  }
}

/**
 * Update supplier
 */
export async function updateSupplier(
  id: string | number | bigint,
  data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>
) {
  if (id === null || id === undefined) {
    throw new Error('updateSupplier: parameter id tidak boleh kosong. Pastikan Anda mem-bind id saat memanggil action.');
  }
  try {
    const bigintId = parseIdToBigInt(id);
    const updatedSupplier = await prisma.supplier.update({
      where: { id: bigintId },
      data,
    });
    return updatedSupplier;
  } catch (error) {
    console.error('Gagal mengupdate supplier:', error);
    throw new Error('Gagal mengupdate supplier.');
  }
}

/**
 * Hapus supplier
 */
export async function deleteSupplier(id: string | number | bigint) {
  if (id === null || id === undefined) {
    throw new Error('deleteSupplier: parameter id tidak boleh kosong.');
  }
  try {
    const bigintId = parseIdToBigInt(id);
    await prisma.supplier.delete({
      where: { id: bigintId },
    });
    return { success: true };
  } catch (error) {
    console.error('Gagal menghapus supplier:', error);
    throw new Error('Gagal menghapus supplier.');
  }
}