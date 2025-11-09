import { notFound } from "next/navigation";
import BuyForm from "@/app/components/dashboard/BuyForm";
import { updatePurchaseAction } from "@/app/lib/actions/purchase.actions"; // You will need to create this action
import { getPurchaseById } from "@/app/lib/data/purchase.data"; // You will need to create this function
import { getProducts } from "@/app/lib/data/product.data";
import { getSuppliers } from "@/app/lib/data/supplier.data";

export default async function EditPurchasePage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;

  // Fetch all necessary data in parallel
  const [purchase, products, suppliers] = await Promise.all([
    getPurchaseById(id),
    getProducts(),
    getSuppliers(),
  ]);

  // Handle case where purchase is not found
  if (!purchase) {
    notFound();
  }

  // Serialize data for the form component
  const serializedPurchase = {
    ...purchase,
    id: String(purchase.id),
    supplierId: String(purchase.supplierId),
    purchaseDetails:
      purchase.purchaseDetails?.map((d: any) => ({
        ...d,
        id: String(d.id),
        productId: d.productId ? String(d.productId) : null,
        jumlah: Number(d.jumlah),
        harga_saat_beli: Number(d.harga_saat_beli),
      })) || [],
  };

  const serializedProducts = products.map((p: any) => ({
    id: String(p.id),
    nama_barang: p.nama_barang,
    stok: p.stok,
    harga_beli_terakhir:
      p.harga_beli_terakhir != null ? Number(p.harga_beli_terakhir) : null,
  }));

  const serializedSuppliers = suppliers.map((s: any) => ({
    id: String(s.id),
    nama_supplier: s.nama_supplier,
  }));

  // Bind the purchase ID to the server action
  const updateActionWithId = updatePurchaseAction.bind(
    null,
    purchase.id.toString(),
  );

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-800">
        Edit Pembelian: #{purchase.id}
      </h1>

      <BuyForm
        action={updateActionWithId as any}
        products={serializedProducts}
        suppliers={serializedSuppliers}
        purchase={serializedPurchase}
      />
    </div>
  );
}
