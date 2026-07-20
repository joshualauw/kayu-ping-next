---
description: Fee System Integration Workflow
---

# Fee System Integration Workflow

This workflow guide provides step-by-step instructions for integrating the polymorphic Fee System into any transactional module (e.g., `Purchase`, `Sale`, `Processing`, `Movement`, etc.).

---

## 1. Overview & Architecture

Fees are associated polymorphically with transactions using `referenceId` (the transaction's primary key) and `referenceType` (the enum value from `ReferenceType`, e.g., `PURCHASE`, `SALES`, `MOVEMENT`).

- **Shared Components & Services**:
  - Validation Schema: [create-fee.ts](file:///c:/Projects/kayu-ping-next/lib/schemas/fees/create-fee.ts)
  - Fee Service: [fee-service.ts](file:///c:/Projects/kayu-ping-next/lib/services/fee-service.ts)
  - Server Action: [create-fee.ts](file:///c:/Projects/kayu-ping-next/lib/actions/fees/create-fee.ts)
  - Shared Fee Table Component: [fee-table.tsx](file:///c:/Projects/kayu-ping-next/components/shared/fee-table.tsx)

---

## 2. Step 1: Update Transaction Service Layer

Update the target transaction's service file (e.g., `lib/services/<transaction>-service.ts`).

- **Reference Example**: [purchase-service.ts](file:///c:/Projects/kayu-ping-next/lib/services/purchase-service.ts)

### Key Instructions:

1. **Import `Fee` type**:
   - Use a type-only import for `Fee`: `import type { Fee } from "@/generated/prisma/client";`.

2. **Update Transaction Detail Type**:
   - Add `fees: Fee[]` and `totalPriceAfterFee: number` to your detail type interface (e.g., `<Transaction>Detail`).

3. **Update `get<Transaction>ById(id: number)` Method**:
   - Fetch associated fees from `prisma.fee.findMany`:
     ```typescript
     const fees = await prisma.fee.findMany({
       where: {
         referenceId: id,
         referenceType: "<REFERENCE_TYPE>", // e.g. "PURCHASE", "SALES", "MOVEMENT"
       },
     });
     ```
   - Sum total fee prices: `const totalFees = fees.reduce((sum, fee) => sum + fee.price, 0);`.
   - Calculate total price after fee: `const totalPriceAfterFee = (transaction.totalPrice ?? 0) + totalFees;`.
   - Return `fees` and `totalPriceAfterFee` inside the detail object.

---

## 3. Step 2: Update Detail Card Component Layout

Update the transaction's detail card component (e.g., `components/admin/<plural-kebab>/detail-card.tsx`).

- **Reference Example**: [detail-card.tsx (Purchase)](file:///c:/Projects/kayu-ping-next/components/admin/purchases/detail-card.tsx)

### Key Layout Instructions:

1. **Outer Container & Main Card**:
   - Wrap the view in a `<div className="space-y-6">` containing a single main `<Card className="w-full">`.
   - Set `CardContent` to `className="space-y-8"`.

2. **Metadata Grid**:
   - Render metadata (Date, Supplier/Trucker, Locations, Notes) in a grid at the top of `CardContent`.

3. **Inner Transaction Items Card**:
   - Render an inner `<Card className="w-full">` for items (e.g., `Items Purchased`, `Items Moved`).
   - Include a bottom summary footer inside the items card (`<div className="flex justify-end border-t pt-4">`) displaying volume and price totals.

4. **`<FeeTable>` Component Placement**:
   - Place `<FeeTable>` directly inside the main `CardContent` below the inner Items card:
     ```tsx
     <FeeTable
       referenceId={record.id}
       referenceType="<REFERENCE_TYPE>" // e.g. "PURCHASE", "MOVEMENT", "SALES"
       fees={record.fees}
       totalPriceAfterFee={record.totalPriceAfterFee}
     />
     ```
   - Note: `<FeeTable>` renders the list of fees, an `+ Add Fees` button, and a bottom summary showing `Total Fees` and `Total Price After Fee` (when `totalPriceAfterFee` prop is provided).

5. **Action Buttons Footer**:
   - Place the action buttons (`Back to List` and `Edit`) at the bottom of the main `CardContent` below `<FeeTable>` with a top border:
     ```tsx
     <div className="mt-6 flex items-center justify-end gap-3 border-t pt-4">
       <Button type="button" variant="secondary" size="sm" onClick={() => router.push("/admin/<plural-kebab>")}>
         <ArrowLeft className="size-4" />
         Back to List
       </Button>
       <Button asChild variant="outline" size="sm">
         <Link href={`/admin/<plural-kebab>/${record.id}/edit`}>
           <Pencil className="mr-2 size-4" />
           Edit Record
         </Link>
       </Button>
     </div>
     ```

---

## 4. Step 3: Shared Fee Table Component Usage

The shared component handles inline fee creation, validation using React Hook Form, server action submission, and data refreshing.

- **Component Path**: `components/shared/fee-table.tsx`
- **Reference File**: [fee-table.tsx](file:///c:/Projects/kayu-ping-next/components/shared/fee-table.tsx)

### Critical Rules for Fee Integration:

> [!IMPORTANT]
> **Avoid Prisma Client Runtime Imports in Client Components**:
> Always import `ReferenceType` from `@/generated/prisma/enums` (NOT `@/generated/prisma/client`) and use type-only imports for `Fee` (`import type { Fee } ...`). Importing values directly from `@/generated/prisma/client` inside Client Components pulls the Prisma engine into browser bundles and will crash Turbopack code generation.

- **Form Validation**:
  - `TempFeeRow` uses `useForm` and `Controller` from `react-hook-form` resolved with `zodResolver(createFeeFormSchema)`.
  - Uses `@/components/ui/field` components (`Field`, `FieldError`) for inline error reporting.

- **Saving & Synchronization**:
  - Dispatches `createFeeAction({ name, price, referenceId, referenceType })`.
  - Triggers `toast.success` / `toast.error` via `sonner`.
  - Calls `router.refresh()` to reload server components and update detail totals automatically.
