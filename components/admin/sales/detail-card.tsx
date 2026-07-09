"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Measurement } from "@/generated/prisma/enums";
import { SaleDetail } from "@/lib/services/sale-service";
import { Badge } from "@/components/ui/badge";

interface SaleDetailCardProps {
  sale: SaleDetail;
}

export default function SaleDetailCard({ sale }: SaleDetailCardProps) {
  const router = useRouter();
  const items = sale.items || [];

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <div>
            <CardTitle>{sale.tid}</CardTitle>
            <CardDescription>Detail of the sale transaction</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Sale Date</span>
                <p className="text-sm font-medium">{formatDate(sale.saleDate)}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Customer</span>
                <p className="text-sm font-medium">{sale.customer.name}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Location</span>
                <p className="text-sm font-medium">{sale.location.name}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Notes</span>
                <p className="text-sm font-medium whitespace-pre-wrap">{sale.notes || "-"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Total Volume</span>
                <p className="text-sm font-bold text-primary">{sale.totalVolume.toFixed(4)} m³</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Total Price</span>
                <p className="text-sm font-bold text-primary">{formatCurrency(sale.totalPrice)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Items Sold</CardTitle>
          <CardDescription>Detailed lists of wood variants in this transaction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b bg-muted/30 font-medium text-muted-foreground">
                  <th className="p-3">No.</th>
                  <th className="p-3">Wood</th>
                  <th className="p-3">Material</th>
                  <th className="p-3">Grade</th>
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
                    <td colSpan={10} className="p-8 text-center text-sm text-muted-foreground italic">
                      No items found in this sale.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => router.push("/admin/sales")} className="flex items-center gap-2">
              <ArrowLeft className="size-4" />
              Back to List
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/sales/${sale.id}/edit`}>
                <Pencil className="mr-2 size-4" />
                Edit Sale
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
