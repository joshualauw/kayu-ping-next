import { notFound } from "next/navigation";
import GradingUpdateForm from "@/components/admin/gradings/update-form";
import gradingService from "@/lib/services/grading-service";

interface EditGradingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditGradingPage({ params }: EditGradingPageProps) {
  const { id } = await params;
  const gradingId = Number(id);

  if (!Number.isInteger(gradingId) || gradingId <= 0) {
    notFound();
  }

  const grading = await gradingService.getGradingById(gradingId);

  if (!grading) {
    notFound();
  }

  return <GradingUpdateForm grading={grading} />;
}
