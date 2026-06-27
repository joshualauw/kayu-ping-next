"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Measurement } from "@/generated/prisma/enums";
import { updateMaterialAction } from "@/lib/actions/materials/update-material";
import { createMaterialSchema, type CreateMaterialSchema } from "@/lib/schemas/materials/create-material";
import { ArrowLeft } from "lucide-react";

interface MaterialUpdateFormProps {
  material: {
    id: number;
    name: string;
    measurement: Measurement;
  };
}

export default function MaterialUpdateForm({ material }: MaterialUpdateFormProps) {
  const router = useRouter();
  const formId = "material-update-form";

  const form = useForm<CreateMaterialSchema>({
    resolver: zodResolver(createMaterialSchema),
    defaultValues: {
      name: material.name,
      measurement: material.measurement,
    },
  });

  async function onSubmit(data: CreateMaterialSchema) {
    const formData = new FormData();
    formData.append("id", String(material.id));
    formData.append("name", data.name);

    const result = await updateMaterialAction(formData);

    if (result.success) {
      router.push("/admin/materials");
      toast.success("Material updated successfully");
    } else {
      toast.error(result.message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Material</CardTitle>
        <CardDescription>Update this material&apos;s details.</CardDescription>
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
                  <Input {...field} placeholder="Material Name" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="measurement"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Measurement</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select measurement type" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {Object.values(Measurement).map((type) => (
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

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => router.push("/admin/materials")} className="flex items-center gap-2">
                <ArrowLeft className="size-4" />
                Back to List
              </Button>
              <Button type="submit" form={formId} disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Submitting..." : "Update"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
