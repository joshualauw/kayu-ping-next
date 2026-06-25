import { notFound } from "next/navigation";
import LocationUpdateForm from "@/components/admin/locations/update-form";
import { prisma } from "@/lib/db/prisma";

interface EditLocationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditLocationPage({ params }: EditLocationPageProps) {
  const { id } = await params;
  const locationId = Number(id);

  if (!Number.isInteger(locationId) || locationId <= 0) {
    notFound();
  }

  const location = await prisma.location.findUnique({
    where: { id: locationId },
    select: {
      id: true,
      name: true,
      address: true,
      type: true,
    },
  });

  if (!location) {
    notFound();
  }

  return <LocationUpdateForm location={location} />;
}
