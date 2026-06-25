import { notFound } from "next/navigation";

import WoodUpdateForm from "@/components/admin/woods/update-form";
import { prisma } from "@/lib/db/prisma";

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

  const wood = await prisma.wood.findUnique({
    where: { id: woodId },
    select: {
      id: true,
      name: true,
      code: true,
    },
  });

  if (!wood) {
    notFound();
  }

  return <WoodUpdateForm wood={wood} />;
}
