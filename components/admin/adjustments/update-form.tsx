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
import { updateAdjustmentAction } from "@/lib/actions/adjustments/update-adjustment";
import {
  updateAdjustmentFormSchema,
  type UpdateAdjustmentFormInput,
  type UpdateAdjustmentFormOutput,
} from "@/lib/schemas/adjustments/update-adjustment";
import { AdjustmentDetail } from "@/lib/services/adjustment-service";

interface AdjustmentUpdateFormProps {
  adjustment: AdjustmentDetail;
}

export default function AdjustmentUpdateForm({ adjustment }: AdjustmentUpdateFormProps) {
  const router = useRouter();
  const formId = "adjustment-update-form";

  const form = useForm<UpdateAdjustmentFormInput, any, UpdateAdjustmentFormOutput>({
    resolver: zodResolver(updateAdjustmentFormSchema),
    defaultValues: {
      notes: adjustment.notes || "",
    },
  });

  async function onSubmit(data: UpdateAdjustmentFormOutput) {
    const result = await updateAdjustmentAction(adjustment.id, data);

    if (result.success) {
      router.push("/admin/adjustments");
      toast.success("Adjustment notes updated successfully");
    } else {
      toast.error(result.message);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edit Adjustment</CardTitle>
        <CardDescription>Update the notes for this adjustment record.</CardDescription>
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
                  <Textarea {...field} value={field.value || ""} placeholder="Edit notes for this adjustment..." className="min-h-30" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          <div className="flex justify-end gap-2 border-t pt-6">
            <Button type="button" variant="secondary" onClick={() => router.push("/admin/adjustments")} className="flex items-center gap-2">
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
