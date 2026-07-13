"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { LocationForSelect } from "@/lib/services/location-service";
import { GradeForSelect } from "@/lib/services/grade-service";
import { WoodForSelect } from "@/lib/services/wood-service";
import { MaterialForSelect } from "@/lib/services/material-service";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getCreateGradingFormSchema,
  type CreateGradingFormInput,
  type CreateGradingFormOutput,
  CreateGradingSchema,
} from "@/lib/schemas/gradings/create-grading";
import { createGradingAction } from "@/lib/actions/gradings/create-grading";
import dayjs from "@/lib/integrations/dayjs";
import GradingCart from "./cart";

interface GradingCreateFormProps {
  locations: LocationForSelect[];
  grades: GradeForSelect[];
  woods: WoodForSelect[];
  materials: MaterialForSelect[];
}

export default function GradingCreateForm({ locations, grades, woods, materials }: GradingCreateFormProps) {
  const router = useRouter();
  const formId = "grading-create-form";

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateGradingFormInput, any, CreateGradingFormOutput>({
    resolver: zodResolver(getCreateGradingFormSchema()),
    defaultValues: {
      gradingDate: dayjs().format("YYYY-MM-DDTHH:mm"),
      locationId: "" as any,
      notes: "",
      groups: [],
    },
  });

  async function onSubmit(data: CreateGradingFormOutput) {
    const mappedGroups = (data.groups || []).map((group) => {
      const totalQty = (group.outputs || []).reduce((sum, out) => sum + (Number(out.quantity) || 0), 0);

      const mappedOutputs = (group.outputs || []).map((out) => ({
        woodVariantId: group.input.woodVariantId,
        gradeId: out.gradeId ?? null,
        quantity: out.quantity,
        comment: out.comment || null,
      }));

      return {
        input: {
          inventoryId: group.input.inventoryId,
          woodVariantId: group.input.woodVariantId,
          gradeId: group.input.gradeId ?? null,
          quantity: totalQty,
        },
        outputs: mappedOutputs,
      };
    });

    const formattedData: CreateGradingSchema = {
      gradingDate: data.gradingDate,
      locationId: data.locationId,
      notes: data.notes || null,
      groups: mappedGroups,
    };

    setIsSubmitting(true);
    try {
      const result = await createGradingAction(formattedData);

      if (result.success) {
        router.push("/admin/gradings");
        toast.success("Grading logged successfully");
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Grading</CardTitle>
        <CardDescription>Record a new wood grading transaction (reallocating grades of existing stock).</CardDescription>
      </CardHeader>
      <CardContent>
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldGroup className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Controller
                name="gradingDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Grading Date</FieldLabel>
                    <Input type="datetime-local" {...field} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="locationId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Location</FieldLabel>
                    <Select onValueChange={field.onChange} value={field.value ? String(field.value) : undefined}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select grading location" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {locations.map((l) => (
                          <SelectItem key={l.id} value={String(l.id)}>
                            {l.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="notes"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Notes (Optional)</FieldLabel>
                  <Textarea {...field} value={field.value || ""} placeholder="Add any grading details or memos..." />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          <div className="border-t pt-6">
            <GradingCart
              control={form.control}
              errors={form.formState.errors}
              grades={grades}
              woods={woods}
              materials={materials}
              setError={form.setError}
              clearErrors={form.clearErrors}
              setValue={form.setValue}
            />
            {form.formState.errors.groups?.message && (
              <p className="mt-2 text-sm font-medium text-destructive">{String(form.formState.errors.groups.message)}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-muted-foreground/10 pt-6">
            <Button type="button" variant="secondary" onClick={() => router.push("/admin/gradings")} className="flex items-center gap-2">
              <ArrowLeft className="size-4" />
              Back to List
            </Button>
            <Button type="submit" form={formId} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Save Grading"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
