"use server";

import { z } from "zod";
import { Prisma } from "@prisma/client";
import { createPurchase, updatePurchase } from "@/app/lib/data/purchase.data";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

const PurchaseItemSchema = z.object({
  productId: z.string().min(1, "Produk harus dipilih"),
  jumlah: z.coerce.number().int().min(1, "Jumlah minimal 1"),
  harga_saat_beli: z.coerce
    .number()
    .gt(0, "Harga beli harus lebih dari 0")
    .transform((v) => new Prisma.Decimal(v)),
});

const PurchaseSchema = z.object({
  userId: z.string(),
  supplierId: z.string().min(1, "Supplier harus dipilih"),
  tanggal_pembelian: z.string().optional(),
  items: z
    .array(PurchaseItemSchema)
    .min(1, "Minimal ada 1 item dalam pembelian"),
  total_pembelian: z.coerce
    .number()
    .gt(0)
    .transform((v) => new Prisma.Decimal(v)),
  status_pembayaran: z.enum(["lunas", "belum_lunas"]),
  note: z.string().optional().nullable(),
});

export type BuyState = {
  message?: string | null;
  errors?: Record<string, string[]>;
};

async function getUserIdFromSession(): Promise<string | null> {
  const session: any = await getServerSession(authOptions as any);
  return session?.user?.id ? String(session.user.id) : null;
}

export async function createPurchaseAction(
  prevState: BuyState,
  formData: FormData,
): Promise<BuyState> {
  const userId = await getUserIdFromSession();
  if (!userId) {
    return { message: "Unauthorized: user not authenticated" };
  }

  // Extract and validate minimal form data
  const validatedFields = z
    .object({
      productId: z.string().min(1, "Produk harus dipilih."),
      supplierId: z.string().min(1, "Supplier harus dipilih."),
      jumlah: z.coerce.number().min(1, "Jumlah minimal 1."),
      harga_beli: z.coerce.number().min(1, "Harga beli tidak boleh kosong."),
      tanggal_pembelian: z.string(),
      status_pembayaran: z.enum(["lunas", "belum_lunas"]),
    })
    .safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validasi gagal.",
    };
  }

  const {
    productId,
    supplierId,
    jumlah,
    harga_beli,
    tanggal_pembelian,
    status_pembayaran,
  } = validatedFields.data;

  const total_pembelian = jumlah * harga_beli;
  const items = [
    {
      productId,
      jumlah,
      harga_saat_beli: new Prisma.Decimal(harga_beli),
    },
  ];

  const payload = {
    userId,
    supplierId,
    tanggal_pembelian: new Date(tanggal_pembelian),
    items,
    total_pembelian: new Prisma.Decimal(total_pembelian),
    status_pembayaran,
    note: formData.get("note")?.toString(),
  };

  try {
    await createPurchase(payload);
  } catch (err: any) {
    console.error("Error in createPurchaseAction:", err);
    return { message: err.message || "Gagal membuat pembelian." };
  }

  revalidatePath("/dashboard/purchases");
  redirect("/dashboard/purchases");
}

export async function updatePurchaseAction(
  id: string,
  prevState: BuyState,
  formData: FormData,
): Promise<BuyState> {
  const userId = await getUserIdFromSession();
  if (!userId) {
    return { message: "Unauthorized: user not authenticated" };
  }

  const validatedFields = z
    .object({
      productId: z.string().min(1, "Produk harus dipilih."),
      supplierId: z.string().min(1, "Supplier harus dipilih."),
      jumlah: z.coerce.number().min(1, "Jumlah minimal 1."),
      harga_beli: z.coerce.number().min(1, "Harga beli tidak boleh kosong."),
    })
    .safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validasi gagal.",
    };
  }

  const { productId, supplierId, jumlah, harga_beli } = validatedFields.data;

  const items = [
    {
      productId,
      jumlah,
      harga_saat_beli: new Prisma.Decimal(harga_beli),
    },
  ];

  const payload = {
    supplierId,
    items,
    // You may need to pass other fields to update as well
  };

  try {
    await updatePurchase(id, payload);
  } catch (err: any) {
    console.error("Error in updatePurchaseAction:", err);
    return { message: err.message || "Gagal mengupdate pembelian." };
  }

  revalidatePath("/dashboard/purchases");
  revalidatePath(`/dashboard/purchases/${id}/edit`);
  redirect("/dashboard/purchases");
}
