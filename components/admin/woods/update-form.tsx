"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateWoodAction } from "@/lib/actions/woods/update-wood";
import { createWoodFormSchema, type CreateWoodFormInput, type CreateWoodFormOutput } from "@/lib/schemas/woods/create-wood";
import { ArrowLeft } from "lucide-react";

interface WoodUpdateFormProps {
  wood: {
    id: number;
    name: string;
    code: string;
  };
}

export default function WoodUpdateForm({ wood }: WoodUpdateFormProps) {
  const router = useRouter();
  const formId = "wood-update-form";

  const form = useForm<CreateWoodFormInput, any, CreateWoodFormOutput>({
    resolver: zodResolver(createWoodFormSchema),
    defaultValues: {
      name: wood.name,
      code: wood.code,
    },
  });

  async function onSubmit(data: CreateWoodFormOutput) {
    const result = await updateWoodAction(wood.id, data);

    if (result.success) {
      router.push("/admin/woods");
      toast.success("Wood updated successfully");
    } else {
      toast.error(result.message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Wood</CardTitle>
        <CardDescription>Update this wood type&apos;s display name and unique code.</CardDescription>
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

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => router.push("/admin/woods")} className="flex items-center gap-2">
                <ArrowLeft className="size-4" />
                Back to List
              </Button>
              <Button type="submit" form={formId} disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Submitting..." : "Save"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
