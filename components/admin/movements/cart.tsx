"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { useFieldArray, Control, Controller, useWatch } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldError } from "@/components/ui/field";
import { useGetInventoryByLocation } from "@/hooks/swr/inventories/use-get-inventory-by-location";
import { generateWoodVariantLabel } from "@/lib/helpers/core";
import { toast } from "sonner";

interface MovementsCartProps {
  control: Control<any>;
  errors?: any;
}

export default function MovementsCart({ control, errors }: MovementsCartProps) {
  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
    replace: replaceItems,
  } = useFieldArray({
    control,
    name: "items",
  });

  const fromLocationId = useWatch({
    control,
    name: "fromLocationId",
    defaultValue: "",
  });

  const watchedItems = useWatch({
    control,
    name: "items",
    defaultValue: [],
  });

  const prevLocationIdRef = useRef(fromLocationId);
  useEffect(() => {
    if (prevLocationIdRef.current !== fromLocationId) {
      replaceItems([]);
      prevLocationIdRef.current = fromLocationId;
    }
  }, [fromLocationId, replaceItems]);

  const { data: inventoryData, isLoading, error: fetchError } = useGetInventoryByLocation(fromLocationId ? Number(fromLocationId) : null);

  const [selectedInvId, setSelectedInvId] = useState("");

  const availableInventory = useMemo(() => {
    if (!inventoryData) return [];
    return inventoryData.filter((inv) => !watchedItems.some((item: any) => Number(item.inventoryId) === inv.id));
  }, [inventoryData, watchedItems]);

  const handleAddItem = () => {
    if (!fromLocationId) {
      toast.error("Please select a source location first.");
      return;
    }

    if (!selectedInvId) {
      toast.error("Please select an item to add.");
      return;
    }

    const selectedInv = inventoryData?.find((inv) => inv.id === Number(selectedInvId));
    if (!selectedInv) {
      toast.error("Selected item not found.");
      return;
    }

    appendItem({
      inventoryId: selectedInv.id,
      woodVariantId: selectedInv.woodVariantId,
      quantity: 1,
      originalStock: selectedInv.stock,
      variant: selectedInv.variant,
    });

    setSelectedInvId("");
  };

  const { computedItems, grandVolume } = useMemo(() => {
    let totalVol = 0;

    const computed = (watchedItems || []).map((item: any) => {
      const qty = Number(item.quantity) || 0;
      const singleVolume = item.variant?.volume || 0;
      const volume = singleVolume * qty;

      totalVol += volume;

      return {
        volume: singleVolume,
        totalVolume: volume,
      };
    });

    return {
      computedItems: computed,
      grandVolume: totalVol,
    };
  }, [watchedItems]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Cart Items</h2>
          {isLoading && <p className="animate-pulse text-xs text-muted-foreground">Loading inventory...</p>}
          {fetchError && <p className="text-xs text-destructive">Failed to load inventory.</p>}
        </div>
      </div>

      {!fromLocationId ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Please select a source location above to configure cart items.
        </div>
      ) : (
        <div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
          {itemFields.length > 0 && (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b bg-muted/30 font-medium text-muted-foreground">
                    <th className="w-10 p-2">No.</th>
                    <th className="p-2">Wood Variant</th>
                    <th className="w-24 p-2">Qty</th>
                    <th className="w-40 p-2">Volume (m³)</th>
                    <th className="w-16 p-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {itemFields.map((itemField, itemIndex) => {
                    const computed = computedItems[itemIndex] || { volume: 0, totalVolume: 0 };
                    const itemError = errors?.[itemIndex];
                    const itemData = watchedItems[itemIndex];

                    const woodLabel = itemData?.variant
                      ? generateWoodVariantLabel({
                          woodCode: itemData.variant.wood.code,
                          materialCode: itemData.variant.material.name,
                          width: itemData.variant.width,
                          height: itemData.variant.height,
                          diameterSmall: itemData.variant.diameterSmall,
                          diameterLarge: itemData.variant.diamterLarge,
                          length: itemData.variant.length,
                          measurement: itemData.variant.material.measurement,
                        })
                      : "-";

                    return (
                      <tr key={itemField.id} className="hover:bg-muted/10">
                        <td className="p-2 align-middle font-medium">{itemIndex + 1}</td>
                        <td className="p-2 align-middle font-medium">
                          <div className="space-y-0.5">
                            <div>{woodLabel}</div>
                            <div className="text-[10px] font-normal text-muted-foreground">
                              Available Stock: {(itemField as any).originalStock}
                            </div>
                          </div>
                        </td>
                        <td className="p-2 align-middle">
                          <Controller
                            control={control}
                            name={`items.${itemIndex}.quantity`}
                            render={({ field }) => (
                              <Input
                                type="number"
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  const max = (itemField as any).originalStock;
                                  if (val > max) {
                                    toast.error(`Quantity cannot exceed available stock (${max})`);
                                    field.onChange(max);
                                  } else {
                                    field.onChange(e.target.value);
                                  }
                                }}
                                className="h-8 w-full px-2 text-xs"
                                placeholder="Qty"
                              />
                            )}
                          />
                          {itemError?.quantity && <FieldError errors={[itemError.quantity]} />}
                        </td>
                        <td className="p-2 align-middle whitespace-nowrap">
                          <div className="space-y-0.5">
                            <div>Single: {computed.volume.toFixed(4)} m³</div>
                            <div className="font-semibold text-muted-foreground">Total: {computed.totalVolume.toFixed(4)} m³</div>
                          </div>
                        </td>
                        <td className="p-2 text-right align-middle">
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

          <div className="flex flex-col gap-3 rounded-md bg-muted/20 p-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1">
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Select Item</span>
              <Select onValueChange={setSelectedInvId} value={selectedInvId}>
                <SelectTrigger className="h-9 w-full bg-background">
                  <SelectValue placeholder="Choose an item from stock..." />
                </SelectTrigger>
                <SelectContent position="popper">
                  {availableInventory.map((inv) => {
                    const label =
                      generateWoodVariantLabel({
                        woodCode: inv.variant.wood.code,
                        materialCode: inv.variant.material.name,
                        width: inv.variant.width,
                        height: inv.variant.height,
                        diameterSmall: inv.variant.diameterSmall,
                        diameterLarge: inv.variant.diamterLarge,
                        length: inv.variant.length,
                        measurement: inv.variant.material.measurement,
                      }) + ` (stock: ${inv.stock})`;

                    return (
                      <SelectItem key={inv.id} value={String(inv.id)}>
                        {label}
                      </SelectItem>
                    );
                  })}
                  {availableInventory.length === 0 && (
                    <div className="p-2 text-center text-xs text-muted-foreground italic">No items available to select.</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <Button type="button" size="sm" onClick={handleAddItem} className="mb-1 h-9 gap-1">
              <Plus className="size-4" />
              Add Row
            </Button>
          </div>
        </div>
      )}

      {fromLocationId && itemFields.length > 0 && (
        <div className="flex justify-end gap-8 border-t pt-4 pr-3">
          <div className="space-y-1 text-right">
            <span className="block text-sm font-medium text-muted-foreground">Total Volume</span>
            <span className="block text-2xl font-bold tracking-tight text-primary">{grandVolume.toFixed(4)} m³</span>
          </div>
        </div>
      )}
    </div>
  );
}
