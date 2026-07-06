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
import { createMaterialAction } from "@/lib/actions/materials/create-material";
import { createMaterialFormSchema, type CreateMaterialFormInput, type CreateMaterialFormOutput } from "@/lib/schemas/materials/create-material";
import { ArrowLeft } from "lucide-react";

export default function MaterialCreateForm() {
  const router = useRouter();
  const formId = "material-create-form";

  const form = useForm<CreateMaterialFormInput, any, CreateMaterialFormOutput>({
    resolver: zodResolver(createMaterialFormSchema),
    defaultValues: {
      name: "",
      measurement: undefined,
    },
  });

  async function onSubmit(data: CreateMaterialFormOutput) {
    const result = await createMaterialAction(data);

    if (result.success) {
      router.push("/admin/materials");
      toast.success("Material created successfully");
    } else {
      toast.error(result.message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Material</CardTitle>
        <CardDescription>Add a new processing or utility material.</CardDescription>
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
                {form.formState.isSubmitting ? "Submitting..." : "Create"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
