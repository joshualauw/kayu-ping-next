"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { useFieldArray, Control, Controller, useWatch, UseFormSetError, UseFormClearErrors, UseFormSetValue } from "react-hook-form";
import { Plus, Trash2, AlertTriangle, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldError } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { generateWoodVariantLabel } from "@/lib/helpers/core";
import { MaterialForSelect } from "@/lib/services/material-service";
import { Measurement } from "@/generated/prisma/enums";
import { calculateWoodVolume } from "@/lib/helpers/core";
import { CreateProcessingFormInput } from "@/lib/schemas/processings/create-processing";
import { toast } from "sonner";
import { WoodForSelect } from "@/lib/services/wood-service";
import { GradeForSelect } from "@/lib/services/grade-service";
import InventoryPicker from "@/components/shared/inventory-picker";
import { LocationInventoryItem } from "@/app/api/inventories/by-location/route";

interface ProcessingCartProps {
  control: Control<CreateProcessingFormInput, any, any>;
  errors?: any;
  materials: MaterialForSelect[];
  woods: WoodForSelect[];
  grades: GradeForSelect[];
  setError: UseFormSetError<CreateProcessingFormInput>;
  clearErrors: UseFormClearErrors<CreateProcessingFormInput>;
  setValue: UseFormSetValue<CreateProcessingFormInput>;
}

export default function ProcessingCart({
  control,
  errors,
  materials,
  woods,
  grades,
  setError,
  clearErrors,
  setValue,
}: ProcessingCartProps) {
  const locationId = useWatch({
    control,
    name: "locationId",
    defaultValue: "",
  });

  const {
    fields: groupFields,
    append: appendGroup,
    remove: removeGroup,
    replace: replaceGroups,
  } = useFieldArray({
    control,
    name: "groups",
  });

  const watchedGroups = useWatch({
    control,
    name: "groups",
    defaultValue: [],
  });

  const prevLocationIdRef = useRef(locationId);
  useEffect(() => {
    if (prevLocationIdRef.current !== locationId) {
      replaceGroups([]);
      prevLocationIdRef.current = locationId;
    }
  }, [locationId, replaceGroups]);

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const existingIds = useMemo(() => {
    return (watchedGroups || []).map((group: any) => Number(group?.input?.inventoryId)).filter(Boolean);
  }, [watchedGroups]);

  const handleSelectItems = (selectedInvs: LocationInventoryItem[]) => {
    selectedInvs.forEach((selectedInv) => {
      appendGroup({
        input: {
          inventoryId: selectedInv.id,
          woodVariantId: selectedInv.woodVariantId,
          quantity: 1,
          originalStock: selectedInv.stock,
          variant: selectedInv.variant,
          grade: selectedInv.grade,
          lot: selectedInv.lot,
        },
        outputs: [
          {
            materialId: "",
            width: "",
            height: "",
            diameterSmall: "",
            diameterLarge: "",
            length: "",
            quantity: "1",
          },
        ],
      });
    });
  };

  const computedGroups = useMemo(() => {
    return (watchedGroups || []).map((group: any) => {
      if (!group?.input) {
        return {
          inputVolume: 0,
          outputVolume: 0,
          yieldPercentage: 0,
          isVolumeInvalid: false,
          outputs: [],
        };
      }

      const inputQty = Number(group.input.quantity) || 0;
      const inputSingleVolume = group.input.variant?.volume || 0;
      const inputVolume = inputSingleVolume * inputQty;

      let groupOutputVolume = 0;
      const outputs = (group.outputs || []).map((item: any) => {
        let volume = 0;
        let totalVolume = 0;
        let measurement: Measurement | undefined = undefined;

        if (item?.materialId) {
          const material = materials.find((m) => m.id === Number(item.materialId));
          measurement = material?.measurement;

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
              }
            } catch (e) {
              // Keep 0
            }
          }
        }

        groupOutputVolume += totalVolume;
        return {
          measurement,
          volume,
          totalVolume,
        };
      });

      const yieldPercentage = inputVolume > 0 ? (groupOutputVolume / inputVolume) * 100 : 0;
      const isVolumeInvalid = groupOutputVolume > inputVolume && inputVolume > 0;

      return {
        inputVolume,
        outputVolume: groupOutputVolume,
        yieldPercentage,
        isVolumeInvalid,
        outputs,
      };
    });
  }, [watchedGroups, materials]);

  const anyGroupInvalid = useMemo(() => {
    return computedGroups.some((cg: any) => cg.isVolumeInvalid);
  }, [computedGroups]);

  useEffect(() => {
    if (anyGroupInvalid) {
      setError("groups", {
        type: "custom",
        message: "One or more groups have output volume exceeding input volume.",
      });
    } else {
      clearErrors("groups");
    }
  }, [anyGroupInvalid, setError, clearErrors]);

  return (
    <div className="space-y-6">
      {!locationId ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Please select a location above to configure processing items.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Stock Selection Bar */}
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
              Select Input from Stock
            </Button>
          </div>

          {/* Grouped Cards */}
          {groupFields.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No processing groups added. Select an input log above to create a group.
            </div>
          ) : (
            <div className="space-y-6">
              {groupFields.map((groupField, groupIndex) => {
                const groupErrors = errors?.groups?.[groupIndex];
                const groupData = watchedGroups[groupIndex] || {};
                const computedGroup = computedGroups[groupIndex] || {
                  inputVolume: 0,
                  outputVolume: 0,
                  yieldPercentage: 0,
                  isVolumeInvalid: false,
                  outputs: [],
                };

                return (
                  <ProcessingCartGroup
                    key={groupField.id}
                    control={control}
                    groupIndex={groupIndex}
                    materials={materials}
                    groupErrors={groupErrors}
                    groupData={groupData}
                    computedGroup={computedGroup}
                    onRemoveGroup={() => removeGroup(groupIndex)}
                    setValue={setValue}
                  />
                );
              })}
            </div>
          )}
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

