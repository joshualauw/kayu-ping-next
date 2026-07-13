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
import { WoodForSelect } from "@/lib/services/wood-service";
import { MaterialForSelect } from "@/lib/services/material-service";
import { GradeForSelect } from "@/lib/services/grade-service";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateProcessingSchema,
  getCreateProcessingFormSchema,
  type CreateProcessingFormInput,
  type CreateProcessingFormOutput,
} from "@/lib/schemas/processings/create-processing";
import { createProcessingAction } from "@/lib/actions/processings/create-processing";
import dayjs from "@/lib/integrations/dayjs";
import ProcessingCart from "./cart";

interface ProcessingCreateFormProps {
  locations: LocationForSelect[];
  materials: MaterialForSelect[];
  woods: WoodForSelect[];
  grades: GradeForSelect[];
}

export default function ProcessingCreateForm({ locations, materials, woods, grades }: ProcessingCreateFormProps) {
  const router = useRouter();
  const formId = "processing-create-form";

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateProcessingFormInput, any, CreateProcessingFormOutput>({
    resolver: zodResolver(getCreateProcessingFormSchema(materials)),
    defaultValues: {
      processingDate: dayjs().format("YYYY-MM-DDTHH:mm"),
      locationId: "" as any,
      notes: "",
      groups: [],
    },
  });

  async function onSubmit(data: CreateProcessingFormOutput) {
    const mappedGroups = (data.groups || []).map((group) => {
      const woodId = group.input.variant?.woodId;

      const mappedOutputs = (group.outputs || []).map((item) => {
        const material = materials.find((m) => m.id === Number(item.materialId));
        const measurement = (material?.measurement || "CUBE") as "CUBE" | "CYLINDER";

        return {
          woodId: Number(woodId),
          materialId: item.materialId,
          measurement,
          width: item.width,
          height: item.height,
          diameterSmall: item.diameterSmall,
          diameterLarge: item.diameterLarge,
          length: item.length,
          quantity: item.quantity,
        };
      });

      return {
        input: {
          inventoryId: group.input.inventoryId,
          woodVariantId: group.input.woodVariantId,
          quantity: group.input.quantity,
        },
        outputs: mappedOutputs,
      };
    });

    const formattedData: CreateProcessingSchema = {
      processingDate: data.processingDate,
      locationId: data.locationId,
      notes: data.notes || null,
      groups: mappedGroups,
    };

    setIsSubmitting(true);
    try {
      const result = await createProcessingAction(formattedData);

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
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <Select onValueChange={field.onChange} value={field.value ? String(field.value) : undefined}>
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
              materials={materials}
              woods={woods}
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
