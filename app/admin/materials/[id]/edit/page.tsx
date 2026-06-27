import { notFound } from "next/navigation";
import MaterialUpdateForm from "@/components/admin/materials/update-form";
import { prisma } from "@/lib/db/prisma";

interface EditMaterialPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditMaterialPage({ params }: EditMaterialPageProps) {
  const { id } = await params;
  const materialId = Number(id);

  if (!Number.isInteger(materialId) || materialId <= 0) {
    notFound();
  }

  const material = await prisma.material.findUnique({
    where: { id: materialId },
    select: {
      id: true,
      name: true,
      measurement: true,
    },
  });

  if (!material) {
    notFound();
  }

  return <MaterialUpdateForm material={material} />;
}
