import { notFound } from "next/navigation";
import ProcessingUpdateForm from "@/components/admin/processings/update-form";
import processingService from "@/lib/services/processing-service";

interface EditProcessingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProcessingPage({ params }: EditProcessingPageProps) {
  const { id } = await params;
  const processingId = Number(id);

  if (!Number.isInteger(processingId) || processingId <= 0) {
    notFound();
  }

  const processing = await processingService.getProcessingById(processingId);

  if (!processing) {
    notFound();
  }

  return <ProcessingUpdateForm processing={processing} />;
}
