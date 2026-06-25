import { notFound } from "next/navigation";
import LocationDetailCard from "@/components/admin/locations/detail-card";
import { prisma } from "@/lib/db/prisma";

interface LocationDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LocationDetailPage({ params }: LocationDetailPageProps) {
  const { id } = await params;
  const locationId = Number(id);

  if (!Number.isInteger(locationId) || locationId <= 0) {
    notFound();
  }

  const location = await prisma.location.findUnique({
    where: { id: locationId },
  });

  if (!location) {
    notFound();
  }

  return <LocationDetailCard location={location} />;
}
