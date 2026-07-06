---
description: Separated Schema & Typed Form Maker
---

# Separated Schema & Typed Form Maker Workflow

This guide details how to implement strongly typed client-side forms using a separate frontend Zod schema, transitioning away from legacy `any` types, manual validation checks, and custom error flattening.

We have two reference implementations depending on the complexity of the module:
1. **Locations Module** (Simpler, generic master module): Uses Zod input/output types to automatically map and transform form fields, passing the validated data directly to the server action with zero manual payload mapping.
2. **Purchases Module** (Complex transaction module): Involves dynamic field arrays, conditional validations (e.g., dynamic measurements in a cart), and custom manual mapping inside the form submit handler.

---

## 1. Reference: Simpler Generic Master Module (Locations)

Use this pattern when you have a simple master record where form inputs can be automatically trimmed, parsed, and mapped using Zod's input/output type system.

### 1.1 Zod Schemas
- **Location**: [create-location.ts](file:///c:/Projects/kayu-ping-next/lib/schemas/locations/create-location.ts)
- **Key Pattern**: Use Zod `.transform(...)` on optional or empty string fields to turn them into `null` or appropriate database types. Export both `z.input` and `z.output` types.

```typescript
import z from "zod";
import { LocationType } from "@/generated/prisma/enums";

// Backend Schema - simple, focus on database types
export const createLocationSchema = z.object({
  name: z.string().trim().min(1),
  address: z.string().nullish(),
  type: z.nativeEnum(LocationType),
});
export type CreateLocationSchema = z.infer<typeof createLocationSchema>;

// Frontend Schema - validation, user-friendly errors, transforms
export const createLocationFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  address: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .optional(),
  type: z.nativeEnum(LocationType, { message: "Location type is required" }),
});

export type CreateLocationFormInput = z.input<typeof createLocationFormSchema>;
export type CreateLocationFormOutput = z.output<typeof createLocationFormSchema>;
```

### 1.2 Actions
- **Locations**:
  - [create-location.ts](file:///c:/Projects/kayu-ping-next/lib/actions/locations/create-location.ts)
  - [update-location.ts](file:///c:/Projects/kayu-ping-next/lib/actions/locations/update-location.ts)
  - [delete-location.ts](file:///c:/Projects/kayu-ping-next/lib/actions/locations/delete-location.ts)
- **Key Pattern**: Accept the typed schema object directly (and `id: number` where applicable) instead of reading a generic `FormData`.

```typescript
// Create Action
export async function createLocationAction(data: CreateLocationSchema): Promise<ApiResponse<number>> {
  const parsed = createLocationSchema.parse(data);
  const location = await locationService.createLocation(parsed);
  return successResponse(location.id, "Created successfully");
}

// Update Action
export async function updateLocationAction(id: number, data: CreateLocationSchema): Promise<ApiResponse<number>> {
  const parsed = createLocationSchema.parse(data);
  const location = await locationService.updateLocation(id, parsed);
  return successResponse(location.id, "Updated successfully");
}

// Delete Action
export async function deleteLocationAction(id: number): Promise<ApiResponse<number>> {
  const location = await locationService.deleteLocation(id);
  return successResponse(location.id, "Deleted successfully");
}
```

### 1.3 Form Components
- **Locations**:
  - [create-form.tsx](file:///c:/Projects/kayu-ping-next/components/admin/locations/create-form.tsx)
  - [update-form.tsx](file:///c:/Projects/kayu-ping-next/components/admin/locations/update-form.tsx)
- **Key Pattern**: 
  - To prevent TypeScript compiler errors when the Zod input and output shapes differ (due to `.transform`), declare `useForm` using three generics: `useForm<FormInput, any, FormOutput>`.
  - In `onSubmit(data: FormOutput)`, simply pass the validated `data` object directly to the server action.

```typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createLocationFormSchema, type CreateLocationFormInput, type CreateLocationFormOutput } from "@/lib/schemas/locations/create-location";

export default function LocationCreateForm() {
  const form = useForm<CreateLocationFormInput, any, CreateLocationFormOutput>({
    resolver: zodResolver(createLocationFormSchema),
    defaultValues: { name: "", address: "", type: undefined }
  });

  async function onSubmit(data: CreateLocationFormOutput) {
    // Zero manual mapping required! Zod resolver output maps directly to backend schema shape.
    const result = await createLocationAction(data);
    if (result.success) {
      toast.success("Saved successfully");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* ... */}
    </form>
  );
}
```

---

## 2. Reference: Complex Transaction Module (Purchases)

Use this pattern when you have dynamic arrays (like carts), complex conditional validations (like changing required fields depending on an enum selection), or require manual conversion of form fields in the submit handler.

### 2.1 Zod Schemas
- **Purchase**: [create-purchase.ts](file:///c:/Projects/kayu-ping-next/lib/schemas/purchases/create-purchase.ts)
- **Key Pattern**: Define frontend schemas where sub-items have dynamic conditions and check dependencies using `.superRefine(...)`.

### 2.2 Form & Cart Components
- **Purchase**:
  - Form: [create-form.tsx](file:///c:/Projects/kayu-ping-next/components/admin/purchases/create-form.tsx)
  - Cart: [cart.tsx](file:///c:/Projects/kayu-ping-next/components/admin/purchases/cart.tsx)
- **Key Pattern**:
  - The cart sub-component takes `Control<CreatePurchaseFormSchema>` and `UseFormSetValue<CreatePurchaseFormSchema>` as typed props to ensure type safety.
  - When target values change (like selected material), trigger `setValue` to reset or update related fields (like clearing dimensions or setting `measurement` type) to keep the form state self-contained and allow Zod to run validation correctly.
  - Map form values to backend-safe values inside the main form's `onSubmit` callback prior to calling the server action.
