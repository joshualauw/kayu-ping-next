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
import { ContactForSelect } from "@/lib/services/contact-service";
import { WoodVariantForSelect } from "@/lib/services/wood-service";
import { createProcessingSchema } from "@/lib/schemas/processings/create-processing";
import { createProcessingAction } from "@/lib/actions/processings/create-processing";
import dayjs from "@/lib/integrations/dayjs";
import ProcessingCart from "./cart";

interface ProcessingCreateFormProps {
  locations: LocationForSelect[];
  contacts: ContactForSelect[];
  woodVariants: WoodVariantForSelect[];
}

export default function ProcessingCreateForm({ locations, contacts, woodVariants }: ProcessingCreateFormProps) {
  const router = useRouter();
  const formId = "processing-create-form";

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<any>({
    defaultValues: {
      processingDate: dayjs().format("YYYY-MM-DDTHH:mm"),
      locationId: "",
      contactId: "",
      notes: "",
      inputItems: [],
      outputItems: [],
    },
  });

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = form.getValues();
    onSubmit(data);
  };

  async function onSubmit(data: any) {
    form.clearErrors();

    const formattedData = {
      processingDate: data.processingDate,
      locationId: data.locationId,
      contactId: data.contactId,
      notes: data.notes || null,
      inputItems: (data.inputItems || []).map((i: any) => ({
        inventoryId: Number(i.inventoryId),
        woodVariantId: Number(i.woodVariantId),
        quantity: Number(i.quantity),
      })),
      outputItems: (data.outputItems || []).map((o: any) => ({
        woodVariantId: Number(o.woodVariantId),
        quantity: Number(o.quantity),
      })),
    };

    const validation = createProcessingSchema.safeParse(formattedData);

    if (!validation.success) {
      validation.error.issues.forEach((issue) => {
        const path = issue.path;
        form.setError(path.join(".") as any, { message: issue.message });
      });
      toast.error("Please fix the validation errors in the form.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createProcessingAction(validation.data);

      if (result.success) {
        router.push("/admin/processings");
        toast.success("Processing logged successfully (Console only)");
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
        <CardTitle>Create Processing Record</CardTitle>
        <CardDescription>Record a new wood processing transaction (inputs and outputs).</CardDescription>
      </CardHeader>
      <CardContent>
        <form id={formId} onSubmit={handleCustomSubmit} className="space-y-6">
          <FieldGroup className="flex flex-col gap-6">
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

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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

              <Controller
                name="contactId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Worker / Contact</FieldLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select worker/contractor" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {contacts.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
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

          {/* Side-by-Side Carts Component */}
          <div className="border-t pt-6">
            <ProcessingCart
              control={form.control}
              errors={form.formState.errors}
              woodVariants={woodVariants}
              setError={form.setError}
              clearErrors={form.clearErrors}
            />
            {form.formState.errors.inputItems?.message && (
              <p className="mt-2 text-sm font-medium text-destructive">{String(form.formState.errors.inputItems.message)}</p>
            )}
            {form.formState.errors.outputItems?.message && (
              <p className="mt-2 text-sm font-medium text-destructive">{String(form.formState.errors.outputItems.message)}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-muted-foreground/10 pt-6">
            <Button type="button" variant="secondary" onClick={() => router.push("/admin/processings")} className="flex items-center gap-2">
              <ArrowLeft className="size-4" />
              Back to List
            </Button>
            <Button type="submit" form={formId} disabled={isSubmitting || !!form.formState.errors.outputItems}>
              {isSubmitting ? "Submitting..." : "Save Processing Record"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
