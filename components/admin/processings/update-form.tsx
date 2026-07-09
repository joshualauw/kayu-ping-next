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
import { updateProcessingAction } from "@/lib/actions/processings/update-processing";
import { updateProcessingFormSchema, type UpdateProcessingFormInput, type UpdateProcessingFormOutput } from "@/lib/schemas/processings/update-processing";
import { ProcessingDetail } from "@/lib/services/processing-service";

interface ProcessingUpdateFormProps {
  processing: ProcessingDetail;
}

export default function ProcessingUpdateForm({ processing }: ProcessingUpdateFormProps) {
  const router = useRouter();
  const formId = "processing-update-form";

  const form = useForm<UpdateProcessingFormInput, any, UpdateProcessingFormOutput>({
    resolver: zodResolver(updateProcessingFormSchema),
    defaultValues: {
      notes: processing.notes || "",
    },
  });

  async function onSubmit(data: UpdateProcessingFormOutput) {
    const result = await updateProcessingAction(processing.id, data);

    if (result.success) {
      router.push("/admin/processings");
      toast.success("Processing notes updated successfully");
    } else {
      toast.error(result.message);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edit Processing</CardTitle>
        <CardDescription>Update the notes for this processing record.</CardDescription>
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
                  <Textarea {...field} value={field.value || ""} placeholder="Edit notes for this processing..." className="min-h-[120px]" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          <div className="flex justify-end gap-2 border-t pt-6">
            <Button type="button" variant="secondary" onClick={() => router.push("/admin/processings")} className="flex items-center gap-2">
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
