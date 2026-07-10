import { notFound } from "next/navigation";
import AdjustmentUpdateForm from "@/components/admin/adjustments/update-form";
import adjustmentService from "@/lib/services/adjustment-service";

interface AdjustmentEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdjustmentEditPage({ params }: AdjustmentEditPageProps) {
  const { id } = await params;
  const adjustmentId = Number(id);

  if (!Number.isInteger(adjustmentId) || adjustmentId <= 0) {
    notFound();
  }

  const adjustment = await adjustmentService.getAdjustmentById(adjustmentId);

  if (!adjustment) {
    notFound();
  }

  return <AdjustmentUpdateForm adjustment={adjustment} />;
}
