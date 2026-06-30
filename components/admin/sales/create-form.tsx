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
import { createSaleSchema } from "@/lib/schemas/sales/create-sale";
import { createSaleAction } from "@/lib/actions/sales/create-sale";
import dayjs from "@/lib/integrations/dayjs";
import SalesCart from "./cart";

interface SaleCreateFormProps {
  locations: LocationForSelect[];
  contacts: ContactForSelect[];
}

export default function SaleCreateForm({ locations, contacts }: SaleCreateFormProps) {
  const router = useRouter();
  const formId = "sale-create-form";

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<any>({
    defaultValues: {
      saleDate: dayjs().format("YYYY-MM-DDTHH:mm"),
      locationId: "",
      customerId: "",
      notes: "",
      items: [],
    },
  });

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
      pricePerCubic: Number(item.pricePerCubic),
    }));

    const flattenedData = {
      saleDate: data.saleDate,
      locationId: data.locationId,
      customerId: data.customerId,
      notes: data.notes || null,
      items: mappedItems,
    };

    const validation = createSaleSchema.safeParse(flattenedData);

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
      const result = await createSaleAction(validation.data);

      if (result.success) {
        router.push("/admin/sales");
        toast.success("Sale logged successfully (Console only)");
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
        <CardTitle>Create Sale</CardTitle>
        <CardDescription>Record a new wood/material sale transaction.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id={formId} onSubmit={handleCustomSubmit} className="space-y-6">
          <FieldGroup className="flex flex-col gap-6">
            <Controller
              name="saleDate"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Sale Date</FieldLabel>
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
                        <SelectValue placeholder="Select sale location" />
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
                name="customerId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Customer</FieldLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select customer" />
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
                  <Textarea {...field} value={field.value || ""} placeholder="Add any details or specifications..." />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          {/* Cart Component */}
          <div className="border-t pt-6">
            <SalesCart control={form.control} errors={form.formState.errors.items} />
            {(form.formState.errors.items as any)?.message && (
              <p className="mt-2 text-sm font-medium text-destructive">{String((form.formState.errors.items as any).message)}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-muted-foreground/10 pt-6">
            <Button type="button" variant="secondary" onClick={() => router.push("/admin/sales")} className="flex items-center gap-2">
              <ArrowLeft className="size-4" />
              Back to List
            </Button>
            <Button type="submit" form={formId} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Save Sale"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
