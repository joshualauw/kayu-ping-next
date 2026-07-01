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
import { WoodVariantForSelect } from "@/lib/services/wood-service";
import { MaterialForSelect } from "@/lib/services/material-service";
import { createProcessingSchema } from "@/lib/schemas/processings/create-processing";
import { createProcessingAction } from "@/lib/actions/processings/create-processing";
import dayjs from "@/lib/integrations/dayjs";
import ProcessingCart from "./cart";

interface ProcessingCreateFormProps {
  locations: LocationForSelect[];
  woodVariants: WoodVariantForSelect[];
  materials: MaterialForSelect[];
}

function mapOutputIndexToNested(groups: any[], flatIndex: number) {
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

export default function ProcessingCreateForm({ locations, woodVariants, materials }: ProcessingCreateFormProps) {
  const router = useRouter();
  const formId = "processing-create-form";

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<any>({
    defaultValues: {
      processingDate: dayjs().format("YYYY-MM-DDTHH:mm"),
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

    const inputItems: any[] = [];
    const outputItems: any[] = [];

    (data.groups || []).forEach((group: any, groupIndex: number) => {
      if (group.input) {
        inputItems.push({
          inventoryId: Number(group.input.inventoryId),
          woodVariantId: Number(group.input.woodVariantId),
          quantity: Number(group.input.quantity),
        });

        const woodId = group.input.variant?.woodId;

        (group.outputs || []).forEach((item: any) => {
          const material = materials.find((m) => m.id === Number(item.materialId));
          const measurement = material?.measurement;

          outputItems.push({
            woodId: Number(woodId),
            materialId: item.materialId ? Number(item.materialId) : undefined,
            measurement,
            width: item.width === "" ? null : item.width,
            height: item.height === "" ? null : item.height,
            diameterSmall: item.diameterSmall === "" ? null : item.diameterSmall,
            diameterLarge: item.diameterLarge === "" ? null : item.diameterLarge,
            length: item.length === "" ? undefined : item.length,
            quantity: item.quantity === "" ? undefined : item.quantity,
          });
        });
      }
    });

    const formattedData = {
      processingDate: data.processingDate,
      locationId: data.locationId,
      notes: data.notes || null,
      inputItems,
      outputItems,
    };

    const validation = createProcessingSchema.safeParse(formattedData);

    if (!validation.success) {
      validation.error.issues.forEach((issue) => {
        const path = issue.path;
        if (path[0] === "inputItems") {
          if (path.length === 1) {
            form.setError("groups" as any, { message: issue.message });
          } else {
            const flatIndex = Number(path[1]);
            const fieldName = path[2];
            form.setError(`groups.${flatIndex}.input.${String(fieldName)}` as any, {
              message: issue.message,
            });
          }
        } else if (path[0] === "outputItems") {
          if (path.length === 1) {
            form.setError("groups" as any, { message: issue.message });
          } else {
            const flatIndex = Number(path[1]);
            const fieldName = path[2];
            const mapping = mapOutputIndexToNested(data.groups, flatIndex);
            if (mapping) {
              form.setError(`groups.${mapping.groupIndex}.outputs.${mapping.outputIndex}.${String(fieldName)}` as any, {
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
      const result = await createProcessingAction(validation.data);

      if (result.success) {
        router.push("/admin/processings");
        toast.success("Processing logged successfully");
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
        <CardTitle>Create Processing</CardTitle>
        <CardDescription>Record a new wood processing transaction (inputs and outputs).</CardDescription>
      </CardHeader>
      <CardContent>
        <form id={formId} onSubmit={handleCustomSubmit} className="space-y-6">
          <FieldGroup className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Controller
                name="processingDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Processing Date</FieldLabel>
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
                        <SelectValue placeholder="Select processing location" />
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
                  <Textarea {...field} value={field.value || ""} placeholder="Add any processing details or memos..." />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          <div className="border-t pt-6">
            <ProcessingCart
              control={form.control}
              errors={form.formState.errors}
              woodVariants={woodVariants}
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
            <Button type="button" variant="secondary" onClick={() => router.push("/admin/processings")} className="flex items-center gap-2">
              <ArrowLeft className="size-4" />
              Back to List
            </Button>
            <Button type="submit" form={formId} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Save Processing"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
