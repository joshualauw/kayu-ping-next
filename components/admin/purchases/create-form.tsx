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
import { ContactForSelect } from "@/lib/services/contact-service";
import { createPurchaseSchema } from "@/lib/schemas/purchases/create-purchase";
import { createPurchaseAction } from "@/lib/actions/purchases/create-purchase";
import dayjs from "@/lib/integrations/dayjs";
import PurchasesCart from "./cart";

interface PurchaseCreateFormProps {
  locations: LocationForSelect[];
  woods: WoodForSelect[];
  materials: MaterialForSelect[];
  contacts: ContactForSelect[];
}

function mapFlatIndexToNested(groups: any[], flatIndex: number) {
  let count = 0;
  for (let gIndex = 0; gIndex < groups.length; gIndex++) {
    const itemsCount = (groups[gIndex].items || []).length;
    if (flatIndex < count + itemsCount) {
      return {
        groupIndex: gIndex,
        itemIndex: flatIndex - count,
      };
    }
    count += itemsCount;
  }
  return null;
}

export default function PurchaseCreateForm({ locations, woods, materials, contacts }: PurchaseCreateFormProps) {
  const router = useRouter();
  const formId = "purchase-create-form";

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<any>({
    defaultValues: {
      purchaseDate: dayjs().format("YYYY-MM-DDTHH:mm"),
      locationId: "",
      supplierId: "",
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

    const flattenedItems = (data.groups || []).flatMap((group: any) => {
      const material = materials.find((m) => m.id === Number(group.materialId));
      const measurement = material?.measurement;

      return (group.items || []).map((item: any) => ({
        woodId: group.woodId,
        materialId: group.materialId,
        measurement,
        width: item.width || null,
        height: item.height || null,
        diameterSmall: item.diameterSmall || null,
        diameterLarge: item.diameterLarge || null,
        length: item.length,
        quantity: item.quantity,
        pricePerCubic: group.pricePerCubic,
      }));
    });

    const flattenedData = {
      purchaseDate: data.purchaseDate,
      locationId: data.locationId,
      supplierId: data.supplierId,
      notes: data.notes || null,
      items: flattenedItems,
    };

    const validation = createPurchaseSchema.safeParse(flattenedData);

    if (!validation.success) {
      validation.error.issues.forEach((issue) => {
        const path = issue.path;
        if (path[0] === "items") {
          if (path.length === 1) {
            form.setError("groups" as any, { message: issue.message });
          } else {
            const flatIndex = Number(path[1]);
            const fieldName = path[2];
            const mapping = mapFlatIndexToNested(data.groups, flatIndex);
            if (mapping) {
              if (fieldName === "pricePerCubic") {
                form.setError(`groups.${mapping.groupIndex}.pricePerCubic` as any, {
                  message: issue.message,
                });
              } else {
                form.setError(`groups.${mapping.groupIndex}.items.${mapping.itemIndex}.${String(fieldName)}` as any, {
                  message: issue.message,
                });
              }
            }
          }
        } else {
          form.setError(String(path[0]) as any, { message: issue.message });
        }
      });
      toast.error("Please fix the validation errors in the form.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createPurchaseAction(validation.data);

      if (result.success) {
        router.push("/admin/purchases");
        toast.success("Purchase created successfully");
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
        <CardTitle>Create Purchase</CardTitle>
        <CardDescription>Record a new wood/material purchase transaction.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id={formId} onSubmit={handleCustomSubmit} className="space-y-6">
          <FieldGroup className="flex flex-col gap-6">
            <Controller
              name="purchaseDate"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Purchase Date</FieldLabel>
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
                        <SelectValue placeholder="Select purchase location" />
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
                name="supplierId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Supplier</FieldLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select supplier" />
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
            <PurchasesCart control={form.control} woods={woods} materials={materials} errors={form.formState.errors.groups} />
            {(form.formState.errors.groups as any)?.message && (
              <p className="mt-2 text-sm font-medium text-destructive">{String((form.formState.errors.groups as any).message)}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t pt-6">
            <Button type="button" variant="secondary" onClick={() => router.push("/admin/purchases")} className="flex items-center gap-2">
              <ArrowLeft className="size-4" />
              Back to List
            </Button>
            <Button type="submit" form={formId} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Save Purchase"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
