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
import { createGradingSchema } from "@/lib/schemas/gradings/create-grading";
import { createGradingAction } from "@/lib/actions/gradings/create-grading";
import dayjs from "@/lib/integrations/dayjs";
import GradingCart from "./cart";

interface GradingCreateFormProps {
  locations: LocationForSelect[];
  grades: GradeForSelect[];
}

function mapBeforeIndexToNested(groups: any[], flatIndex: number) {
  if (flatIndex < groups.length) {
    return {
      groupIndex: flatIndex,
    };
  }
  return null;
}

function mapAfterIndexToNested(groups: any[], flatIndex: number) {
  let count = 0;
  for (let gIndex = 0; gIndex < groups.length; gIndex++) {
    const outputsCount = (groups[gIndex].outputs || []).length;
    if (flatIndex < count + outputsCount) {
      return {
        groupIndex: gIndex,
        outputIndex: flatIndex - count,
      };
    }
    count += outputsCount;
  }
  return null;
}

export default function GradingCreateForm({ locations, grades }: GradingCreateFormProps) {
  const router = useRouter();
  const formId = "grading-create-form";

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<any>({
    defaultValues: {
      gradingDate: dayjs().format("YYYY-MM-DDTHH:mm"),
      locationId: "",
      notes: "",
      groups: [],
    },
  });

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = form.getValues();
    onSubmit(data);
  };

  async function onSubmit(data: any) {
    form.clearErrors();

    const beforeItems: any[] = [];
    const afterItems: any[] = [];

    (data.groups || []).forEach((group: any) => {
      if (group.input) {
        const totalQty = (group.outputs || []).reduce((sum: number, out: any) => sum + (Number(out.quantity) || 0), 0);

        beforeItems.push({
          inventoryId: Number(group.input.inventoryId),
          woodVariantId: Number(group.input.woodVariantId),
          gradeId: group.input.gradeId ? Number(group.input.gradeId) : null,
          quantity: totalQty,
        });

        (group.outputs || []).forEach((out: any) => {
          afterItems.push({
            woodVariantId: Number(group.input.woodVariantId),
            gradeId: out.gradeId && out.gradeId !== "ungraded" ? Number(out.gradeId) : null,
            quantity: out.quantity === "" ? undefined : Number(out.quantity),
            comment: out.comment || null,
          });
        });
      }
    });

    const formattedData = {
      gradingDate: data.gradingDate,
      locationId: data.locationId ? Number(data.locationId) : undefined,
      notes: data.notes || null,
      beforeItems,
      afterItems,
    };

    const validation = createGradingSchema.safeParse(formattedData);

    if (!validation.success) {
      validation.error.issues.forEach((issue) => {
        const path = issue.path;
        if (path[0] === "beforeItems") {
          if (path.length === 1) {
            form.setError("groups" as any, { message: issue.message });
          } else {
            const flatIndex = Number(path[1]);
            const fieldName = String(path[2]);
            const mapping = mapBeforeIndexToNested(data.groups, flatIndex);
            if (mapping) {
              form.setError(`groups.${mapping.groupIndex}.input.${fieldName}` as any, {
                message: issue.message,
              });
            }
          }
        } else if (path[0] === "afterItems") {
          if (path.length === 1) {
            form.setError("groups" as any, { message: issue.message });
          } else {
            const flatIndex = Number(path[1]);
            const fieldName = String(path[2]);
            const mapping = mapAfterIndexToNested(data.groups, flatIndex);
            if (mapping) {
              form.setError(`groups.${mapping.groupIndex}.outputs.${mapping.outputIndex}.${fieldName}` as any, {
                message: issue.message,
              });
            }
          }
        } else {
          form.setError(path.join(".") as any, { message: issue.message });
        }
      });
      toast.error("Please fix the validation errors in the form.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createGradingAction(validation.data);

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
        <form id={formId} onSubmit={handleCustomSubmit} className="space-y-6">
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
