import { notFound } from "next/navigation";
import MaterialDetailCard from "@/components/admin/materials/detail-card";
import materialService from "@/lib/services/material-service";

interface MaterialDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MaterialDetailPage({ params }: MaterialDetailPageProps) {
  const { id } = await params;
  const materialId = Number(id);

  if (!Number.isInteger(materialId) || materialId <= 0) {
    notFound();
  }

  const material = await materialService.getMaterialById(materialId);

  if (!material) {
    notFound();
  }

  return <MaterialDetailCard material={material} />;
}
