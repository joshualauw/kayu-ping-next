"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationType } from "@/generated/prisma/enums";
import { formatDate } from "@/lib/utils";

interface LocationDetailCardProps {
  location: {
    id: number;
    name: string;
    address: string | null;
    type: LocationType;
    createdAt: Date;
    updatedAt: Date;
  };
}

export default function LocationDetailCard({ location }: LocationDetailCardProps) {
  const router = useRouter();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{location.name}</CardTitle>
        <CardDescription>Detail of the location</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Type</span>
            <p className="text-sm font-medium whitespace-pre-wrap">{location.type || "-"}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Address</span>
            <p className="text-sm font-medium whitespace-pre-wrap">{location.address || "-"}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Created At</span>
            <p className="text-sm font-medium">{formatDate(location.createdAt)}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Updated At</span>
            <p className="text-sm font-medium">{formatDate(location.updatedAt)}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.push("/admin/locations")} className="flex items-center gap-2">
            <ArrowLeft className="size-4" />
            Back to List
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/locations/${location.id}/edit`}>
              <Pencil className="mr-2 size-4" />
              Edit Location
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
