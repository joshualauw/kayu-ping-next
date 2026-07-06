import { notFound } from "next/navigation";
import GradingDetailCard from "@/components/admin/gradings/detail-card";
import gradingService from "@/lib/services/grading-service";

interface GradingDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function GradingDetailPage({ params }: GradingDetailPageProps) {
  const { id } = await params;
  const gradingId = Number(id);

  if (!Number.isInteger(gradingId) || gradingId <= 0) {
    notFound();
  }

  const grading = await gradingService.getGradingById(gradingId);

  if (!grading) {
    notFound();
  }

  return <GradingDetailCard grading={grading} />;
}
