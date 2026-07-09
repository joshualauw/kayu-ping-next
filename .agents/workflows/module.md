---
description: Module Maker
---

# Module Generator Workflow

This workflow guide provides step-by-step instructions for implementing a complete module in the codebase.
Assume that the new model has already been defined in [prisma/schema.prisma](file:///c:/Projects/kayu-ping-next/prisma/schema.prisma) and database migrations have been run.

## Naming Conventions

Let's define the casing/naming convention based on a model name. Suppose the model is named **`YourModel`**:

- **Singular PascalCase**: `YourModel` (e.g., `Wood`, `Contact`)
- **Singular kebab-case**: `your-model` (e.g., `wood`, `contact`)
- **Plural kebab-case**: `your-models` (e.g., `woods`, `contacts`)
- **CamelCase**: `yourModel` (e.g., `wood`, `contact`)
- **Plural camelCase**: `yourModels` (e.g., `woods`, `contacts`)

We will use these placeholders in the file structures below.

---

## 1. Zod Schema

Create the validation schema in **`lib/schemas/[plural-kebab]/create-[singular-kebab].ts`**.

- **File Path**: `lib/schemas/<your-models>/create-<your-model>.ts`
- **Reference Examples**:
  - [create-contact.ts](file:///c:/Projects/kayu-ping-next/lib/schemas/contacts/create-contact.ts)
  - [create-location.ts](file:///c:/Projects/kayu-ping-next/lib/schemas/locations/create-location.ts)
  - [create-wood.ts](file:///c:/Projects/kayu-ping-next/lib/schemas/woods/create-wood.ts)
- **Structure**:

```typescript
import z from "zod";
// If using enums from prisma: import { YourEnum } from "@/generated/prisma/enums";

// 1. Backend / Database Schema (minimal validation, matches DB types, used in server actions)
export const create<YourModel>Schema = z.object({
  name: z.string().trim().min(1),
  // define additional fields here... e.g. notes: z.string().nullish(),
});

export type Create<YourModel>Schema = z.infer<typeof create<YourModel>Schema>;

// 2. Frontend / Form Schema (custom error messages, empty-string transforms, UI-specific regex)
export const create<YourModel>FormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  // define form-specific validations and transforms, e.g.:
  // notes: z.string().trim().transform((val) => (val === "" ? null : val)).optional(),
});

export type Create<YourModel>FormInput = z.input<typeof create<YourModel>FormSchema>;
export type Create<YourModel>FormOutput = z.output<typeof create<YourModel>FormSchema>;
```

---

## 2. Service Layer

Create a service class to handle database queries and business logic in **`lib/services/[singular-kebab]-service.ts`**.

- **File Path**: `lib/services/<your-model>-service.ts`
- **Reference Example**: [wood-service.ts](file:///c:/Projects/kayu-ping-next/lib/services/wood-service.ts)
- **Key Logic**:
  - Expose helper/CRUD methods:
    - `getAll<YourModel>s(params: TableQuery): Promise<TableResponse<YourModel>>`
    - `get<YourModel>ById(id: number): Promise<YourModel | null>`
    - `create<YourModel>(data: Create<YourModel>Schema): Promise<YourModel>`
    - `update<YourModel>(id: number, data: Create<YourModel>Schema): Promise<YourModel>`
    - `delete<YourModel>(id: number): Promise<YourModel>`
  - Centralize uniqueness or constraint check queries (e.g. check for code/email uniqueness before insert/update and throw clear errors).

---

## 3. Server Actions

Create three separate Server Actions files in **`lib/actions/[plural-kebab]/`**.

- **Directory Path**: `lib/actions/<your-models>/`
- **Reference Examples**:
  - [lib/actions/woods/](file:///c:/Projects/kayu-ping-next/lib/actions/woods)
  - [lib/actions/contacts/](file:///c:/Projects/kayu-ping-next/lib/actions/contacts)

### 3.1 Create Action

- **File Path**: `lib/actions/<your-models>/create-<your-model>.ts`
- **Reference Example**: [create-wood.ts](file:///c:/Projects/kayu-ping-next/lib/actions/woods/create-wood.ts)
- **Key Logic**:
  - Authenticate the user session using `auth()` and `getAuthenticatedUser()`.
  - Validate incoming request body with `create<YourModel>Schema.parse()`.
  - Delegate creation to `<yourModel>Service.create<YourModel>(parsed)`.
  - Return `successResponse(record.id, "Created successfully")` or catch/handle errors with `handleError` and return `errorResponse()`.

### 3.2 Update Action

- **File Path**: `lib/actions/<your-models>/update-<your-model>.ts`
- **Reference Example**: [update-wood.ts](file:///c:/Projects/kayu-ping-next/lib/actions/woods/update-wood.ts)
- **Key Logic**:
  - Authenticate user.
  - Parse and validate the `id` from `formData` (as a positive integer).
  - Parse input parameters with `create<YourModel>Schema.parse()`.
  - Call `<yourModel>Service.update<YourModel>(id, parsed)`.
  - Return success/error response wrapper.

### 3.3 Delete Action

- **File Path**: `lib/actions/<your-models>/delete-<your-model>.ts`
- **Reference Example**: [delete-wood.ts](file:///c:/Projects/kayu-ping-next/lib/actions/woods/delete-wood.ts)
- **Key Logic**:
  - Authenticate user.
  - Parse and validate the target `id`.
  - Call `<yourModel>Service.delete<YourModel>(id)`.
  - Return success/error response.

---

## 4. GET API Route

Create the API endpoint for fetching table/list data in **`app/api/[plural-kebab]/route.ts`**.

- **File Path**: `app/api/<your-models>/route.ts`
- **Reference Example**: [route.ts (woods)](file:///c:/Projects/kayu-ping-next/app/api/woods/route.ts)
- **Key Logic**:
  - Authenticate request session.
  - Validate pagination/search params using `tableQuerySchema` (page, size, search).
  - Fetch list and count using `<yourModel>Service.getAll<YourModel>s(parsed)`.
  - Return a JSON API response: `NextResponse.json(successResponse({ <yourModels>: items, count }, "Fetched successfully"))`.

---

## 5. SWR Hook

Create the SWR hook to fetch and update client-side data in **`hooks/swr/[plural-kebab]/use-get-all-[plural-kebab].ts`**.

- **File Path**: `hooks/swr/<your-models>/use-get-all-<your-models>.ts`
- **Reference Example**: [use-get-all-woods.ts](file:///c:/Projects/kayu-ping-next/hooks/swr/woods/use-get-all-woods.ts)
- **Structure**:

```typescript
import { fetcher } from "@/hooks/swr/fetcher";
import { TableQuery } from "@/lib/schemas/table-query";
import useSWR, { SWRConfiguration } from "swr";
import type { GetAll<YourModel>sResponse } from "@/app/api/<your-models>/route";

export function useGetAll<YourModel>s(query: TableQuery, options?: SWRConfiguration<GetAll<YourModel>sResponse>) {
  const params = new URLSearchParams({
    page: String(query.page),
    size: String(query.size),
    search: query.search,
  });

  return useSWR<GetAll<YourModel>sResponse>(`/api/<your-models>?${params.toString()}`, fetcher, {
    keepPreviousData: true,
    errorRetryCount: 3,
    ...options,
  });
}
```

---

## 6. Components

Create UI and layout files in **`components/admin/[plural-kebab]/`**.

- **Directory Path**: `components/admin/<your-models>/`
- **Reference Examples**:
  - [components/admin/woods/](file:///c:/Projects/kayu-ping-next/components/admin/woods)
  - [components/admin/contacts/](file:///c:/Projects/kayu-ping-next/components/admin/contacts)

### 6.1 Data Table Component

- **File Path**: `components/admin/<your-models>/data-table.tsx`
- **Key Logic & Reference**:
  - Manages list/filter states via `useDataTableState()`.
  - Queries API using `useGetAll<YourModel>s(query)`.
  - Uses `@tanstack/react-table` column definitions (including detail, edit links, and deletion triggers).
  - Integrates the list with the shared `<DataTable>` component.
  - Reference: [data-table.tsx (woods)](file:///c:/Projects/kayu-ping-next/components/admin/woods/data-table.tsx) or [data-table.tsx (contacts)](file:///c:/Projects/kayu-ping-next/components/admin/contacts/data-table.tsx)

### 6.2 Create Form Component

- **File Path**: `components/admin/<your-models>/create-form.tsx`
- **Key Logic & Reference**:
  - Leverages `react-hook-form` along with `zodResolver(create<YourModel>FormSchema)`.
  - Defines the form using `useForm<Create<YourModel>FormInput, any, Create<YourModel>FormOutput>()`.
  - Calls `create<YourModel>Action(data)` on submission.
  - Navigates to `/admin/<your-models>` on success.
  - Uses standard layout components like `<Card>`, `<FieldGroup>`, `<Field>`, `<FieldLabel>`, `<Input>`, and `<FieldError>`.
  - Reference: [create-form.tsx (woods)](file:///c:/Projects/kayu-ping-next/components/admin/woods/create-form.tsx) or [create-form.tsx (contacts)](file:///c:/Projects/kayu-ping-next/components/admin/contacts/create-form.tsx)

### 6.3 Update Form Component

- **File Path**: `components/admin/<your-models>/update-form.tsx`
- **Key Logic & Reference**:
  - Accepts the model record as props to populate `defaultValues`.
  - Leverages `react-hook-form` along with `zodResolver(create<YourModel>FormSchema)`.
  - Defines the form using `useForm<Create<YourModel>FormInput, any, Create<YourModel>FormOutput>()`.
  - Calls `update<YourModel>Action(id, data)` on submission.
  - Reference: [update-form.tsx (woods)](file:///c:/Projects/kayu-ping-next/components/admin/woods/update-form.tsx) or [update-form.tsx (contacts)](file:///c:/Projects/kayu-ping-next/components/admin/contacts/update-form.tsx)

### 6.4 Detail Card Component

- **File Path**: `components/admin/<your-models>/detail-card.tsx`
- **Key Logic & Reference**:
  - Displays record fields inside structured container components.
  - Reference: [detail-card.tsx (woods)](file:///c:/Projects/kayu-ping-next/components/admin/woods/detail-card.tsx) or [detail-card.tsx (contacts)](file:///c:/Projects/kayu-ping-next/components/admin/contacts/detail-card.tsx)

---

## 7. Page Routes

Create page routes in **`app/admin/[plural-kebab]/`** to present the CRUD views.

- **Directory Path**: `app/admin/<your-models>/`
- **Reference Example**:
  [app/admin/woods/](file:///c:/Projects/kayu-ping-next/app/admin/woods) for master
  [app/admin/purchase/](file:///c:/Projects/kayu-ping-next/app/admin/purchase) for transaction

### 7.1 List Page

- **File Path**: `app/admin/<your-models>/page.tsx`
- **Reference**:
  [page.tsx (woods list)](file:///c:/Projects/kayu-ping-next/app/admin/woods/page.tsx) for master
  [page.tsx (purchase list)](file:///c:/Projects/kayu-ping-next/app/admin/purchase/page.tsx) for transaction
- Renders page headings, and mounts the `<YourModels>DataTable` component.

### 7.2 Create Page

- **File Path**: `app/admin/<your-models>/create/page.tsx`
- **Reference**:
  [page.tsx (woods create)](file:///c:/Projects/kayu-ping-next/app/admin/woods/create/page.tsx)
  [page.tsx (purchase create)](file:///c:/Projects/kayu-ping-next/app/admin/purchase/create/page.tsx)
- Mounts `<YourModel>CreateForm`.

### 7.3 Detail Page

- **File Path**: `app/admin/<your-models>/[id]/page.tsx`
- **Reference**:
  [page.tsx (woods detail)](file:///c:/Projects/kayu-ping-next/app/admin/woods/[id]/page.tsx)
  [page.tsx (purchase detail)](file:///c:/Projects/kayu-ping-next/app/admin/purchase/[id]/page.tsx)
- Awaits `params`, validates target ID, fetches the record using `<yourModel>Service.get<YourModel>ById(id)`, handles `notFound()`, and passes the record to the `<YourModel>DetailCard` component.

### 7.4 Edit Page

- **File Path**: `app/admin/<your-models>/[id]/edit/page.tsx`
- **Reference**:
  [page.tsx (woods edit)](file:///c:/Projects/kayu-ping-next/app/admin/woods/[id]/edit/page.tsx)
  [page.tsx (purchase edit)](file:///c:/Projects/kayu-ping-next/app/admin/purchase/[id]/edit/page.tsx)
- Awaits `params`, validates ID, fetches record via `<yourModel>Service.get<YourModel>ById(id)`, handles `notFound()`, and forwards the record to the `<YourModel>UpdateForm` component.
