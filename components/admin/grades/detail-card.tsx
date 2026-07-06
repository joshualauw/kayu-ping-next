"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Grade } from "@/generated/prisma/client";
import { formatDate } from "@/lib/utils";

interface GradeDetailCardProps {
  grade: Grade;
}

export default function GradeDetailCard({ grade }: GradeDetailCardProps) {
  const router = useRouter();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{grade.name}</CardTitle>
        <CardDescription>Detail of the grade</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Grade Name</span>
            <p className="text-sm font-medium">{grade.name}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Code</span>
            <p className="text-sm font-medium">{grade.code}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Created At</span>
            <p className="text-sm font-medium">{formatDate(grade.createdAt)}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Updated At</span>
            <p className="text-sm font-medium">{formatDate(grade.updatedAt)}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.push("/admin/grades")} className="flex items-center gap-2">
            <ArrowLeft className="size-4" />
            Back to List
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/grades/${grade.id}/edit`}>
              <Pencil className="mr-2 size-4" />
              Edit Grade
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
