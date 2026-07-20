"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Check } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { createFeeAction } from "@/lib/actions/fees/create-fee";
import { ReferenceType } from "@/generated/prisma/enums";
import type { Fee } from "@/generated/prisma/client";
import { createFeeFormSchema, type CreateFeeFormInput, type CreateFeeFormOutput } from "@/lib/schemas/fees/create-fee";

interface FeeTableProps {
  referenceId: number;
  referenceType: ReferenceType;
  fees: Fee[];
  totalPriceAfterFee?: number;
}

interface TempFeeRowProps {
  index: number;
  onSave: (name: string, price: number) => Promise<boolean>;
  onRemove: () => void;
}

function TempFeeRow({ index, onSave, onRemove }: TempFeeRowProps) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<CreateFeeFormInput, any, CreateFeeFormOutput>({
    resolver: zodResolver(createFeeFormSchema),
    defaultValues: {
      name: "",
      price: "",
    },
  });

  const onSubmit = async (data: CreateFeeFormOutput) => {
    setIsSaving(true);
    const success = await onSave(data.name, data.price);
    if (!success) {
      setIsSaving(false);
    }
  };

  return (
    <tr>
      <td className="p-3 font-medium text-muted-foreground">{index + 1}</td>
      <td className="p-3">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-slot="field" data-invalid={fieldState.invalid}>
              <Input {...field} placeholder="Fee Name" disabled={isSaving} className="h-8 max-w-sm text-xs" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-[10px]" />}
            </Field>
          )}
        />
      </td>
      <td className="p-3">
        <Controller
          name="price"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-slot="field" data-invalid={fieldState.invalid}>
              <Input
                type="number"
                step="0.01"
                {...field}
                value={(field.value as any) ?? ""}
                placeholder="Price"
                disabled={isSaving}
                className="h-8 max-w-50 text-xs"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-[10px]" />}
            </Field>
          )}
        />
      </td>
      <td className="p-3">
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            disabled={isSaving}
            onClick={form.handleSubmit(onSubmit)}
            className="size-8 text-green-600 hover:bg-green-50 hover:text-green-700"
          >
            <Check className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            disabled={isSaving}
            onClick={onRemove}
            className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function FeeTable({ referenceId, referenceType, fees, totalPriceAfterFee }: FeeTableProps) {
  const router = useRouter();
  const [tempRowIds, setTempRowIds] = useState<string[]>([]);

  const handleAddFeeRow = () => {
    setTempRowIds((prev) => [...prev, Math.random().toString()]);
  };

  const handleRemoveTempRow = (id: string) => {
    setTempRowIds((prev) => prev.filter((rowId) => rowId !== id));
  };

  async function handleSaveFee(name: string, price: number, id: string) {
    try {
      const res = await createFeeAction({
        name,
        price,
        referenceId,
        referenceType,
      });

      if (res.success) {
        toast.success("Fee added successfully");
        handleRemoveTempRow(id);
        router.refresh();
        return true;
      } else {
        toast.error(res.message || "Failed to add fee");
        return false;
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to add fee");
      return false;
    }
  }

  const feesTotal = fees.reduce((sum, fee) => sum + fee.price, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Fees</CardTitle>
        <CardDescription>Additional fees and charges</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b bg-muted/30 font-medium text-muted-foreground">
                <th className="w-20 p-3">No.</th>
                <th className="p-3">Fee Name</th>
                <th className="p-3">Price</th>
                <th className="w-30 p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {fees.map((fee, index) => (
                <tr key={fee.id} className="hover:bg-muted/10">
                  <td className="p-3 font-medium">{index + 1}</td>
                  <td className="p-3 font-medium">{fee.name}</td>
                  <td className="p-3 font-bold text-primary">{formatCurrency(fee.price)}</td>
                  <td className="p-3"></td>
                </tr>
              ))}
              {tempRowIds.map((id, index) => (
                <TempFeeRow
                  key={id}
                  index={fees.length + index}
                  onRemove={() => handleRemoveTempRow(id)}
                  onSave={(name, price) => handleSaveFee(name, price, id)}
                />
              ))}
              {fees.length === 0 && tempRowIds.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-sm text-muted-foreground italic">
                    No fees added yet. Click Add Fees to record a new fee.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t pt-4">
          <Button type="button" size="sm" onClick={handleAddFeeRow} className="flex items-center gap-1">
            <Plus className="size-4" />
            Add Fees
          </Button>
          <div className="flex gap-8 text-right self-end sm:self-auto">
            <div>
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase block">Total Fees</span>
              <span className="text-sm font-bold text-primary">{formatCurrency(feesTotal)}</span>
            </div>
            {totalPriceAfterFee !== undefined && (
              <div>
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase block">Total Price After Fee</span>
                <span className="text-sm font-bold text-primary">{formatCurrency(totalPriceAfterFee)}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
