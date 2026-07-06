import { notFound } from "next/navigation";
import GradeDetailCard from "@/components/admin/grades/detail-card";
import gradeService from "@/lib/services/grade-service";

interface GradeDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function GradeDetailPage({ params }: GradeDetailPageProps) {
  const { id } = await params;
  const gradeId = Number(id);

  if (!Number.isInteger(gradeId) || gradeId <= 0) {
    notFound();
  }

  const grade = await gradeService.getGradeById(gradeId);

  if (!grade) {
    notFound();
  }

  return <GradeDetailCard grade={grade} />;
}
