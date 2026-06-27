import { notFound } from "next/navigation";
import PurchaseDetailCard from "@/components/admin/purchases/detail-card";
import purchaseService from "@/lib/services/purchase-service";

interface PurchaseDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PurchaseDetailPage({ params }: PurchaseDetailPageProps) {
  const { id } = await params;
  const purchaseId = Number(id);

  if (!Number.isInteger(purchaseId) || purchaseId <= 0) {
    notFound();
  }

  const purchase = await purchaseService.getPurchaseById(purchaseId);

  if (!purchase) {
    notFound();
  }

  return <PurchaseDetailCard purchase={purchase} />;
}
