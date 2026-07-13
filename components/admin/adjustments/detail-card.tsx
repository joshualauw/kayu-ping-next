"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { AdjustmentDetail } from "@/lib/services/adjustment-service";
import { Measurement } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";

interface AdjustmentDetailCardProps {
  adjustment: AdjustmentDetail;
}

export default function AdjustmentDetailCard({ adjustment }: AdjustmentDetailCardProps) {
  const router = useRouter();
  const items = adjustment.items || [];

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <div>
            <CardTitle>{adjustment.tid}</CardTitle>
            <CardDescription>Detail of the wood stock adjustment transaction</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Adjustment Date</span>
                <p className="text-sm font-medium">{formatDate(adjustment.adjustmentDate)}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Location</span>
                <p className="text-sm font-medium">{adjustment.location.name}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Notes</span>
                <p className="text-sm font-medium whitespace-pre-wrap">{adjustment.notes || "-"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Adjusted Items Details</CardTitle>
          <CardDescription>Lists of items that were adjusted in this transaction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b bg-muted/30 font-medium text-muted-foreground">
                  <th className="p-3">No.</th>
                  <th className="p-3">Wood</th>
                  <th className="p-3">Material</th>
                  <th className="p-3">Dimensions (cm)</th>
                  <th className="p-3">Length (cm)</th>
                  <th className="p-3">Grade</th>
                  <th className="p-3">Lot</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Comment</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item, index) => {
                  const variant = item.variant;
                  const wood = variant.wood;
                  const material = variant.material;
                  const grade = item.grade;

                  return (
                    <tr key={item.id} className="hover:bg-muted/10">
                      <td className="p-3 font-medium">{index + 1}</td>
                      <td className="p-3">
                        <div className="font-semibold">{wood.name}</div>
                        <div className="text-[10px] text-muted-foreground">{wood.code}</div>
                      </td>
                      <td className="p-3 font-medium">{material.name}</td>
                      <td className="p-3">
                        {material.measurement === Measurement.CUBE && (
                          <div>
                            W: {variant.width ?? 0} / H: {variant.height ?? 0}
                          </div>
                        )}
                        {material.measurement === Measurement.CYLINDER && (
                          <div>
                            D.0: {variant.diameterSmall ?? 0} / D.1: {variant.diamterLarge ?? 0}
                          </div>
                        )}
                      </td>
                      <td className="p-3">{variant.length}</td>
                      <td className="p-3">
                        {grade ? (
                          <Badge variant="outline">{grade.code}</Badge>
                        ) : (
                          <span className="text-muted-foreground italic">Ungraded</span>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="font-mono text-xs">
                          {item.lot.code}
                        </Badge>
                      </td>
                      <td className="p-3 font-medium">{item.quantity}</td>
                      <td className="p-3">
                        {item.type === "ADD" ? <Badge variant="success">ADD</Badge> : <Badge variant="destructive">SUBTRACT</Badge>}
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary">{item.reason}</Badge>
                      </td>
                      <td className="p-3 whitespace-pre-wrap">{item.comment || "-"}</td>
                    </tr>
                  );
                })}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-sm text-muted-foreground italic">
                      No items found in this adjustment transaction.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => router.push("/admin/adjustments")} className="flex items-center gap-2">
              <ArrowLeft className="size-4" />
              Back to List
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/adjustments/${adjustment.id}/edit`}>
                <Pencil className="mr-2 size-4" />
                Edit Notes
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
