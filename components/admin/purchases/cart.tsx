"use client";

import { useMemo } from "react";
import { useFieldArray, Control, Controller, useWatch, UseFormSetValue } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { CreatePurchaseFormInput } from "@/lib/schemas/purchases/create-purchase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldError } from "@/components/ui/field";
import { WoodForSelect } from "@/lib/services/wood-service";
import { MaterialForSelect } from "@/lib/services/material-service";
import { Measurement } from "@/generated/prisma/enums";
import { calculateWoodVolume } from "@/lib/helpers/core";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PurchasesCartProps {
  control: Control<CreatePurchaseFormInput, any, any>;
  woods: WoodForSelect[];
  materials: MaterialForSelect[];
  errors?: any;
  setValue: UseFormSetValue<CreatePurchaseFormInput>;
}

export default function PurchasesCart({ control, woods, materials, errors, setValue }: PurchasesCartProps) {
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
      items: [
        {
          woodId: "" as any,
          materialId: "" as any,
          measurement: undefined,
          pricePerCubic: "" as any,
          width: "" as any,
          height: "" as any,
          diameterSmall: "" as any,
          diameterLarge: "" as any,
          length: "" as any,
          quantity: "1" as any,
        },
      ],
    });
  };

  const { computedGroups, grandTotal, grandVolume } = useMemo(() => {
    let total = 0;
    let totalVol = 0;

    const computed = (watchedGroups || []).map((group) => {
      let groupTotalVolume = 0;
      let groupTotalPrice = 0;

      const computedItems = (group?.items || []).map((item) => {
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
        groupTotalVolume += totalVolume;
        groupTotalPrice += subtotal;

        return {
          measurement,
          volume,
          totalVolume,
          subtotal,
        };
      });

      return {
        items: computedItems,
        totalVolume: groupTotalVolume,
        totalPrice: groupTotalPrice,
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
        <h2 className="text-lg font-semibold tracking-tight">Purchase Batches</h2>
        <Button type="button" variant="outline" onClick={handleAddGroup} className="flex items-center gap-1">
          <Plus className="size-4" />
          Add Batch / Group
        </Button>
      </div>

      {groupFields.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No batches added. Click &quot;Add Batch / Group&quot; to begin.
        </div>
      ) : (
        <div className="space-y-6">
          {groupFields.map((groupField, groupIndex) => {
            const groupErrors = errors?.[groupIndex]?.items;
            const computedGroup = computedGroups[groupIndex] || { items: [], totalVolume: 0, totalPrice: 0 };
            const watchedItems = watchedGroups[groupIndex]?.items || [];

            return (
              <GroupBlock
                key={groupField.id}
                groupIndex={groupIndex}
                control={control}
                woods={woods}
                materials={materials}
                errors={groupErrors}
                setValue={setValue}
                onRemove={() => removeGroup(groupIndex)}
                computedGroup={computedGroup}
                watchedItems={watchedItems}
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

interface GroupBlockProps {
  groupIndex: number;
  control: any;
  woods: WoodForSelect[];
  materials: MaterialForSelect[];
  errors: any;
  setValue: any;
  onRemove: () => void;
  computedGroup: {
    items: any[];
    totalVolume: number;
    totalPrice: number;
  };
  watchedItems: any[];
}

function GroupBlock({ groupIndex, control, woods, materials, errors, setValue, onRemove, computedGroup, watchedItems }: GroupBlockProps) {
  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control,
    name: `groups.${groupIndex}.items`,
  });

  const handleAddItem = () => {
    appendItem({
      woodId: "" as any,
      materialId: "" as any,
      measurement: undefined,
      pricePerCubic: "" as any,
      width: "" as any,
      height: "" as any,
      diameterSmall: "" as any,
      diameterLarge: "" as any,
      length: "" as any,
      quantity: "1" as any,
    });
  };

  return (
    <Card className="relative overflow-hidden border border-muted bg-card shadow-sm transition-all duration-200 hover:border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-bold text-primary/90">Batch #{groupIndex + 1}</CardTitle>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="mr-1 size-4" />
          Remove Batch
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {itemFields.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground italic">
            No items in this batch. Click &quot;Add Row&quot; to begin.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border bg-background/50">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b bg-muted/20 font-medium text-muted-foreground">
                  <th className="w-10 p-2 text-center">No.</th>
                  <th className="w-70 p-2">Wood / Material / Dimensions</th>
                  <th className="w-24 p-2">Length (cm)</th>
                  <th className="w-18 p-2">Qty</th>
                  <th className="w-32 p-2">Price / m³</th>
                  <th className="w-32 p-2">Volume (m³)</th>
                  <th className="w-36 p-2">Subtotal</th>
                  <th className="w-12 p-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {itemFields.map((itemField, itemIndex) => {
                  const computed = computedGroup.items[itemIndex] || { measurement: undefined, volume: 0, totalVolume: 0, subtotal: 0 };
                  const rowErrors = errors?.[itemIndex];
                  const itemData = watchedItems[itemIndex] || {};

                  return (
                    <tr key={itemField.id} className="hover:bg-muted/5">
                      <td className="p-2 text-center align-middle font-medium">{itemIndex + 1}</td>

                      <td className="p-2 align-middle">
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <div className="min-w-30 flex-1">
                              <Controller
                                control={control}
                                name={`groups.${groupIndex}.items.${itemIndex}.woodId`}
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
                            </div>

                            <div className="min-w-30 flex-1">
                              <Controller
                                control={control}
                                name={`groups.${groupIndex}.items.${itemIndex}.materialId`}
                                render={({ field }) => (
                                  <Select
                                    onValueChange={(newVal) => {
                                      field.onChange(newVal);
                                      const material = materials.find((m) => m.id === Number(newVal));
                                      setValue(`groups.${groupIndex}.items.${itemIndex}.measurement`, material?.measurement);
                                      setValue(`groups.${groupIndex}.items.${itemIndex}.width`, "");
                                      setValue(`groups.${groupIndex}.items.${itemIndex}.height`, "");
                                      setValue(`groups.${groupIndex}.items.${itemIndex}.diameterSmall`, "");
                                      setValue(`groups.${groupIndex}.items.${itemIndex}.diameterLarge`, "");
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
                            </div>
                          </div>

                          <div>
                            {!itemData.materialId ? (
                              <div className="flex h-8 items-center text-[10px] text-muted-foreground italic">Select material first</div>
                            ) : computed.measurement === Measurement.CUBE ? (
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <Controller
                                    control={control}
                                    name={`groups.${groupIndex}.items.${itemIndex}.width`}
                                    render={({ field }) => (
                                      <Input
                                        type="number"
                                        {...field}
                                        value={(field.value as any) ?? ""}
                                        placeholder="Width (cm)"
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
                                    render={({ field }) => (
                                      <Input
                                        type="number"
                                        {...field}
                                        value={(field.value as any) ?? ""}
                                        placeholder="Height (cm)"
                                        className="h-8 w-full px-2 text-xs"
                                      />
                                    )}
                                  />
                                  {rowErrors?.height && <FieldError errors={[rowErrors.height]} />}
                                </div>
                              </div>
                            ) : computed.measurement === Measurement.CYLINDER ? (
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <Controller
                                    control={control}
                                    name={`groups.${groupIndex}.items.${itemIndex}.diameterSmall`}
                                    render={({ field }) => (
                                      <Input
                                        type="number"
                                        {...field}
                                        value={(field.value as any) ?? ""}
                                        placeholder="Dia. S (cm)"
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
                                    render={({ field }) => (
                                      <Input
                                        type="number"
                                        {...field}
                                        value={(field.value as any) ?? ""}
                                        placeholder="Dia. L (cm)"
                                        className="h-8 w-full px-2 text-xs"
                                      />
                                    )}
                                  />
                                  {rowErrors?.diameterLarge && <FieldError errors={[rowErrors.diameterLarge]} />}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      <td className="p-2 align-middle">
                        <Controller
                          control={control}
                          name={`groups.${groupIndex}.items.${itemIndex}.length`}
                          render={({ field }) => (
                            <Input
                              type="number"
                              {...field}
                              value={(field.value as any) ?? ""}
                              placeholder="Length"
                              className="h-8 w-full px-2 text-xs"
                            />
                          )}
                        />
                        {rowErrors?.length && <FieldError errors={[rowErrors.length]} />}
                      </td>

                      <td className="p-2 align-middle">
                        <Controller
                          control={control}
                          name={`groups.${groupIndex}.items.${itemIndex}.quantity`}
                          render={({ field }) => (
                            <Input
                              type="number"
                              {...field}
                              value={(field.value as any) ?? ""}
                              placeholder="Qty"
                              className="h-8 w-full px-2 text-xs"
                            />
                          )}
                        />
                        {rowErrors?.quantity && <FieldError errors={[rowErrors.quantity]} />}
                      </td>

                      <td className="p-2 align-middle">
                        <Controller
                          control={control}
                          name={`groups.${groupIndex}.items.${itemIndex}.pricePerCubic`}
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

                      <td className="p-2 align-middle font-mono text-[11px] whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div>Single: {computed.volume > 0 ? computed.volume.toFixed(4) : "0.0000"} m³</div>
                          <div className="font-semibold text-muted-foreground">
                            Total: {computed.totalVolume > 0 ? computed.totalVolume.toFixed(4) : "0.0000"} m³
                          </div>
                        </div>
                      </td>

                      <td className="p-2 align-middle font-semibold whitespace-nowrap">{formatCurrency(computed.subtotal)}</td>

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
        <div className="flex items-center justify-between">
          <Button type="button" variant="secondary" size="xs" onClick={handleAddItem} className="flex items-center gap-1">
            <Plus className="size-3.5" />
            Add Row
          </Button>
          {computedGroup && (
            <div className="flex gap-4 rounded-md bg-muted/20 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              <div>
                Volume: <span className="font-bold text-primary">{computedGroup.totalVolume.toFixed(4)} m³</span>
              </div>
              <div className="w-px bg-muted-foreground/20" />
              <div>
                Total: <span className="font-bold text-primary">{formatCurrency(computedGroup.totalPrice)}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
