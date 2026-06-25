import { notFound } from "next/navigation";
import WoodDetailCard from "@/components/admin/woods/detail-card";
import { prisma } from "@/lib/db/prisma";

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

  const wood = await prisma.wood.findUnique({
    where: { id: woodId },
  });

  if (!wood) {
    notFound();
  }

  return <WoodDetailCard wood={wood} />;
}
