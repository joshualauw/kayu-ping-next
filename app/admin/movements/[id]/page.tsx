import { notFound } from "next/navigation";
import MovementDetailCard from "@/components/admin/movements/detail-card";
import movementService from "@/lib/services/movement-service";

interface MovementDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MovementDetailPage({ params }: MovementDetailPageProps) {
  const { id } = await params;
  const movementId = Number(id);

  if (!Number.isInteger(movementId) || movementId <= 0) {
    notFound();
  }

  const movement = await movementService.getMovementById(movementId);

  if (!movement) {
    notFound();
  }

  return <MovementDetailCard movement={movement} />;
}
