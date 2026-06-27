"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { updatePurchaseAction } from "@/lib/actions/purchases/update-purchase";
import { updatePurchaseSchema, type UpdatePurchaseSchema } from "@/lib/schemas/purchases/update-purchase";
import { PurchaseDetail } from "@/lib/services/purchase-service";
import { formatDate, formatCurrency } from "@/lib/utils";

interface PurchaseUpdateFormProps {
  purchase: PurchaseDetail;
}

export default function PurchaseUpdateForm({ purchase }: PurchaseUpdateFormProps) {
  const router = useRouter();
  const formId = "purchase-update-form";

  const form = useForm<UpdatePurchaseSchema>({
    resolver: zodResolver(updatePurchaseSchema),
    defaultValues: {
      notes: purchase.notes || "",
    },
  });

  async function onSubmit(data: UpdatePurchaseSchema) {
    const result = await updatePurchaseAction(purchase.id, data);

    if (result.success) {
      router.push("/admin/purchases");
      toast.success("Purchase notes updated successfully");
    } else {
      toast.error(result.message);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edit Purchase: {purchase.tid}</CardTitle>
        <CardDescription>Update the memo/notes for this purchase. All other fields are read-only.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6 rounded-lg border bg-muted/20 p-4 text-xs md:grid-cols-2">
          <div className="space-y-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">TID</span>
              <p className="text-sm font-medium">{purchase.tid}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Purchase Date</span>
              <p className="text-sm font-medium">{formatDate(purchase.purchaseDate)}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Contact</span>
              <p className="text-sm font-medium">{purchase.contact.name}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Location</span>
              <p className="text-sm font-medium">{purchase.location.name}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Total Volume</span>
              <p className="text-sm font-medium">{purchase.totalVolume.toFixed(4)} m³</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Total Price</span>
              <p className="text-sm font-bold text-primary">{formatCurrency(purchase.totalPrice)}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Payment Status</span>
              <div>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    purchase.paymentStatus === "PAID"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}
                >
                  {purchase.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Editable Form */}
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldGroup>
            <Controller
              name="notes"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Notes</FieldLabel>
                  <Textarea {...field} value={field.value || ""} placeholder="Edit notes for this purchase..." className="min-h-[120px]" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          <div className="flex justify-end gap-2 border-t pt-6">
            <Button type="button" variant="secondary" onClick={() => router.push("/admin/purchases")} className="flex items-center gap-2">
              <ArrowLeft className="size-4" />
              Back to List
            </Button>
            <Button type="submit" form={formId} disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
