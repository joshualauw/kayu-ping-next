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
        <CardTitle>Edit Purchase</CardTitle>
        <CardDescription>Update the memo/notes for this purchase.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
