import { notFound } from "next/navigation";
import MaterialUpdateForm from "@/components/admin/materials/update-form";
import materialService from "@/lib/services/material-service";

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

  const material = await materialService.getMaterialById(materialId);

  if (!material) {
    notFound();
  }

  return <MaterialUpdateForm material={material} />;
}
