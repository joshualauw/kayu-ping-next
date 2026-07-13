"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Measurement } from "@/generated/prisma/enums";
import { formatDate } from "@/lib/utils";

interface MaterialDetailCardProps {
  material: {
    id: number;
    name: string;
    code: string;
    measurement: Measurement;
    createdAt: Date;
    updatedAt: Date;
  };
}

export default function MaterialDetailCard({ material }: MaterialDetailCardProps) {
  const router = useRouter();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{material.name}</CardTitle>
        <CardDescription>Detail of the material</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Code</span>
            <p className="text-sm font-medium">{material.code}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Measurement</span>
            <p className="text-sm font-medium whitespace-pre-wrap">{material.measurement}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Created At</span>
            <p className="text-sm font-medium">{formatDate(material.createdAt)}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Updated At</span>
            <p className="text-sm font-medium">{formatDate(material.updatedAt)}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.push("/admin/materials")} className="flex items-center gap-2">
            <ArrowLeft className="size-4" />
            Back to List
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/materials/${material.id}/edit`}>
              <Pencil className="mr-2 size-4" />
              Edit Material
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
