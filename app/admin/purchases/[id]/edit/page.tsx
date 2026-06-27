import { notFound } from "next/navigation";
import PurchaseUpdateForm from "@/components/admin/purchases/update-form";
import purchaseService from "@/lib/services/purchase-service";

interface EditPurchasePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPurchasePage({ params }: EditPurchasePageProps) {
  const { id } = await params;
  const purchaseId = Number(id);

  if (!Number.isInteger(purchaseId) || purchaseId <= 0) {
    notFound();
  }

  const purchase = await purchaseService.getPurchaseById(purchaseId);

  if (!purchase) {
    notFound();
  }

  return <PurchaseUpdateForm purchase={purchase} />;
}
