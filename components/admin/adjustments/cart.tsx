"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { useFieldArray, Control, Controller, useWatch } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetInventoryByLocation } from "@/hooks/swr/inventories/use-get-inventory-by-location";
import { generateWoodVariantLabel } from "@/lib/helpers/core";
import { toast } from "sonner";
import { AdjustmentType, AdjustmentReason } from "@/generated/prisma/enums";

import { CreateAdjustmentFormInput } from "@/lib/schemas/adjustments/create-adjustment";
import { WoodForSelect } from "@/lib/services/wood-service";
import { MaterialForSelect } from "@/lib/services/material-service";
import { GradeForSelect } from "@/lib/services/grade-service";
import InventoryPicker from "@/components/shared/inventory-picker";
import { LocationInventoryItem } from "@/app/api/inventories/by-location/route";

interface AdjustmentsCartProps {
  control: Control<CreateAdjustmentFormInput, any, any>;
  errors?: any;
  woods: WoodForSelect[];
  materials: MaterialForSelect[];
  grades: GradeForSelect[];
}

export default function AdjustmentsCart({ control, errors, woods, materials, grades }: AdjustmentsCartProps) {
  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
    replace: replaceItems,
  } = useFieldArray({
    control,
    name: "items",
  });

  const locationId = useWatch({
    control,
    name: "locationId",
    defaultValue: "",
  });

  const watchedItems = useWatch({
    control,
    name: "items",
    defaultValue: [],
  });

  const prevLocationIdRef = useRef(locationId);
  useEffect(() => {
    if (prevLocationIdRef.current !== locationId) {
      replaceItems([]);
      prevLocationIdRef.current = locationId;
    }
  }, [locationId, replaceItems]);

  const { isLoading, error: fetchError } = useGetInventoryByLocation(locationId ? Number(locationId) : null);

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const existingIds = useMemo(() => {
    return (watchedItems || []).map((item) => Number(item?.inventoryId)).filter(Boolean);
  }, [watchedItems]);

  const handleSelectItems = (selectedInvs: LocationInventoryItem[]) => {
    selectedInvs.forEach((selectedInv) => {
      appendItem({
        inventoryId: selectedInv.id,
        woodVariantId: selectedInv.woodVariantId,
        gradeId: selectedInv.gradeId,
        quantity: 1,
        type: AdjustmentType.SUBTRACT,
        reason: AdjustmentReason.LOST,
        comment: "",
        originalStock: selectedInv.stock,
        variant: selectedInv.variant,
        grade: selectedInv.grade,
      });
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Cart Items</h2>
          {isLoading && <p className="animate-pulse text-xs text-muted-foreground">Loading inventory...</p>}
          {fetchError && <p className="text-xs text-destructive">Failed to load inventory.</p>}
        </div>
      </div>

      {!locationId ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Please select a location above to configure cart items.
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
                    <th className="w-24 p-2">Qty</th>
                    <th className="w-32 p-2">Type</th>
                    <th className="w-36 p-2">Reason</th>
                    <th className="p-2">Comment</th>
                    <th className="w-16 p-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {itemFields.map((itemField, itemIndex) => {
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
                                  const typeValue = itemData?.type;

                                  if (typeValue === AdjustmentType.SUBTRACT && val > max) {
                                    toast.error(`Quantity cannot exceed available stock (${max}) for subtraction.`);
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
                        <td className="p-2 align-middle">
                          <Controller
                            control={control}
                            name={`items.${itemIndex}.type`}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="h-8 w-full text-xs">
                                  <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={AdjustmentType.ADD}>ADD</SelectItem>
                                  <SelectItem value={AdjustmentType.SUBTRACT}>SUBTRACT</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {itemError?.type && <FieldError errors={[itemError.type]} />}
                        </td>
                        <td className="p-2 align-middle">
                          <Controller
                            control={control}
                            name={`items.${itemIndex}.reason`}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="h-8 w-full text-xs">
                                  <SelectValue placeholder="Reason" />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                  <SelectItem value={AdjustmentReason.LOST}>LOST</SelectItem>
                                  <SelectItem value={AdjustmentReason.FOUND}>FOUND</SelectItem>
                                  <SelectItem value={AdjustmentReason.DAMAGE}>DAMAGE</SelectItem>
                                  <SelectItem value={AdjustmentReason.OTHERS}>OTHERS</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {itemError?.reason && <FieldError errors={[itemError.reason]} />}
                        </td>
                        <td className="p-2 align-middle">
                          <Controller
                            control={control}
                            name={`items.${itemIndex}.comment`}
                            render={({ field }) => (
                              <Input
                                {...field}
                                value={field.value ?? ""}
                                className="h-8 w-full px-2 text-xs"
                                placeholder="Comment (optional)"
                              />
                            )}
                          />
                          {itemError?.comment && <FieldError errors={[itemError.comment]} />}
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
                if (!locationId) {
                  toast.error("Please select a location first.");
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
        locationId={locationId ? Number(locationId) : null}
        onSelect={handleSelectItems}
        woods={woods}
        materials={materials}
        grades={grades}
        existingIds={existingIds}
      />
    </div>
  );
}
