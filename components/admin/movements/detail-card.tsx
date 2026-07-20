"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Measurement } from "@/generated/prisma/enums";
import { MovementDetail } from "@/lib/services/movement-service";
import FeeTable from "@/components/shared/fee-table";

interface MovementDetailCardProps {
  movement: MovementDetail;
}

export default function MovementDetailCard({ movement }: MovementDetailCardProps) {
  const router = useRouter();
  const items = movement.items || [];

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{movement.tid}</CardTitle>
          <CardDescription>Detail of the wood stock movement transaction</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Movement Date</span>
                <p className="text-sm font-medium">{formatDate(movement.movementDate)}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Trucker</span>
                <p className="text-sm font-medium">{movement.trucker.name}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">From Location</span>
                <p className="text-sm font-medium">{movement.fromLocation.name}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">To Location</span>
                <p className="text-sm font-medium">{movement.toLocation.name}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Notes</span>
                <p className="text-sm font-medium whitespace-pre-wrap">{movement.notes || "-"}</p>
              </div>
            </div>
          </div>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Items Moved</CardTitle>
              <CardDescription>Detailed lists of wood variants transferred in this transaction</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b bg-muted/30 font-medium text-muted-foreground">
                      <th className="p-3">No.</th>
                      <th className="p-3">Wood</th>
                      <th className="p-3">Material</th>
                      <th className="p-3">Grade</th>
                      <th className="p-3">Lot</th>
                      <th className="p-3">Dimensions (cm)</th>
                      <th className="p-3">Length (cm)</th>
                      <th className="p-3">Qty</th>
                      <th className="p-3">Volume (m³)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((item, index) => {
                      const variant = item.variant;
                      const wood = variant.wood;
                      const material = variant.material;
                      const singleVolume = variant.volume;
                      const totalVol = singleVolume * item.quantity;

                      return (
                        <tr key={item.id} className="hover:bg-muted/10">
                          <td className="p-3 font-medium">{index + 1}</td>
                          <td className="p-3">
                            <div className="font-semibold">{wood.name}</div>
                            <div className="text-[10px] text-muted-foreground">{wood.code}</div>
                          </td>
                          <td className="p-3 font-medium">{material.name}</td>
                          <td className="p-3">
                            {item.grade ? (
                              <Badge variant="secondary">{item.grade.code}</Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Ungraded</span>
                            )}
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="font-mono text-xs">
                              {item.lot.code}
                            </Badge>
                          </td>
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
                          <td className="p-3">{item.quantity}</td>
                          <td className="p-3 font-mono">
                            <div className="space-y-0.5">
                              <div>Single: {singleVolume.toFixed(4)}</div>
                              <div className="font-semibold text-muted-foreground">Total: {totalVol.toFixed(4)}</div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-sm text-muted-foreground italic">
                          No items found in this movement.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end border-t pt-4">
                <div className="flex gap-8 text-right">
                  <div>
                    <span className="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                      Total Moved Volume
                    </span>
                    <span className="text-sm font-bold text-primary">{movement.totalMovedVolume.toFixed(4)} m³</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <FeeTable
            referenceId={movement.id}
            referenceType="MOVEMENT"
            fees={movement.fees}
            totalPriceAfterFee={movement.totalPriceAfterFee}
          />

          <div className="mt-6 flex items-center justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => router.push("/admin/movements")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="size-4" />
              Back to List
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/movements/${movement.id}/edit`}>
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
