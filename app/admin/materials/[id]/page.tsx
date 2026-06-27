import { notFound } from "next/navigation";
import MaterialDetailCard from "@/components/admin/materials/detail-card";
import { prisma } from "@/lib/db/prisma";

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

  const material = await prisma.material.findUnique({
    where: { id: materialId },
  });

  if (!material) {
    notFound();
  }

  return <MaterialDetailCard material={material} />;
}
