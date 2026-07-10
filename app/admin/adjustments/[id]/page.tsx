import { notFound } from "next/navigation";
import AdjustmentDetailCard from "@/components/admin/adjustments/detail-card";
import adjustmentService from "@/lib/services/adjustment-service";

interface AdjustmentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdjustmentDetailPage({ params }: AdjustmentDetailPageProps) {
  const { id } = await params;
  const adjustmentId = Number(id);

  if (!Number.isInteger(adjustmentId) || adjustmentId <= 0) {
    notFound();
  }

  const adjustment = await adjustmentService.getAdjustmentById(adjustmentId);

  if (!adjustment) {
    notFound();
  }

  return <AdjustmentDetailCard adjustment={adjustment} />;
}
