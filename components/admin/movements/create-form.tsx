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
import { ArrowLeft, ArrowLeftRight } from "lucide-react";
import { LocationForSelect } from "@/lib/services/location-service";
import { ContactForSelect } from "@/lib/services/contact-service";
import { createMovementSchema } from "@/lib/schemas/movements/create-movement";
import { createMovementAction } from "@/lib/actions/movements/create-movement";
import dayjs from "@/lib/integrations/dayjs";
import MovementsCart from "./cart";

interface MovementCreateFormProps {
  locations: LocationForSelect[];
  contacts: ContactForSelect[];
}

export default function MovementCreateForm({ locations, contacts }: MovementCreateFormProps) {
  const router = useRouter();
  const formId = "movement-create-form";

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<any>({
    defaultValues: {
      movementDate: dayjs().format("YYYY-MM-DDTHH:mm"),
      fromLocationId: "",
      toLocationId: "",
      truckerId: "",
      notes: "",
      items: [],
    },
  });

  const swapLocations = () => {
    const fromVal = form.getValues("fromLocationId");
    const toVal = form.getValues("toLocationId");
    form.setValue("fromLocationId", toVal);
    form.setValue("toLocationId", fromVal);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = form.getValues();
    onSubmit(data);
  };

  async function onSubmit(data: any) {
    form.clearErrors();

    const mappedItems = (data.items || []).map((item: any) => ({
      inventoryId: Number(item.inventoryId),
      woodVariantId: Number(item.woodVariantId),
      quantity: Number(item.quantity),
    }));

    const flattenedData = {
      movementDate: data.movementDate,
      fromLocationId: data.fromLocationId ? Number(data.fromLocationId) : undefined,
      toLocationId: data.toLocationId ? Number(data.toLocationId) : undefined,
      truckerId: data.truckerId ? Number(data.truckerId) : undefined,
      notes: data.notes || null,
      items: mappedItems,
    };

    const validation = createMovementSchema.safeParse(flattenedData);

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
      const result = await createMovementAction(validation.data);

      if (result.success) {
        router.push("/admin/movements");
        toast.success("Movement logged successfully (Console only)");
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
        <CardTitle>Create Movement</CardTitle>
        <CardDescription>Record a new wood movement transaction between locations.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id={formId} onSubmit={handleCustomSubmit} className="space-y-6">
          <FieldGroup className="flex flex-col gap-6">
            <Controller
              name="movementDate"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Movement Date</FieldLabel>
                  <Input type="datetime-local" {...field} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Controller
                  name="fromLocationId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>From Location</FieldLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select source location" />
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

              <div className="flex justify-center sm:pb-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={swapLocations}
                  title="Swap Locations"
                  aria-label="Swap Locations"
                  className="size-9"
                >
                  <ArrowLeftRight className="size-4" />
                </Button>
              </div>

              <div className="flex-1">
                <Controller
                  name="toLocationId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>To Location</FieldLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select destination location" />
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
            </div>

            <Controller
              name="truckerId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Trucker</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select trucker" />
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

            <Controller
              name="notes"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Notes (Optional)</FieldLabel>
                  <Textarea {...field} value={field.value || ""} placeholder="Add any movement details or memos..." />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          <div className="border-t pt-6">
            <MovementsCart control={form.control} errors={form.formState.errors.items} />
            {form.formState.errors.items?.message && (
              <p className="mt-2 text-sm font-medium text-destructive">{String(form.formState.errors.items.message)}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-muted-foreground/10 pt-6">
            <Button type="button" variant="secondary" onClick={() => router.push("/admin/movements")} className="flex items-center gap-2">
              <ArrowLeft className="size-4" />
              Back to List
            </Button>
            <Button type="submit" form={formId} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Save Movement"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
