"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LocationType } from "@/generated/prisma/enums";
import { createLocationAction } from "@/lib/actions/locations/create-location";
import {
  createLocationFormSchema,
  type CreateLocationFormInput,
  type CreateLocationFormOutput,
} from "@/lib/schemas/locations/create-location";
import { ArrowLeft } from "lucide-react";

export default function LocationCreateForm() {
  const router = useRouter();
  const formId = "location-create-form";

  const form = useForm<CreateLocationFormInput, any, CreateLocationFormOutput>({
    resolver: zodResolver(createLocationFormSchema),
    defaultValues: {
      name: "",
      address: "",
      type: undefined,
    },
  });

  async function onSubmit(data: CreateLocationFormOutput) {
    const result = await createLocationAction(data);

    if (result.success) {
      router.push("/admin/locations");
      toast.success("Location created successfully");
    } else {
      toast.error(result.message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Location</CardTitle>
        <CardDescription>Add a new inventory or processing location.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Name</FieldLabel>
                  <Input {...field} placeholder="Warehouse A" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Location Type</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select location type" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {Object.values(LocationType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="address"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Address (Optional)</FieldLabel>
                  <Textarea {...field} value={field.value || ""} placeholder="Full Address" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => router.push("/admin/locations")} className="flex items-center gap-2">
                <ArrowLeft className="size-4" />
                Back to List
              </Button>
              <Button type="submit" form={formId} disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Submitting..." : "Create"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
