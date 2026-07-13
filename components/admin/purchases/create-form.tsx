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
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getCreatePurchaseFormSchema,
  type CreatePurchaseFormInput,
  type CreatePurchaseFormOutput,
} from "@/lib/schemas/purchases/create-purchase";
import { createPurchaseAction } from "@/lib/actions/purchases/create-purchase";
import dayjs from "@/lib/integrations/dayjs";
import PurchasesCart from "./cart";

interface PurchaseCreateFormProps {
  locations: LocationForSelect[];
  woods: WoodForSelect[];
  materials: MaterialForSelect[];
  contacts: ContactForSelect[];
}

export default function PurchaseCreateForm({ locations, woods, materials, contacts }: PurchaseCreateFormProps) {
  const router = useRouter();
  const formId = "purchase-create-form";

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreatePurchaseFormInput, any, CreatePurchaseFormOutput>({
    resolver: zodResolver(getCreatePurchaseFormSchema(materials)),
    defaultValues: {
      purchaseDate: dayjs().format("YYYY-MM-DDTHH:mm"),
      locationId: "",
      supplierId: "",
      notes: "",
      groups: [
        {
          items: [
            {
              woodId: "",
              materialId: "",
              measurement: undefined,
              pricePerCubic: "",
              width: "",
              height: "",
              diameterSmall: "",
              diameterLarge: "",
              length: "",
              quantity: "1",
            },
          ],
        },
      ],
    },
  });

  async function onSubmit(data: CreatePurchaseFormOutput) {
    setIsSubmitting(true);
    try {
      const mappedGroups = data.groups.map((group) => {
        const mappedItems = group.items.map((item) => {
          const material = materials.find((m) => m.id === item.materialId);
          const measurement = (material?.measurement || item.measurement) as "CUBE" | "CYLINDER";

          return {
            woodId: item.woodId,
            materialId: item.materialId,
            measurement,
            width: item.width,
            height: item.height,
            diameterSmall: item.diameterSmall,
            diameterLarge: item.diameterLarge,
            length: item.length,
            quantity: item.quantity,
            pricePerCubic: item.pricePerCubic,
          };
        });

        return {
          items: mappedItems,
        };
      });

      const payload = {
        purchaseDate: data.purchaseDate,
        locationId: data.locationId,
        supplierId: data.supplierId,
        notes: data.notes || null,
        groups: mappedGroups,
      };

      const result = await createPurchaseAction(payload);

      if (result.success) {
        router.push("/admin/purchases");
        toast.success("Purchase created successfully");
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save purchase");
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
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <Select onValueChange={field.onChange} value={field.value ? String(field.value) : undefined}>
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
                    <Select onValueChange={field.onChange} value={field.value ? String(field.value) : undefined}>
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
            <PurchasesCart
              control={form.control}
              woods={woods}
              materials={materials}
              errors={form.formState.errors.groups}
              setValue={form.setValue}
            />
            {form.formState.errors.groups?.message && (
              <p className="mt-2 text-sm font-medium text-destructive">{String(form.formState.errors.groups.message)}</p>
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
