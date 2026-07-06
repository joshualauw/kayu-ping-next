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
import { CreatePurchaseFormInput, CreatePurchaseFormOutput, createPurchaseFormSchema } from "@/lib/schemas/purchases/create-purchase";
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
    resolver: zodResolver(createPurchaseFormSchema),
    defaultValues: {
      purchaseDate: dayjs().format("YYYY-MM-DDTHH:mm"),
      locationId: "",
      supplierId: "",
      notes: "",
      items: [],
    },
  });

  async function onSubmit(data: CreatePurchaseFormOutput) {
    setIsSubmitting(true);
    try {
      const mappedItems = data.items.map((item) => {
        const material = materials.find((m) => m.id === Number(item.materialId));
        const measurement = material?.measurement as "CUBE" | "CYLINDER";

        return {
          woodId: Number(item.woodId),
          materialId: Number(item.materialId),
          measurement,
          width: item.width && item.width !== "" ? Number(item.width) : null,
          height: item.height && item.height !== "" ? Number(item.height) : null,
          diameterSmall: item.diameterSmall && item.diameterSmall !== "" ? Number(item.diameterSmall) : null,
          diameterLarge: item.diameterLarge && item.diameterLarge !== "" ? Number(item.diameterLarge) : null,
          length: Number(item.length),
          quantity: Number(item.quantity),
          pricePerCubic: Number(item.pricePerCubic),
        };
      });

      const payload = {
        purchaseDate: data.purchaseDate,
        locationId: Number(data.locationId),
        supplierId: Number(data.supplierId),
        notes: data.notes && data.notes.trim() !== "" ? data.notes : null,
        items: mappedItems,
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
            <PurchasesCart
              control={form.control}
              woods={woods}
              materials={materials}
              errors={form.formState.errors.items}
              setValue={form.setValue}
            />
            {(form.formState.errors.items as any)?.message && (
              <p className="mt-2 text-sm font-medium text-destructive">{String((form.formState.errors.items as any).message)}</p>
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
