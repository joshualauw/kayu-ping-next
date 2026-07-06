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
import { ContactType } from "@/generated/prisma/enums";
import { updateContactAction } from "@/lib/actions/contacts/update-contact";
import { createContactFormSchema, type CreateContactFormInput, type CreateContactFormOutput } from "@/lib/schemas/contacts/create-contact";
import { ArrowLeft } from "lucide-react";

interface ContactUpdateFormProps {
  contact: {
    id: number;
    name: string;
    phoneNumber: string | null;
    email: string | null;
    address: string | null;
    type: ContactType;
    notes: string | null;
  };
}

export default function ContactUpdateForm({ contact }: ContactUpdateFormProps) {
  const router = useRouter();
  const formId = "contact-update-form";

  const form = useForm<CreateContactFormInput, any, CreateContactFormOutput>({
    resolver: zodResolver(createContactFormSchema),
    defaultValues: {
      name: contact.name,
      phoneNumber: contact.phoneNumber || "",
      email: contact.email || "",
      address: contact.address || "",
      type: contact.type,
      notes: contact.notes || "",
    },
  });

  async function onSubmit(data: CreateContactFormOutput) {
    const result = await updateContactAction(contact.id, data);

    if (result.success) {
      router.push("/admin/contacts");
      toast.success("Contact updated successfully");
    } else {
      toast.error(result.message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Contact</CardTitle>
        <CardDescription>Update this contact&apos;s details.</CardDescription>
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
                  <Input {...field} placeholder="John Doe" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Contact Type</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select contact type" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {Object.values(ContactType).map((type) => (
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
              name="phoneNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Phone Number (Optional)</FieldLabel>
                  <Input {...field} value={field.value || ""} placeholder="08123456789" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Email (Optional)</FieldLabel>
                  <Input {...field} value={field.value || ""} type="email" placeholder="john@example.com" />
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

            <Controller
              name="notes"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Notes (Optional)</FieldLabel>
                  <Textarea {...field} value={field.value || ""} placeholder="Additional notes..." />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => router.push("/admin/contacts")} className="flex items-center gap-2">
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
