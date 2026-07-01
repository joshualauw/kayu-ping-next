"use client";

import { useMemo } from "react";
import { useFieldArray, Control, Controller, useWatch } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldError } from "@/components/ui/field";
import { WoodForSelect } from "@/lib/services/wood-service";
import { MaterialForSelect } from "@/lib/services/material-service";
import { Measurement } from "@/generated/prisma/enums";
import { calculateWoodVolume } from "@/lib/helpers/core";
import { formatCurrency } from "@/lib/utils";

interface PurchasesCartProps {
  control: Control<any>;
  woods: WoodForSelect[];
  materials: MaterialForSelect[];
  errors?: any;
  setValue: (name: string, value: any) => void;
}

export default function PurchasesCart({ control, woods, materials, errors, setValue }: PurchasesCartProps) {
  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = useWatch({
    control,
    name: "items",
    defaultValue: [],
  });

  const handleAddItem = () => {
    appendItem({
      woodId: "",
      materialId: "",
      pricePerCubic: "",
      width: "",
      height: "",
      diameterSmall: "",
      diameterLarge: "",
      length: "",
      quantity: "1",
    });
  };

  const { computedItems, grandTotal, grandVolume } = useMemo(() => {
    let total = 0;
    let totalVol = 0;

    const computed = (watchedItems || []).map((item: any) => {
      let volume = 0;
      let totalVolume = 0;
      let subtotal = 0;
      let measurement: Measurement | undefined = undefined;

      if (item?.materialId) {
        const material = materials.find((m) => m.id === Number(item.materialId));
        measurement = material?.measurement;
        const pricePerCubic = Number(item.pricePerCubic) || 0;

        if (measurement) {
          try {
            const length = Number(item.length);
            const params: any = { length, measurement };

            if (measurement === Measurement.CUBE) {
              params.width = Number(item.width);
              params.height = Number(item.height);
            } else if (measurement === Measurement.CYLINDER) {
              params.diameterSmall = Number(item.diameterSmall);
              params.diameterLarge = Number(item.diameterLarge);
            }

            if (
              (measurement === Measurement.CUBE && params.width > 0 && params.height > 0 && params.length > 0) ||
              (measurement === Measurement.CYLINDER && params.diameterSmall > 0 && params.diameterLarge > 0 && params.length > 0)
            ) {
              volume = calculateWoodVolume(params);
              totalVolume = volume * Number(item.quantity);
              subtotal = totalVolume * pricePerCubic;
            }
          } catch (e) {
            // Keep 0
          }
        }
      }

      total += subtotal;
      totalVol += totalVolume;

      return {
        measurement,
        volume,
        totalVolume,
        subtotal,
      };
    });

    return {
      computedItems: computed,
      grandTotal: total,
      grandVolume: totalVol,
    };
  }, [watchedItems, materials]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Cart Items</h2>
        <Button type="button" variant="secondary" onClick={handleAddItem} className="flex items-center gap-1">
          <Plus className="size-4" />
          Add Row
        </Button>
      </div>

      {itemFields.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No items added. Click &quot;Add Row&quot; to begin.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b bg-muted/30 font-medium text-muted-foreground">
                <th className="w-10 p-2 text-center">No.</th>
                <th className="min-w-40 p-2">Wood</th>
                <th className="min-w-40 p-2">Material</th>
                <th className="min-w-45 p-2">Dimensions (cm)</th>
                <th className="w-24 p-2">Length (cm)</th>
                <th className="w-20 p-2">Qty</th>
                <th className="w-32 p-2">Price / m³</th>
                <th className="w-32 p-2">Volume (m³)</th>
                <th className="w-32 p-2">Subtotal</th>
                <th className="w-16 p-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {itemFields.map((itemField, itemIndex) => {
                const computed = computedItems[itemIndex] || { measurement: undefined, volume: 0, totalVolume: 0, subtotal: 0 };
                const rowErrors = errors?.[itemIndex];
                const itemData = watchedItems[itemIndex] || {};

                return (
                  <tr key={itemField.id} className="hover:bg-muted/10">
                    <td className="p-2 text-center align-top font-medium">{itemIndex + 1}</td>

                    <td className="p-2 align-top">
                      <Controller
                        control={control}
                        name={`items.${itemIndex}.woodId`}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value ? String(field.value) : undefined}>
                            <SelectTrigger className="h-8 w-full bg-background text-xs">
                              <SelectValue placeholder="Select Wood" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                              {woods.map((w) => (
                                <SelectItem key={w.id} value={String(w.id)}>
                                  {w.name} ({w.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {rowErrors?.woodId && <FieldError errors={[rowErrors.woodId]} />}
                    </td>

                    <td className="p-2 align-top">
                      <Controller
                        control={control}
                        name={`items.${itemIndex}.materialId`}
                        render={({ field }) => (
                          <Select
                            onValueChange={(newVal) => {
                              field.onChange(newVal);
                              setValue(`items.${itemIndex}.width`, "");
                              setValue(`items.${itemIndex}.height`, "");
                              setValue(`items.${itemIndex}.diameterSmall`, "");
                              setValue(`items.${itemIndex}.diameterLarge`, "");
                            }}
                            value={field.value ? String(field.value) : undefined}
                          >
                            <SelectTrigger className="h-8 w-full bg-background text-xs">
                              <SelectValue placeholder="Select Material" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                              {materials.map((m) => (
                                <SelectItem key={m.id} value={String(m.id)}>
                                  {m.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {rowErrors?.materialId && <FieldError errors={[rowErrors.materialId]} />}
                    </td>

                    <td className="p-2 align-top">
                      {!itemData.materialId ? (
                        <div className="flex h-8 items-center text-[11px] text-muted-foreground italic">Select material first</div>
                      ) : computed.measurement === Measurement.CUBE ? (
                        <div className="flex gap-1">
                          <div className="flex-1">
                            <Controller
                              control={control}
                              name={`items.${itemIndex}.width`}
                              render={({ field }) => (
                                <Input
                                  type="number"
                                  {...field}
                                  value={field.value ?? ""}
                                  placeholder="Width"
                                  className="h-8 w-full px-2 text-xs"
                                />
                              )}
                            />
                            {rowErrors?.width && <FieldError errors={[rowErrors.width]} />}
                          </div>
                          <div className="flex-1">
                            <Controller
                              control={control}
                              name={`items.${itemIndex}.height`}
                              render={({ field }) => (
                                <Input
                                  type="number"
                                  {...field}
                                  value={field.value ?? ""}
                                  placeholder="Height"
                                  className="h-8 w-full px-2 text-xs"
                                />
                              )}
                            />
                            {rowErrors?.height && <FieldError errors={[rowErrors.height]} />}
                          </div>
                        </div>
                      ) : computed.measurement === Measurement.CYLINDER ? (
                        <div className="flex gap-1">
                          <div className="flex-1">
                            <Controller
                              control={control}
                              name={`items.${itemIndex}.diameterSmall`}
                              render={({ field }) => (
                                <Input
                                  type="number"
                                  {...field}
                                  value={field.value ?? ""}
                                  placeholder="Dia. S"
                                  className="h-8 w-full px-2 text-xs"
                                />
                              )}
                            />
                            {rowErrors?.diameterSmall && <FieldError errors={[rowErrors.diameterSmall]} />}
                          </div>
                          <div className="flex-1">
                            <Controller
                              control={control}
                              name={`items.${itemIndex}.diameterLarge`}
                              render={({ field }) => (
                                <Input
                                  type="number"
                                  {...field}
                                  value={field.value ?? ""}
                                  placeholder="Dia. L"
                                  className="h-8 w-full px-2 text-xs"
                                />
                              )}
                            />
                            {rowErrors?.diameterLarge && <FieldError errors={[rowErrors.diameterLarge]} />}
                          </div>
                        </div>
                      ) : null}
                    </td>

                    <td className="p-2 align-top">
                      <Controller
                        control={control}
                        name={`items.${itemIndex}.length`}
                        render={({ field }) => (
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? ""}
                            placeholder="Length"
                            className="h-8 w-full px-2 text-xs"
                          />
                        )}
                      />
                      {rowErrors?.length && <FieldError errors={[rowErrors.length]} />}
                    </td>

                    <td className="p-2 align-top">
                      <Controller
                        control={control}
                        name={`items.${itemIndex}.quantity`}
                        render={({ field }) => (
                          <Input type="number" {...field} value={field.value ?? ""} placeholder="Qty" className="h-8 w-full px-2 text-xs" />
                        )}
                      />
                      {rowErrors?.quantity && <FieldError errors={[rowErrors.quantity]} />}
                    </td>

                    <td className="p-2 align-top">
                      <Controller
                        control={control}
                        name={`items.${itemIndex}.pricePerCubic`}
                        render={({ field }) => (
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? ""}
                            placeholder="Price"
                            className="h-8 w-full px-2 text-xs"
                          />
                        )}
                      />
                      {rowErrors?.pricePerCubic && <FieldError errors={[rowErrors.pricePerCubic]} />}
                    </td>

                    <td className="p-2 align-top font-mono text-[11px] whitespace-nowrap">
                      <div className="space-y-0.5">
                        <div>Single: {computed.volume > 0 ? computed.volume.toFixed(4) : "0.0000"} m³</div>
                        <div className="font-semibold text-muted-foreground">
                          Total: {computed.totalVolume > 0 ? computed.totalVolume.toFixed(4) : "0.0000"} m³
                        </div>
                      </div>
                    </td>

                    <td className="p-2 align-top font-semibold whitespace-nowrap">{formatCurrency(computed.subtotal)}</td>

                    <td className="p-2 text-right align-top">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon-xs"
                        onClick={() => removeItem(itemIndex)}
                        aria-label="Remove item"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {itemFields.length > 0 && (
        <div className="flex justify-end gap-8 border-t pt-4 pr-3">
          <div className="space-y-1 text-right">
            <span className="block text-sm font-medium text-muted-foreground">Total Volume</span>
            <span className="block text-2xl font-bold tracking-tight text-primary">{grandVolume.toFixed(4)} m³</span>
          </div>
          <div className="space-y-1 text-right">
            <span className="block text-sm font-medium text-muted-foreground">Grand Total</span>
            <span className="block text-2xl font-bold tracking-tight text-primary">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
