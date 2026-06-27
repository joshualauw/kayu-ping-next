import { notFound } from "next/navigation";
import WoodDetailCard from "@/components/admin/woods/detail-card";
import woodService from "@/lib/services/wood-service";

interface WoodDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WoodDetailPage({ params }: WoodDetailPageProps) {
  const { id } = await params;
  const woodId = Number(id);

  if (!Number.isInteger(woodId) || woodId <= 0) {
    notFound();
  }

  const wood = await woodService.getWoodById(woodId);

  if (!wood) {
    notFound();
  }

  return <WoodDetailCard wood={wood} />;
}
