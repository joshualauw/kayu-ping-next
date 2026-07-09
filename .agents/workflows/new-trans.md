---
description: Transactional Module Workflow
---

# Transactional Module Workflow

This guide details how to implement or refactor transactional modules (e.g., Movements, Purchases, Sales, Processings, Gradings) in the codebase. It focuses on type-safe schemas, integrating the multi-select `<InventoryPicker>`, and handling grade-specific inventory mutations.

For standard CRUD models, see the [Module Generator Workflow](file:///c:/Projects/kayu-ping-next/.agents/workflows/module.md).

---

## 1. Type-Safe Form Schemas

When defining schemas for transactions, separate the **Backend Database Schema** from the **Frontend Form Schema**. 

- **File Path**: `lib/schemas/[plural-kebab]/create-[singular-kebab].ts`
- **Reference Examples**:
  - [create-movement.ts](file:///c:/Projects/kayu-ping-next/lib/schemas/movements/create-movement.ts)
  - [create-purchase.ts](file:///c:/Projects/kayu-ping-next/lib/schemas/purchases/create-purchase.ts)

### Schema Patterns

- **Input Union Type-Safety**: Avoid using `z.coerce.number()` for form inputs (which infers as `unknown`). Instead, use a union of string and number that transforms to `number`:
  ```typescript
  import { formSelectIdSchema } from "@/lib/schemas/reusable-schema";
  
  // Use for location select dropdowns in forms
  fromLocationId: formSelectIdSchema("From location is required"),
  
  // Use for inline items quantities/prices
  quantity: z.union([z.string(), z.number()])
    .transform((val) => (val === "" || val === null || val === undefined ? undefined : Number(val)))
    .pipe(z.number({ message: "Quantity is required" }).int().positive()),
  ```
- **Metadata Objects**: Use `z.custom<Type>()` to type-check view-only attributes (like variant details and grades) in the cart:
  ```typescript
  variant: z.custom<LocationInventoryItem["variant"]>().optional(),
  grade: z.custom<LocationInventoryItem["grade"]>().optional(),
  ```

---

## 2. Shared InventoryPicker Integration

Replace standard selects in cart pages with the client-side filtered, multiple-selection `<InventoryPicker>` dialog.

- **File Path**: `components/admin/[plural-kebab]/cart.tsx`
- **Reference Examples**:
  - [cart.tsx (movements)](file:///c:/Projects/kayu-ping-next/components/admin/movements/cart.tsx)
  - [inventory-picker.tsx](file:///c:/Projects/kayu-ping-next/components/shared/inventory-picker.tsx)

### Implementation Pattern

1. **Exclusion List**: Generate `existingIds` to filter out inventory items already added to the cart:
   ```typescript
   const existingIds = useMemo(() => {
     return (watchedItems || []).map((item) => Number(item?.inventoryId)).filter(Boolean);
   }, [watchedItems]);
   ```
2. **Append Selections**: Implement a multi-select handler to loop over chosen stocks and append them to the Hook Form array:
   ```typescript
   const handleSelectItems = (selectedInvs: LocationInventoryItem[]) => {
     selectedInvs.forEach((selectedInv) => {
       appendItem({
         inventoryId: selectedInv.id,
         woodVariantId: selectedInv.woodVariantId,
         quantity: 1,
         originalStock: selectedInv.stock,
         variant: selectedInv.variant,
         grade: selectedInv.grade,
       });
     });
   };
   ```
3. **Trigger**: Mount `<InventoryPicker>` and bind the handler to `onSelect`.

---

## 3. Grade-Aware Service Transactions

All inventory transaction mutations (e.g. buying stock, moving stock, grading) must be grade-specific to prevent different grades of wood from blending together.

- **File Path**: `lib/services/[singular-kebab]-service.ts`
- **Reference Examples**:
  - [movement-service.ts](file:///c:/Projects/kayu-ping-next/lib/services/movement-service.ts)
  - [purchase-service.ts](file:///c:/Projects/kayu-ping-next/lib/services/purchase-service.ts)

### Implementation Pattern

- **Unique Inventory Identification**: For movements/sales, query the source inventory record directly by its unique `inventoryId` rather than searching by variant.
- **Stock Mutations**: Set `gradeId` on both incoming (`IN`) and outgoing (`OUT`) `StockMutation` records.
- **Destination Allocation**: Query the destination `Inventory` table matching both `woodVariantId` AND `gradeId`. Update the stock if a matching record exists, otherwise create a new entry with the appropriate `gradeId`.

---

## 4. Fetching & Displaying Grades in Details View

Ensure grades are shown in transaction logs and details pages.

- **Reference Example**: [detail-card.tsx (purchases)](file:///c:/Projects/kayu-ping-next/components/admin/purchases/detail-card.tsx)

### Implementation Pattern

1. **Eager Load Relation**: Include the `grade` relation on items queries in the service layer:
   ```typescript
   items: {
     include: {
       grade: true,
       variant: { include: { wood: true, material: true } }
     }
   }
   ```
2. **Render Grade Badge**: Display a secondary badge for the grade code (or a fallback like *"Ungraded"*):
   ```tsx
   {item.grade ? (
     <Badge variant="secondary">{item.grade.code}</Badge>
   ) : (
     <span className="text-xs text-muted-foreground italic">Ungraded</span>
   )}
   ```
