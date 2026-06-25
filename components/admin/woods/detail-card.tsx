"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface WoodDetailCardProps {
  wood: {
    id: number;
    name: string;
    code: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export default function WoodDetailCard({ wood }: WoodDetailCardProps) {
  const router = useRouter();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{wood.name}</CardTitle>
        <CardDescription>Detail of the wood type</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Code</span>
            <p className="text-sm font-medium">{wood.code || "-"}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Created At</span>
            <p className="text-sm font-medium">{formatDate(wood.createdAt)}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Updated At</span>
            <p className="text-sm font-medium">{formatDate(wood.updatedAt)}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.push("/admin/woods")} className="flex items-center gap-2">
            <ArrowLeft className="size-4" />
            Back to List
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/woods/${wood.id}/edit`}>
              <Pencil className="mr-2 size-4" />
              Edit Wood
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
