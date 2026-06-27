import { notFound } from "next/navigation";

import WoodUpdateForm from "@/components/admin/woods/update-form";
import woodService from "@/lib/services/wood-service";

interface EditWoodPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditWoodPage({ params }: EditWoodPageProps) {
  const { id } = await params;
  const woodId = Number(id);

  if (!Number.isInteger(woodId) || woodId <= 0) {
    notFound();
  }

  const wood = await woodService.getWoodById(woodId);

  if (!wood) {
    notFound();
  }

  return <WoodUpdateForm wood={wood} />;
}
