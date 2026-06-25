"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createWoodAction } from "@/lib/actions/woods/create-wood";
import { createWoodSchema, type CreateWoodSchema } from "@/lib/schemas/woods/create-wood";

export default function WoodCreateForm() {
  const router = useRouter();
  const formId = "wood-create-form";

  const form = useForm<CreateWoodSchema>({
    resolver: zodResolver(createWoodSchema),
    defaultValues: {
      name: "",
      code: "",
    },
  });

  async function onSubmit(data: CreateWoodSchema) {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("code", data.code);

    const result = await createWoodAction(formData);

    if (result.success) {
      router.push("/admin/woods");
      toast.success("Wood created successfully");
    } else {
      toast.error(result.message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Wood</CardTitle>
        <CardDescription>Add a new wood type with its display name and unique code.</CardDescription>
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
                  <Input {...field} placeholder="Meranti" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="code"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Code</FieldLabel>
                  <Input {...field} placeholder="MRT" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <div className="flex justify-start gap-2">
              <Button type="submit" form={formId} disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Submitting..." : "Save"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => router.push("/admin/woods")} disabled={form.formState.isSubmitting}>
                Cancel
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