interface ProcessingCartGroupProps {
  control: Control<CreateProcessingFormInput, any, any>;
  groupIndex: number;
  materials: MaterialForSelect[];
  groupErrors: any;
  groupData: any;
  computedGroup: {
    inputVolume: number;
    outputVolume: number;
    yieldPercentage: number;
    isVolumeInvalid: boolean;
    outputs: { measurement: Measurement | undefined; volume: number; totalVolume: number }[];
  };
  onRemoveGroup: () => void;
  setValue: UseFormSetValue<CreateProcessingFormInput>;
}

function ProcessingCartGroup({
  control,
  groupIndex,
  materials,
  groupErrors,
  groupData,
  computedGroup,
  onRemoveGroup,
  setValue,
}: ProcessingCartGroupProps) {
  const {
    fields: outputFields,
    append: appendOutput,
    remove: removeOutput,
  } = useFieldArray({
    control,
    name: `groups.${groupIndex}.outputs`,
  });

  const watchedOutputs = useWatch({
    control,
    name: `groups.${groupIndex}.outputs`,
    defaultValue: [],
  });

  const handleAddOutput = () => {
    appendOutput({
      materialId: "",
      width: "",
      height: "",
      diameterSmall: "",
      diameterLarge: "",
      length: "",
      quantity: "1",
    });
  };

  const inputItem = groupData.input || {};
  const woodLabel = inputItem.variant
    ? generateWoodVariantLabel({
        woodCode: inputItem.variant.wood.code,
        materialCode: inputItem.variant.material.code,
        width: inputItem.variant.width,
        height: inputItem.variant.height,
        diameterSmall: inputItem.variant.diameterSmall,
        diameterLarge: inputItem.variant.diamterLarge,
        length: inputItem.variant.length,
        measurement: inputItem.variant.material.measurement,
      })
    : "-";

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <h4 className="text-sm font-semibold tracking-tight text-primary">Group #{groupIndex + 1}</h4>
          <p className="text-xs text-muted-foreground">Wood Species: {inputItem.variant?.wood?.name || "-"}</p>
        </div>
        <Button type="button" variant="destructive" size="sm" onClick={onRemoveGroup} className="flex h-9 items-center gap-1">
          <Trash2 className="size-4" />
          Remove Group
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-md bg-muted/20 p-3 md:grid-cols-6">
        <div className="space-y-1">
          <span className="block text-[10px] font-semibold text-muted-foreground uppercase">Input Log/Pack</span>
          <span className="block text-xs font-semibold">{woodLabel}</span>
        </div>
        <div className="space-y-1">
          <span className="block text-[10px] font-semibold text-muted-foreground uppercase">Grade</span>
          <span className="block text-xs font-semibold">
            {inputItem.grade ? (
              <Badge variant="secondary">{inputItem.grade.code}</Badge>
            ) : (
              <span className="text-xs text-muted-foreground italic">Ungraded</span>
            )}
          </span>
        </div>
        <div className="space-y-1">
          <span className="block text-[10px] font-semibold text-muted-foreground uppercase">Lot</span>
          <span className="block text-xs font-semibold">
            {inputItem.lot ? (
              <Badge variant="outline" className="font-mono text-xs">
                {inputItem.lot.code}
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground italic">-</span>
            )}
          </span>
        </div>
        <div className="space-y-1">
          <span className="block text-[10px] font-semibold text-muted-foreground uppercase">Available Stock</span>
          <span className="block text-xs font-semibold">{inputItem.originalStock ?? 0}</span>
        </div>
        <div className="space-y-1">
          <span className="block text-[10px] font-semibold text-muted-foreground uppercase">Processing Qty</span>
          <div className="w-24">
            <Controller
              control={control}
              name={`groups.${groupIndex}.input.quantity`}
              render={({ field }) => (
                <Input
                  type="number"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const max = Number(inputItem.originalStock) || 0;
                    if (val > max) {
                      toast.error(`Quantity cannot exceed available stock (${max})`);
                      field.onChange(max);
                    } else {
                      field.onChange(e.target.value);
                    }
                  }}
                  className="h-8 w-full px-2 text-xs"
                />
              )}
            />
            {groupErrors?.input?.quantity && <FieldError errors={[groupErrors.input.quantity]} />}
          </div>
        </div>
        <div className="space-y-1 text-right">
          <span className="block font-mono text-[10px] font-semibold text-muted-foreground uppercase">Consumed Volume</span>
          <span className="block font-mono text-xs font-bold text-primary">{computedGroup.inputVolume.toFixed(4)} m³</span>
        </div>
      </div>

      <div
        className={`rounded-lg border p-3 shadow-sm transition-colors duration-200 ${computedGroup.isVolumeInvalid ? "border-destructive bg-destructive/5" : "border-primary/20 bg-primary/5"}`}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`rounded-full p-1.5 ${computedGroup.isVolumeInvalid ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}
            >
              <ArrowRightLeft className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold">Group Yield Summary</h4>
            </div>
          </div>
          <div className="flex gap-4 text-right">
            <div>
              <span className="block font-mono text-[9px] font-semibold text-muted-foreground uppercase">Input Vol</span>
              <span className="font-mono text-xs font-bold">{computedGroup.inputVolume.toFixed(4)} m³</span>
            </div>
            <div>
              <span className="block font-mono text-[9px] font-semibold text-muted-foreground uppercase">Output Vol</span>
              <span className={`font-mono text-xs font-bold ${computedGroup.isVolumeInvalid ? "text-destructive" : "text-primary"}`}>
                {computedGroup.outputVolume.toFixed(4)} m³
              </span>
            </div>
            <div>
              <span className="block text-[9px] font-semibold text-muted-foreground uppercase">Yield</span>
              <span className={`text-xs font-bold ${computedGroup.isVolumeInvalid ? "text-destructive" : "text-primary"}`}>
                {computedGroup.yieldPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
        {computedGroup.isVolumeInvalid && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-destructive">
            <AlertTriangle className="size-3.5 shrink-0" />
            <span>Output volume cannot exceed input volume for this group.</span>
          </div>
        )}
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-t pt-3">
          <h5 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Output Cut Specifications</h5>
          <Button type="button" variant="outline" size="xs" onClick={handleAddOutput} className="flex items-center gap-1 text-xs">
            <Plus className="size-3.5" />
            Add Output Row
          </Button>
        </div>

        {outputFields.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground italic">
            No outputs configured. Click &quot;Add Output Row&quot; to begin.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b bg-muted/30 font-medium text-muted-foreground">
                  <th className="w-8 p-2 text-center font-medium">No.</th>
                  <th className="min-w-50 p-2">Material / Dimensions</th>
                  <th className="w-24 p-2">Length (cm)</th>
                  <th className="w-20 p-2">Qty</th>
                  <th className="w-28 p-2 font-mono">Volume (m³)</th>
                  <th className="w-12 p-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {outputFields.map((itemField, itemIndex) => {
                  const computedItem = computedGroup.outputs[itemIndex] || { measurement: undefined, volume: 0, totalVolume: 0 };
                  const rowErrors = groupErrors?.outputs?.[itemIndex];
                  const itemData = watchedOutputs[itemIndex] || {};

                  return (
                    <tr key={itemField.id} className="hover:bg-muted/10">
                      <td className="p-2 text-center align-middle font-medium">{itemIndex + 1}</td>

                      <td className="p-2 align-middle">
                        <div className="flex min-w-[200px] flex-col gap-2">
                          <div>
                            <Controller
                              control={control}
                              name={`groups.${groupIndex}.outputs.${itemIndex}.materialId`}
                              render={({ field }) => (
                                <Select
                                  onValueChange={(newVal) => {
                                    field.onChange(newVal);
                                    setValue(`groups.${groupIndex}.outputs.${itemIndex}.width`, "");
                                    setValue(`groups.${groupIndex}.outputs.${itemIndex}.height`, "");
                                    setValue(`groups.${groupIndex}.outputs.${itemIndex}.diameterSmall`, "");
                                    setValue(`groups.${groupIndex}.outputs.${itemIndex}.diameterLarge`, "");
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

                          <div>
                            {!itemData.materialId ? (
                              <div className="flex h-8 items-center text-[11px] text-muted-foreground italic">Select material first</div>
                            ) : computedItem.measurement === Measurement.CUBE ? (
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <Controller
                                    control={control}
                                    name={`groups.${groupIndex}.outputs.${itemIndex}.width`}
                                    render={({ field }) => (
                                      <Input
                                        type="number"
                                        {...field}
                                        value={(field.value as number) ?? ""}
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
                                    name={`groups.${groupIndex}.outputs.${itemIndex}.height`}
                                    render={({ field }) => (
                                      <Input
                                        type="number"
                                        {...field}
                                        value={(field.value as number) ?? ""}
                                        placeholder="Height (cm)"
                                        className="h-8 w-full px-2 text-xs"
                                      />
                                    )}
                                  />
                                  {rowErrors?.height && <FieldError errors={[rowErrors.height]} />}
                                </div>
                              </div>
                            ) : computedItem.measurement === Measurement.CYLINDER ? (
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <Controller
                                    control={control}
                                    name={`groups.${groupIndex}.outputs.${itemIndex}.diameterSmall`}
                                    render={({ field }) => (
                                      <Input
                                        type="number"
                                        {...field}
                                        value={(field.value as number) ?? ""}
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
                                    name={`groups.${groupIndex}.outputs.${itemIndex}.diameterLarge`}
                                    render={({ field }) => (
                                      <Input
                                        type="number"
                                        {...field}
                                        value={(field.value as number) ?? ""}
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
                          name={`groups.${groupIndex}.outputs.${itemIndex}.length`}
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

                      <td className="p-2 align-middle">
                        <Controller
                          control={control}
                          name={`groups.${groupIndex}.outputs.${itemIndex}.quantity`}
                          render={({ field }) => (
                            <Input
                              type="number"
                              {...field}
                              value={field.value ?? ""}
                              placeholder="Qty"
                              className="h-8 w-full px-2 text-xs"
                            />
                          )}
                        />
                        {rowErrors?.quantity && <FieldError errors={[rowErrors.quantity]} />}
                      </td>

                      <td className="p-2 align-middle font-mono text-[11px] whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div>Single: {computedItem.volume > 0 ? computedItem.volume.toFixed(4) : "0.0000"} m³</div>
                          <div className="font-mono font-semibold text-muted-foreground">
                            Total: {computedItem.totalVolume > 0 ? computedItem.totalVolume.toFixed(4) : "0.0000"} m³
                          </div>
                        </div>
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

        {outputFields.length > 0 && (
          <div className="flex justify-end gap-6 border-t pt-3 text-right">
            <div>
              <span className="block text-[10px] font-semibold text-muted-foreground uppercase">Outputs Volume</span>
              <span className="block font-mono text-xs font-bold text-primary">{computedGroup.outputVolume.toFixed(4)} m³</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
