import { notFound } from "next/navigation";
import ProcessingDetailCard from "@/components/admin/processings/detail-card";
import processingService from "@/lib/services/processing-service";

interface ProcessingDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProcessingDetailPage({ params }: ProcessingDetailPageProps) {
  const { id } = await params;
  const processingId = Number(id);

  if (!Number.isInteger(processingId) || processingId <= 0) {
    notFound();
  }

  const processing = await processingService.getProcessingById(processingId);

  if (!processing) {
    notFound();
  }

  return <ProcessingDetailCard processing={processing} />;
}
