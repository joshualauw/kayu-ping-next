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
  createAdjustmentFormSchema,
  type CreateAdjustmentFormInput,
  type CreateAdjustmentFormOutput,
} from "@/lib/schemas/adjustments/create-adjustment";
import { createAdjustmentAction } from "@/lib/actions/adjustments/create-adjustment";
import dayjs from "@/lib/integrations/dayjs";
import AdjustmentsCart from "./cart";

interface AdjustmentCreateFormProps {
  locations: LocationForSelect[];
  woods: WoodForSelect[];
  materials: MaterialForSelect[];
  grades: GradeForSelect[];
}

export default function AdjustmentCreateForm({ locations, woods, materials, grades }: AdjustmentCreateFormProps) {
  const router = useRouter();
  const formId = "adjustment-create-form";

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateAdjustmentFormInput, any, CreateAdjustmentFormOutput>({
    resolver: zodResolver(createAdjustmentFormSchema),
    defaultValues: {
      adjustmentDate: dayjs().format("YYYY-MM-DDTHH:mm"),
      locationId: "",
      notes: "",
      items: [],
    },
  });

  async function onSubmit(data: CreateAdjustmentFormOutput) {
    setIsSubmitting(true);
    try {
      const result = await createAdjustmentAction(data);

      if (result.success) {
        router.push("/admin/adjustments");
        toast.success("Adjustment logged successfully");
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
        <CardTitle>Create Adjustment</CardTitle>
        <CardDescription>Record inventory adjustments for stock additions or subtractions.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldGroup className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Controller
                name="adjustmentDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Adjustment Date</FieldLabel>
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
                        <SelectValue placeholder="Select adjustment location" />
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
                  <Textarea
                    {...field}
                    value={field.value || ""}
                    placeholder="Add adjustment reason details, spec sheet reference, etc..."
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          {/* Cart Component */}
          <div className="border-t pt-6">
            <AdjustmentsCart
              control={form.control}
              errors={form.formState.errors.items}
              woods={woods}
              materials={materials}
              grades={grades}
            />
            {(form.formState.errors.items as any)?.message && (
              <p className="mt-2 text-sm font-medium text-destructive">{String((form.formState.errors.items as any).message)}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-muted-foreground/10 pt-6">
            <Button type="button" variant="secondary" onClick={() => router.push("/admin/adjustments")} className="flex items-center gap-2">
              <ArrowLeft className="size-4" />
              Back to List
            </Button>
            <Button type="submit" form={formId} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Save Adjustment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
