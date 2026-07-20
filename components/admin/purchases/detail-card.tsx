"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Measurement } from "@/generated/prisma/enums";
import { PurchaseDetail } from "@/lib/services/purchase-service";
import { Badge } from "@/components/ui/badge";
import FeeTable from "@/components/shared/fee-table";

interface PurchaseDetailCardProps {
  purchase: PurchaseDetail;
}

export default function PurchaseDetailCard({ purchase }: PurchaseDetailCardProps) {
  const router = useRouter();
  const items = purchase.items || [];

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{purchase.tid}</CardTitle>
          <CardDescription>Detail of the purchase transaction</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Purchase Date</span>
                <p className="text-sm font-medium">{formatDate(purchase.purchaseDate)}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Supplier</span>
                <p className="text-sm font-medium">{purchase.supplier.name}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Location</span>
                <p className="text-sm font-medium">{purchase.location.name}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Notes</span>
                <p className="text-sm font-medium whitespace-pre-wrap">{purchase.notes || "-"}</p>
              </div>
            </div>
          </div>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Items Purchased</CardTitle>
              <CardDescription>Detailed lists of wood variants in this transaction</CardDescription>
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
                      <th className="p-3">Price / m³</th>
                      <th className="p-3">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((item, index) => {
                      const variant = item.variant;
                      const wood = variant.wood;
                      const material = variant.material;
                      const singleVolume = variant.volume;
                      const totalVol = singleVolume * item.quantity;
                      const subtotal = totalVol * item.pricePerCubic;

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
                          <td className="p-3">{formatCurrency(item.pricePerCubic)}</td>
                          <td className="p-3 font-bold text-primary">{formatCurrency(subtotal)}</td>
                        </tr>
                      );
                    })}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={11} className="p-8 text-center text-sm text-muted-foreground italic">
                          No items found in this purchase.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end border-t pt-4">
                <div className="flex gap-8 text-right">
                  <div>
                    <span className="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Total Volume</span>
                    <span className="text-sm font-bold text-primary">{purchase.totalVolume.toFixed(4)} m³</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Total Price</span>
                    <span className="text-sm font-bold text-primary">{formatCurrency(purchase.totalPrice)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <FeeTable
            referenceId={purchase.id}
            referenceType="PURCHASE"
            fees={purchase.fees}
            totalPriceAfterFee={purchase.totalPriceAfterFee}
          />

          <div className="mt-6 flex items-center justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => router.push("/admin/purchases")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="size-4" />
              Back to List
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/purchases/${purchase.id}/edit`}>
                <Pencil className="mr-2 size-4" />
                Edit Purchase
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
