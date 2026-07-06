"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateGradeAction } from "@/lib/actions/grades/update-grade";
import { createGradeFormSchema, type CreateGradeFormInput, type CreateGradeFormOutput } from "@/lib/schemas/grades/create-grade";
import { ArrowLeft } from "lucide-react";
import type { Grade } from "@/generated/prisma/client";

interface GradeUpdateFormProps {
  grade: Grade;
}

export default function GradeUpdateForm({ grade }: GradeUpdateFormProps) {
  const router = useRouter();
  const formId = "grade-update-form";

  const form = useForm<CreateGradeFormInput, any, CreateGradeFormOutput>({
    resolver: zodResolver(createGradeFormSchema),
    defaultValues: {
      name: grade.name,
      code: grade.code,
    },
  });

  async function onSubmit(data: CreateGradeFormOutput) {
    const result = await updateGradeAction(grade.id, data);

    if (result.success) {
      router.push("/admin/grades");
      toast.success("Grade updated successfully");
    } else {
      toast.error(result.message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Grade</CardTitle>
        <CardDescription>Update the details of the grade.</CardDescription>
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
                  <Input {...field} placeholder="Grade A" />
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
                  <Input {...field} placeholder="A" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => router.push("/admin/grades")} className="flex items-center gap-2">
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
