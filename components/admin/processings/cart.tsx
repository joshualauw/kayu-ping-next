"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { useFieldArray, Control, Controller, useWatch, UseFormSetError, UseFormClearErrors } from "react-hook-form";
import { Plus, Trash2, AlertTriangle, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldError } from "@/components/ui/field";
import { useGetInventoryByLocation } from "@/hooks/swr/inventories/use-get-inventory-by-location";
import { generateWoodVariantLabel } from "@/lib/helpers/core";
import { WoodVariantForSelect } from "@/lib/services/wood-service";
import { toast } from "sonner";

interface ProcessingCartProps {
  control: Control<any>;
  errors?: any;
  woodVariants: WoodVariantForSelect[];
  setError: UseFormSetError<any>;
  clearErrors: UseFormClearErrors<any>;
}

export default function ProcessingCart({ control, errors, woodVariants, setError, clearErrors }: ProcessingCartProps) {
  const locationId = useWatch({
    control,
    name: "locationId",
    defaultValue: "",
  });

  // Input Items Field Array
  const {
    fields: inputFields,
    append: appendInput,
    remove: removeInput,
    replace: replaceInputs,
  } = useFieldArray({
    control,
    name: "inputItems",
  });

  // Output Items Field Array
  const {
    fields: outputFields,
    append: appendOutput,
    remove: removeOutput,
    replace: replaceOutputs,
  } = useFieldArray({
    control,
    name: "outputItems",
  });

  const watchedInputItems = useWatch({
    control,
    name: "inputItems",
    defaultValue: [],
  });

  const watchedOutputItems = useWatch({
    control,
    name: "outputItems",
    defaultValue: [],
  });

  // Watch locationId to clear items on change
  const prevLocationIdRef = useRef(locationId);
  useEffect(() => {
    if (prevLocationIdRef.current !== locationId) {
      replaceInputs([]);
      replaceOutputs([]);
      prevLocationIdRef.current = locationId;
    }
  }, [locationId, replaceInputs, replaceOutputs]);

  // Fetch location stock for input options
  const { data: inventoryData, isLoading: isInventoryLoading } = useGetInventoryByLocation(
    locationId ? Number(locationId) : null
  );

  // States for selectors
  const [selectedInputInvId, setSelectedInputInvId] = useState("");
  const [selectedOutputVariantId, setSelectedOutputVariantId] = useState("");

  // Input select options: exclude already added inputs
  const availableInputInventory = useMemo(() => {
    if (!inventoryData) return [];
    return inventoryData.filter(
      (inv) => !watchedInputItems.some((item: any) => Number(item.inventoryId) === inv.id)
    );
  }, [inventoryData, watchedInputItems]);

  // Collect wood species IDs from inputs to filter output variants
  const inputWoodIds = useMemo(() => {
    return Array.from(new Set(watchedInputItems.map((item: any) => item.variant?.woodId).filter(Boolean)));
  }, [watchedInputItems]);

  // Output select options: filter by species in inputs, and exclude already added outputs
  const availableOutputVariants = useMemo(() => {
    if (inputWoodIds.length === 0) return [];
    return woodVariants.filter(
      (v) =>
        inputWoodIds.includes(v.woodId) &&
        !watchedOutputItems.some((item: any) => Number(item.woodVariantId) === v.id)
    );
  }, [woodVariants, inputWoodIds, watchedOutputItems]);

  const handleAddInputItem = () => {
    if (!locationId) {
      toast.error("Please select a location first.");
      return;
    }

    if (!selectedInputInvId) {
      toast.error("Please select an input item.");
      return;
    }

    const selectedInv = inventoryData?.find((inv) => inv.id === Number(selectedInputInvId));
    if (!selectedInv) {
      toast.error("Selected item not found.");
      return;
    }

    appendInput({
      inventoryId: selectedInv.id,
      woodVariantId: selectedInv.woodVariantId,
      quantity: 1,
      originalStock: selectedInv.stock,
      variant: selectedInv.variant,
    });

    setSelectedInputInvId("");
  };

  const handleAddOutputItem = () => {
    if (inputWoodIds.length === 0) {
      toast.error("Please add at least one input item first to determine allowed wood species.");
      return;
    }

    if (!selectedOutputVariantId) {
      toast.error("Please select an output item.");
      return;
    }

    const selectedVar = woodVariants.find((v) => v.id === Number(selectedOutputVariantId));
    if (!selectedVar) {
      toast.error("Selected variant not found.");
      return;
    }

    appendOutput({
      woodVariantId: selectedVar.id,
      quantity: 1,
      variant: selectedVar,
    });

    setSelectedOutputVariantId("");
  };

  // Calculations
  const { totalInputVolume, totalOutputVolume, isVolumeInvalid, yieldPercentage } = useMemo(() => {
    const inputVol = (watchedInputItems || []).reduce((acc: number, item: any) => {
      const qty = Number(item.quantity) || 0;
      const singleVolume = item.variant?.volume || 0;
      return acc + singleVolume * qty;
    }, 0);

    const outputVol = (watchedOutputItems || []).reduce((acc: number, item: any) => {
      const qty = Number(item.quantity) || 0;
      const singleVolume = item.variant?.volume || 0;
      return acc + singleVolume * qty;
    }, 0);

    const yieldPct = inputVol > 0 ? (outputVol / inputVol) * 100 : 0;
    const isInvalid = outputVol > inputVol && inputVol > 0;

    return {
      totalInputVolume: inputVol,
      totalOutputVolume: outputVol,
      isVolumeInvalid: isInvalid,
      yieldPercentage: yieldPct,
    };
  }, [watchedInputItems, watchedOutputItems]);

  // Set form level errors for volume mismatch
  useEffect(() => {
    if (isVolumeInvalid) {
      setError("outputItems", {
        type: "custom",
        message: "Total output volume cannot exceed total input volume.",
      });
    } else {
      clearErrors("outputItems");
    }
  }, [isVolumeInvalid, setError, clearErrors]);

  return (
    <div className="space-y-6">
      {/* Live Volume Stats Panel */}
      {locationId && (inputFields.length > 0 || outputFields.length > 0) && (
        <div className={`rounded-lg border p-4 shadow-sm transition-colors duration-200 ${isVolumeInvalid ? "border-destructive bg-destructive/5" : "border-primary/20 bg-primary/5"}`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2 ${isVolumeInvalid ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                <ArrowRightLeft className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-tight">Processing Yield Summary</h3>
                <p className="text-xs text-muted-foreground">Enforces input vs output species and volume limit.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 text-right">
              <div>
                <span className="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Input Volume</span>
                <span className="font-mono text-sm font-bold">{totalInputVolume.toFixed(4)} m³</span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Output Volume</span>
                <span className={`font-mono text-sm font-bold ${isVolumeInvalid ? "text-destructive" : "text-primary"}`}>
                  {totalOutputVolume.toFixed(4)} m³
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Yield</span>
                <span className={`text-sm font-bold ${isVolumeInvalid ? "text-destructive" : "text-primary"}`}>
                  {yieldPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {isVolumeInvalid && (
            <div className="mt-3 flex items-center gap-2 rounded border border-destructive/20 bg-destructive/10 p-2 text-xs text-destructive">
              <AlertTriangle className="size-4 shrink-0" />
              <span><strong>Invalid Yield Alert</strong>: Total output volume exceeds input volume. Please reduce output quantities or add more input items.</span>
            </div>
          )}
        </div>
      )}

      {!locationId ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Please select a location above to configure processing items.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* INPUT CARDS (Source Wood) */}
          <div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
            <div className="border-b pb-2">
              <h3 className="text-sm font-semibold text-primary">1. Input Items (Source Wood)</h3>
              <p className="text-[11px] text-muted-foreground">Add wood to be consumed by the process.</p>
            </div>

            {inputFields.length > 0 && (
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b bg-muted/30 font-medium text-muted-foreground">
                      <th className="w-8 p-2">No.</th>
                      <th className="p-2">Variant / Available</th>
                      <th className="w-20 p-2">Qty</th>
                      <th className="w-28 p-2">Total Volume</th>
                      <th className="w-12 p-2 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {inputFields.map((itemField, itemIndex) => {
                      const itemData = watchedInputItems[itemIndex];
                      const itemError = errors?.inputItems?.[itemIndex];
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

                      const singleVolume = itemData?.variant?.volume || 0;
                      const totalVol = singleVolume * (Number((itemField as any).quantity) || 0);

                      return (
                        <tr key={itemField.id} className="hover:bg-muted/10">
                          <td className="p-2 align-middle font-medium">{itemIndex + 1}</td>
                          <td className="p-2 align-middle font-medium">
                            <div className="space-y-0.5">
                              <div>{woodLabel}</div>
                              <div className="text-[10px] text-muted-foreground font-normal">
                                Stock: {(itemField as any).originalStock}
                              </div>
                            </div>
                          </td>
                          <td className="p-2 align-middle">
                            <Controller
                              control={control}
                              name={`inputItems.${itemIndex}.quantity`}
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
                          <td className="p-2 align-middle font-mono text-[11px] whitespace-nowrap">
                            {totalVol.toFixed(4)} m³
                          </td>
                          <td className="p-2 text-right align-middle">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon-xs"
                              onClick={() => removeInput(itemIndex)}
                              aria-label="Remove input item"
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

            <div className="flex flex-col gap-2 p-2 rounded bg-muted/20 sm:flex-row sm:items-center">
              <div className="flex-1">
                <Select onValueChange={setSelectedInputInvId} value={selectedInputInvId}>
                  <SelectTrigger className="h-8 w-full bg-background text-xs">
                    <SelectValue placeholder="Select stock item..." />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {availableInputInventory.map((inv) => {
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
                        }) + ` (qty: ${inv.stock})`;

                      return (
                        <SelectItem key={inv.id} value={String(inv.id)}>
                          {label}
                        </SelectItem>
                      );
                    })}
                    {availableInputInventory.length === 0 && (
                      <div className="p-2 text-center text-xs text-muted-foreground italic">No stock items available.</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" size="sm" onClick={handleAddInputItem} className="h-8 text-xs gap-1">
                <Plus className="size-3.5" />
                Add Item
              </Button>
            </div>
          </div>

          {/* OUTPUT CARDS (Processed Wood) */}
          <div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
            <div className="border-b pb-2">
              <h3 className="text-sm font-semibold text-primary">2. Output Items (Processed Wood)</h3>
              <p className="text-[11px] text-muted-foreground">Specify the processed wood variants produced.</p>
            </div>

            {inputWoodIds.length === 0 ? (
              <div className="rounded border border-dashed p-6 text-center text-xs text-muted-foreground italic">
                Add input items on the left to activate outputs.
              </div>
            ) : (
              <>
                {outputFields.length > 0 && (
                  <div className="overflow-x-auto rounded-md border">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b bg-muted/30 font-medium text-muted-foreground">
                          <th className="w-8 p-2">No.</th>
                          <th className="p-2">Variant</th>
                          <th className="w-20 p-2">Qty</th>
                          <th className="w-28 p-2">Total Volume</th>
                          <th className="w-12 p-2 text-right">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {outputFields.map((itemField, itemIndex) => {
                          const itemData = watchedOutputItems[itemIndex];
                          const itemError = errors?.outputItems?.[itemIndex];
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

                          const singleVolume = itemData?.variant?.volume || 0;
                          const totalVol = singleVolume * (Number((itemField as any).quantity) || 0);

                          return (
                            <tr key={itemField.id} className="hover:bg-muted/10">
                              <td className="p-2 align-middle font-medium">{itemIndex + 1}</td>
                              <td className="p-2 align-middle font-medium">{woodLabel}</td>
                              <td className="p-2 align-middle">
                                <Controller
                                  control={control}
                                  name={`outputItems.${itemIndex}.quantity`}
                                  render={({ field }) => (
                                    <Input
                                      type="number"
                                      {...field}
                                      value={field.value ?? ""}
                                      className="h-8 w-full px-2 text-xs"
                                      placeholder="Qty"
                                    />
                                  )}
                                />
                                {itemError?.quantity && <FieldError errors={[itemError.quantity]} />}
                              </td>
                              <td className="p-2 align-middle font-mono text-[11px] whitespace-nowrap">
                                {totalVol.toFixed(4)} m³
                              </td>
                              <td className="p-2 text-right align-middle">
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon-xs"
                                  onClick={() => removeOutput(itemIndex)}
                                  aria-label="Remove output item"
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

                <div className="flex flex-col gap-2 p-2 rounded bg-muted/20 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <Select onValueChange={setSelectedOutputVariantId} value={selectedOutputVariantId}>
                      <SelectTrigger className="h-8 w-full bg-background text-xs">
                        <SelectValue placeholder="Select variant (species-filtered)..." />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {availableOutputVariants.map((v) => {
                          const label = generateWoodVariantLabel({
                            woodCode: v.wood.code,
                            materialCode: v.material.name,
                            width: v.width,
                            height: v.height,
                            diameterSmall: v.diameterSmall,
                            diameterLarge: v.diamterLarge,
                            length: v.length,
                            measurement: v.material.measurement,
                          });

                          return (
                            <SelectItem key={v.id} value={String(v.id)}>
                              {label}
                            </SelectItem>
                          );
                        })}
                        {availableOutputVariants.length === 0 && (
                          <div className="p-2 text-center text-xs text-muted-foreground italic">No matching species variants.</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="button" size="sm" onClick={handleAddOutputItem} className="h-8 text-xs gap-1">
                    <Plus className="size-3.5" />
                    Add Item
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
