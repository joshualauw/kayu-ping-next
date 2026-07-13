"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { useFieldArray, Control, Controller, useWatch } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { generateWoodVariantLabel } from "@/lib/helpers/core";
import { toast } from "sonner";
import { CreateMovementFormInput } from "@/lib/schemas/movements/create-movement";
import { WoodForSelect } from "@/lib/services/wood-service";
import { MaterialForSelect } from "@/lib/services/material-service";
import { GradeForSelect } from "@/lib/services/grade-service";
import InventoryPicker from "@/components/shared/inventory-picker";
import { LocationInventoryItem } from "@/app/api/inventories/by-location/route";

interface MovementsCartProps {
  control: Control<CreateMovementFormInput, any, any>;
  errors?: any;
  woods: WoodForSelect[];
  materials: MaterialForSelect[];
  grades: GradeForSelect[];
}

export default function MovementsCart({ control, errors, woods, materials, grades }: MovementsCartProps) {
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

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const existingIds = useMemo(() => {
    return (watchedItems || []).map((item) => Number(item?.inventoryId)).filter(Boolean);
  }, [watchedItems]);

  const handleSelectItems = (selectedInvs: LocationInventoryItem[]) => {
    selectedInvs.forEach((selectedInv) => {
      appendItem({
        inventoryId: selectedInv.id,
        woodVariantId: selectedInv.woodVariantId,
        quantity: 1,
        originalStock: selectedInv.stock,
        variant: selectedInv.variant,
        grade: selectedInv.grade,
        lot: selectedInv.lot,
      });
    });
  };

  const { computedItems, grandVolume } = useMemo(() => {
    let totalVol = 0;

    const computed = (watchedItems || []).map((item) => {
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
                    <th className="w-24 p-2">Grade</th>
                    <th className="w-32 p-2">Lot</th>
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
                              Available Stock: {itemData?.originalStock ?? 0}
                            </div>
                          </div>
                        </td>
                        <td className="p-2 align-middle">
                          {itemData?.grade ? (
                            <Badge variant="secondary">{itemData.grade.code}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Ungraded</span>
                          )}
                        </td>
                        <td className="p-2 align-middle">
                          {itemData?.lot ? (
                            <Badge variant="outline" className="font-mono text-xs">
                              {itemData.lot.code}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">-</span>
                          )}
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
                                  const max = Number(itemData?.originalStock) || 0;
                                  if (val > max) {
                                    toast.error(`Quantity cannot exceed available stock tracking (${max})`);
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

          <div className="flex justify-start">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (!fromLocationId) {
                  toast.error("Please select a source location first.");
                  return;
                }
                setIsPickerOpen(true);
              }}
              className="h-9 gap-1.5"
            >
              <Plus className="size-4" />
              Select Item from Stock
            </Button>
          </div>
        </div>
      )}

      <InventoryPicker
        isOpen={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        locationId={fromLocationId ? Number(fromLocationId) : null}
        onSelect={handleSelectItems}
        woods={woods}
        materials={materials}
        grades={grades}
        existingIds={existingIds}
      />

      {!!fromLocationId && itemFields.length > 0 && (
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
