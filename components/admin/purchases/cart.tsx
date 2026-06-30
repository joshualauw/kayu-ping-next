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
import { calculateWoodVolume, calculateWoodTotalVolume, calculateSubtotal } from "@/lib/helpers/core";
import { formatCurrency } from "@/lib/utils";

interface PurchasesCartProps {
  control: Control<any>;
  woods: WoodForSelect[];
  materials: MaterialForSelect[];
  errors?: any;
}

export default function PurchasesCart({ control, woods, materials, errors }: PurchasesCartProps) {
  const {
    fields: groupFields,
    append: appendGroup,
    remove: removeGroup,
  } = useFieldArray({
    control,
    name: "groups",
  });

  const watchedGroups = useWatch({
    control,
    name: "groups",
    defaultValue: [],
  });

  const handleAddGroup = () => {
    appendGroup({
      woodId: "",
      materialId: "",
      pricePerCubic: "",
      items: [],
    });
  };

  const { computedGroups, grandTotal, grandVolume } = useMemo(() => {
    let total = 0;
    let totalVol = 0;
    const computed = (watchedGroups || []).map((group: any) => {
      if (!group) return { items: [], measurement: undefined, volume: 0, subtotal: 0 };

      const material = materials.find((m) => m.id === Number(group.materialId));
      const measurement = material?.measurement;
      const pricePerCubic = Number(group.pricePerCubic) || 0;

      let groupVol = 0;
      let groupSub = 0;

      const computedItems = (group.items || []).map((item: any) => {
        let volume = 0;
        let totalVolume = 0;
        let subtotal = 0;

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
              totalVolume = calculateWoodTotalVolume(volume, Number(item.quantity) || 0);
              subtotal = calculateSubtotal(volume, pricePerCubic, Number(item.quantity) || 0);
            }
          } catch (e) {
            // Keep 0
          }
        }

        groupVol += totalVolume;
        groupSub += subtotal;

        return {
          volume,
          totalVolume,
          subtotal,
        };
      });

      total += groupSub;
      totalVol += groupVol;

      return {
        measurement,
        items: computedItems,
        volume: groupVol,
        subtotal: groupSub,
      };
    });

    return {
      computedGroups: computed,
      grandTotal: total,
      grandVolume: totalVol,
    };
  }, [watchedGroups, materials]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Cart Items</h2>
        <Button type="button" variant="secondary" onClick={handleAddGroup} className="flex items-center gap-1">
          <Plus className="size-4" />
          Add Group
        </Button>
      </div>

      {groupFields.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No item groups added. Click &quot;Add Group&quot; to begin.
        </div>
      ) : (
        <div className="space-y-6">
          {groupFields.map((groupField, groupIndex) => {
            const groupErrors = errors?.[groupIndex];
            const computedGroup = computedGroups[groupIndex] || { measurement: undefined, items: [], volume: 0, subtotal: 0 };

            return (
              <PurchasesCartGroup
                key={groupField.id}
                control={control}
                groupIndex={groupIndex}
                woods={woods}
                materials={materials}
                groupErrors={groupErrors}
                computedGroup={computedGroup}
                onRemove={() => removeGroup(groupIndex)}
              />
            );
          })}
        </div>
      )}

      {groupFields.length > 0 && (
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

interface PurchasesCartGroupProps {
  control: Control<any>;
  groupIndex: number;
  woods: WoodForSelect[];
  materials: MaterialForSelect[];
  groupErrors: any;
  computedGroup: {
    measurement: Measurement | undefined;
    items: { volume: number; totalVolume: number; subtotal: number }[];
    volume: number;
    subtotal: number;
  };
  onRemove: () => void;
}

function PurchasesCartGroup({ control, groupIndex, woods, materials, groupErrors, computedGroup, onRemove }: PurchasesCartGroupProps) {
  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
    replace: replaceItems,
  } = useFieldArray({
    control,
    name: `groups.${groupIndex}.items`,
  });

  const selectedWoodId = useWatch({
    control,
    name: `groups.${groupIndex}.woodId`,
    defaultValue: "",
  });

  const selectedMaterialId = useWatch({
    control,
    name: `groups.${groupIndex}.materialId`,
    defaultValue: "",
  });

  const handleAddItem = () => {
    appendItem({
      width: "",
      height: "",
      diameterSmall: "",
      diameterLarge: "",
      length: "",
      quantity: "1",
    });
  };

  const isGroupConfigured = selectedWoodId && selectedMaterialId;

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-4">
          <span className="text-sm font-semibold whitespace-nowrap">Group #{groupIndex + 1}</span>

          <div className="w-45">
            <Controller
              control={control}
              name={`groups.${groupIndex}.woodId`}
              render={({ field: selectField }) => (
                <Select
                  onValueChange={(newVal) => {
                    selectField.onChange(newVal);
                    replaceItems([]);
                  }}
                  value={selectField.value ? String(selectField.value) : undefined}
                >
                  <SelectTrigger className="h-9 w-full">
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
            {groupErrors?.woodId && <FieldError errors={[groupErrors.woodId]} />}
          </div>

          <div className="w-45">
            <Controller
              control={control}
              name={`groups.${groupIndex}.materialId`}
              render={({ field: selectField }) => (
                <Select
                  onValueChange={(newVal) => {
                    selectField.onChange(newVal);
                    replaceItems([]);
                  }}
                  value={selectField.value ? String(selectField.value) : undefined}
                >
                  <SelectTrigger className="h-9 w-full">
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
            {groupErrors?.materialId && <FieldError errors={[groupErrors.materialId]} />}
          </div>

          <div className="w-37.5">
            <Controller
              control={control}
              name={`groups.${groupIndex}.pricePerCubic`}
              render={({ field: inputField }) => (
                <Input
                  type="number"
                  {...inputField}
                  value={inputField.value ?? ""}
                  placeholder="Price / m³"
                  className="h-9 w-full px-3 text-xs"
                />
              )}
            />
            {groupErrors?.pricePerCubic && <FieldError errors={[groupErrors.pricePerCubic]} />}
          </div>
        </div>

        <Button type="button" variant="destructive" size="sm" onClick={onRemove} className="flex h-9 items-center gap-1">
          <Trash2 className="size-4" />
          Remove Group
        </Button>
      </div>

      {!isGroupConfigured ? (
        <div className="py-4 text-center text-xs text-muted-foreground italic">
          Select Wood and Material above to configure this group and add items.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b bg-muted/30 font-medium text-muted-foreground">
                  <th className="p-2">Dimensions (cm)</th>
                  <th className="p-2">Length (cm)</th>
                  <th className="p-2">Qty</th>
                  <th className="p-2">Volume (m³)</th>
                  <th className="p-2">Subtotal</th>
                  <th className="p-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {itemFields.map((itemField, itemIndex) => {
                  const computed = computedGroup.items[itemIndex] || { volume: 0, totalVolume: 0, subtotal: 0 };
                  const rowErrors = groupErrors?.items?.[itemIndex];

                  return (
                    <tr key={itemField.id} className="hover:bg-muted/10">
                      <td className="min-w-45 p-2 align-top">
                        {computedGroup.measurement === Measurement.CUBE && (
                          <div className="flex gap-1">
                            <div className="flex-1">
                              <Controller
                                control={control}
                                name={`groups.${groupIndex}.items.${itemIndex}.width`}
                                render={({ field: inputField }) => (
                                  <Input
                                    type="number"
                                    {...inputField}
                                    value={inputField.value ?? ""}
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
                                name={`groups.${groupIndex}.items.${itemIndex}.height`}
                                render={({ field: inputField }) => (
                                  <Input
                                    type="number"
                                    {...inputField}
                                    value={inputField.value ?? ""}
                                    placeholder="Height"
                                    className="h-8 w-full px-2 text-xs"
                                  />
                                )}
                              />
                              {rowErrors?.height && <FieldError errors={[rowErrors.height]} />}
                            </div>
                          </div>
                        )}

                        {computedGroup.measurement === Measurement.CYLINDER && (
                          <div className="flex gap-1">
                            <div className="flex-1">
                              <Controller
                                control={control}
                                name={`groups.${groupIndex}.items.${itemIndex}.diameterSmall`}
                                render={({ field: inputField }) => (
                                  <Input
                                    type="number"
                                    {...inputField}
                                    value={inputField.value ?? ""}
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
                                name={`groups.${groupIndex}.items.${itemIndex}.diameterLarge`}
                                render={({ field: inputField }) => (
                                  <Input
                                    type="number"
                                    {...inputField}
                                    value={inputField.value ?? ""}
                                    placeholder="Dia. L"
                                    className="h-8 w-full px-2 text-xs"
                                  />
                                )}
                              />
                              {rowErrors?.diameterLarge && <FieldError errors={[rowErrors.diameterLarge]} />}
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="min-w-22.5 p-2 align-top">
                        <Controller
                          control={control}
                          name={`groups.${groupIndex}.items.${itemIndex}.length`}
                          render={({ field: inputField }) => (
                            <Input
                              type="number"
                              {...inputField}
                              value={inputField.value ?? ""}
                              placeholder="Length"
                              className="h-8 w-full px-2 text-xs"
                            />
                          )}
                        />
                        {rowErrors?.length && <FieldError errors={[rowErrors.length]} />}
                      </td>

                      <td className="min-w-17.5 p-2 align-top">
                        <Controller
                          control={control}
                          name={`groups.${groupIndex}.items.${itemIndex}.quantity`}
                          render={({ field: inputField }) => (
                            <Input
                              type="number"
                              {...inputField}
                              value={inputField.value ?? ""}
                              placeholder="Qty"
                              className="h-8 w-full px-2 text-xs"
                            />
                          )}
                        />
                        {rowErrors?.quantity && <FieldError errors={[rowErrors.quantity]} />}
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

                      {/* Action */}
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

          <div className="flex items-center justify-between border-t pt-4">
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="flex h-8 items-center gap-1 text-xs">
              <Plus className="size-3.5" />
              Add Row
            </Button>
            <div className="flex gap-6 text-right">
              <div>
                <span className="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Group Volume</span>
                <span className="font-mono text-sm font-bold">{computedGroup.volume.toFixed(4)} m³</span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Group Subtotal</span>
                <span className="text-sm font-bold">{formatCurrency(computedGroup.subtotal)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
