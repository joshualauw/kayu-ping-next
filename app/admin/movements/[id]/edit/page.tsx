import { notFound } from "next/navigation";
import MovementUpdateForm from "@/components/admin/movements/update-form";
import movementService from "@/lib/services/movement-service";

interface MovementEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MovementEditPage({ params }: MovementEditPageProps) {
  const { id } = await params;
  const movementId = Number(id);

  if (!Number.isInteger(movementId) || movementId <= 0) {
    notFound();
  }

  const movement = await movementService.getMovementById(movementId);

  if (!movement) {
    notFound();
  }

  return <MovementUpdateForm movement={movement} />;
}
