import { notFound } from "next/navigation";
import GradeUpdateForm from "@/components/admin/grades/update-form";
import gradeService from "@/lib/services/grade-service";

interface EditGradePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditGradePage({ params }: EditGradePageProps) {
  const { id } = await params;
  const gradeId = Number(id);

  if (!Number.isInteger(gradeId) || gradeId <= 0) {
    notFound();
  }

  const grade = await gradeService.getGradeById(gradeId);

  if (!grade) {
    notFound();
  }

  return <GradeUpdateForm grade={grade} />;
}
