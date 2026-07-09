"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { useFieldArray, Control, Controller, useWatch, UseFormSetError, UseFormClearErrors, UseFormSetValue } from "react-hook-form";
import { Plus, Trash2, AlertTriangle, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldError } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { useGetInventoryByLocation } from "@/hooks/swr/inventories/use-get-inventory-by-location";
import { generateWoodVariantLabel } from "@/lib/helpers/core";
import { GradeForSelect } from "@/lib/services/grade-service";
import { WoodForSelect } from "@/lib/services/wood-service";
import { MaterialForSelect } from "@/lib/services/material-service";
import { toast } from "sonner";
import InventoryPicker from "@/components/shared/inventory-picker";
import { LocationInventoryItem } from "@/app/api/inventories/by-location/route";
import { CreateGradingFormInput } from "@/lib/schemas/gradings/create-grading";

interface GradingCartProps {
  control: Control<CreateGradingFormInput, any, any>;
  errors?: any;
  grades: GradeForSelect[];
  woods: WoodForSelect[];
  materials: MaterialForSelect[];
  setError: UseFormSetError<CreateGradingFormInput>;
  clearErrors: UseFormClearErrors<CreateGradingFormInput>;
  setValue: UseFormSetValue<CreateGradingFormInput>;
}

export default function GradingCart({ control, errors, grades, woods, materials, setError, clearErrors, setValue }: GradingCartProps) {
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

  const { data: _, isLoading: isInventoryLoading } = useGetInventoryByLocation(locationId ? Number(locationId) : null);

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
          originalStock: selectedInv.stock,
          gradeId: selectedInv.gradeId || null,
          variant: selectedInv.variant,
          grade: selectedInv.grade,
        },
        outputs: [
          {
            gradeId: "",
            quantity: "1",
            comment: "",
          },
        ],
      });
    });
  };

  const computedGroups = useMemo(() => {
    return (watchedGroups || []).map((group: any) => {
      if (!group?.input) {
        return {
          totalOutputQty: 0,
          maxQty: 0,
          isQtyInvalid: false,
        };
      }

      const maxQty = group.input.originalStock || 0;
      const totalOutputQty = (group.outputs || []).reduce((sum: number, item: any) => {
        return sum + (Number(item.quantity) || 0);
      }, 0);

      const isQtyInvalid = totalOutputQty > maxQty;

      return {
        totalOutputQty,
        maxQty,
        isQtyInvalid,
      };
    });
  }, [watchedGroups]);

  const anyGroupInvalid = useMemo(() => {
    return computedGroups.some((cg: any) => cg.isQtyInvalid);
  }, [computedGroups]);

  useEffect(() => {
    if (anyGroupInvalid) {
      setError("groups", {
        type: "custom",
        message: "One or more groups have total graded quantity exceeding original stock quantity.",
      });
    } else {
      clearErrors("groups");
    }
  }, [anyGroupInvalid, setError, clearErrors]);

  return (
    <div className="space-y-6">
      {!locationId ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Please select a location above to configure grading items.
        </div>
      ) : (
        <div className="space-y-6">
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

          {groupFields.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No grading groups added. Select an input log above to create a group.
            </div>
          ) : (
            <div className="space-y-6">
              {groupFields.map((groupField, groupIndex) => {
                const groupErrors = errors?.groups?.[groupIndex];
                const groupData = watchedGroups[groupIndex] || {};
                const computedGroup = computedGroups[groupIndex] || {
                  totalOutputQty: 0,
                  maxQty: 0,
                  isQtyInvalid: false,
                };

                return (
                  <GradingCartGroup
                    key={groupField.id}
                    control={control}
                    groupIndex={groupIndex}
                    grades={grades}
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

interface GradingCartGroupProps {
  control: Control<CreateGradingFormInput, any, any>;
  groupIndex: number;
  grades: GradeForSelect[];
  groupErrors: any;
  groupData: any;
  computedGroup: {
    totalOutputQty: number;
    maxQty: number;
    isQtyInvalid: boolean;
  };
  onRemoveGroup: () => void;
  setValue: UseFormSetValue<CreateGradingFormInput>;
}

function GradingCartGroup({
  control,
  groupIndex,
  grades,
  groupErrors,
  groupData,
  computedGroup,
  onRemoveGroup,
  setValue,
}: GradingCartGroupProps) {
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
    if (computedGroup.totalOutputQty >= computedGroup.maxQty) {
      toast.error(`Total graded quantity has reached the original stock limit of ${computedGroup.maxQty}`);
      return;
    }

    appendOutput({
      gradeId: "",
      quantity: "1",
      comment: "",
    });
  };

  const inputItem = groupData.input || {};
  const currentGradeId = inputItem.gradeId || null;

  const filteredGrades = useMemo(() => {
    return grades.filter((g) => g.id !== currentGradeId);
  }, [grades, currentGradeId]);

  const showUngraded = currentGradeId !== null;

  const woodLabel = inputItem.variant
    ? generateWoodVariantLabel({
        woodCode: inputItem.variant.wood.code,
        materialCode: inputItem.variant.material.name,
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
          <h4 className="text-sm font-semibold tracking-tight text-primary">Grading Group #{groupIndex + 1}</h4>
          <p className="text-xs text-muted-foreground">Wood Species: {inputItem.variant?.wood?.name || "-"}</p>
        </div>
        <Button type="button" variant="destructive" size="sm" onClick={onRemoveGroup} className="flex h-9 items-center gap-1">
          <Trash2 className="size-4" />
          Remove Group
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-md bg-muted/20 p-3 md:grid-cols-4">
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
          <span className="block text-[10px] font-semibold text-muted-foreground uppercase">Original Quantity (Max)</span>
          <span className="block text-xs font-semibold">{computedGroup.maxQty}</span>
        </div>
        <div className="space-y-1 text-right">
          <span className="block text-[10px] font-semibold text-muted-foreground uppercase">Total Graded Qty</span>
          <span className={`block text-xs font-bold ${computedGroup.isQtyInvalid ? "text-destructive" : "text-primary"}`}>
            {computedGroup.totalOutputQty} / {computedGroup.maxQty}
          </span>
        </div>
      </div>

      <div
        className={`rounded-lg border p-3 shadow-sm transition-colors duration-200 ${computedGroup.isQtyInvalid ? "border-destructive bg-destructive/5" : "border-primary/20 bg-primary/5"}`}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`rounded-full p-1.5 ${computedGroup.isQtyInvalid ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}
            >
              <ArrowRightLeft className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold">Grading Quantity Summary</h4>
            </div>
          </div>
          <div className="flex gap-4 text-right">
            <div>
              <span className="block text-[9px] font-semibold text-muted-foreground uppercase">Max Qty</span>
              <span className="font-mono text-xs font-bold">{computedGroup.maxQty}</span>
            </div>
            <div>
              <span className="block text-[9px] font-semibold text-muted-foreground uppercase">Graded Qty</span>
              <span className={`font-mono text-xs font-bold ${computedGroup.isQtyInvalid ? "text-destructive" : "text-primary"}`}>
                {computedGroup.totalOutputQty}
              </span>
            </div>
            <div>
              <span className="block text-[9px] font-semibold text-muted-foreground uppercase">Remaining Qty</span>
              <span className={`text-xs font-bold ${computedGroup.isQtyInvalid ? "text-destructive" : "text-primary"}`}>
                {computedGroup.maxQty - computedGroup.totalOutputQty}
              </span>
            </div>
          </div>
        </div>
        {computedGroup.isQtyInvalid && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-destructive">
            <AlertTriangle className="size-3.5 shrink-0" />
            <span>Total graded quantity cannot exceed the original quantity of the input.</span>
          </div>
        )}
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-t pt-3">
          <h5 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Grade Allocation Settings</h5>
          <Button type="button" variant="outline" size="xs" onClick={handleAddOutput} className="flex items-center gap-1 text-xs">
            <Plus className="size-3.5" />
            Add Grade
          </Button>
        </div>

        {outputFields.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground italic">
            No grades configured. Click &quot;Add Grade&quot; to begin.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b bg-muted/30 font-medium text-muted-foreground">
                  <th className="w-8 p-2 text-center font-medium">No.</th>
                  <th className="min-w-40 p-2">Grade</th>
                  <th className="w-24 p-2">Qty</th>
                  <th className="min-w-40 p-2">Comment</th>
                  <th className="w-12 p-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {outputFields.map((itemField, itemIndex) => {
                  const rowErrors = groupErrors?.outputs?.[itemIndex];

                  return (
                    <tr key={itemField.id} className="hover:bg-muted/10">
                      <td className="p-2 text-center align-middle font-medium">{itemIndex + 1}</td>

                      <td className="p-2 align-middle">
                        <Controller
                          control={control}
                          name={`groups.${groupIndex}.outputs.${itemIndex}.gradeId`}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={
                                field.value === null || field.value === undefined || field.value === "ungraded"
                                  ? "ungraded"
                                  : String(field.value)
                              }
                            >
                              <SelectTrigger className="h-8 w-full bg-background text-xs">
                                <SelectValue placeholder="Select Grade" />
                              </SelectTrigger>
                              <SelectContent position="popper">
                                {showUngraded && <SelectItem value="ungraded">Ungraded</SelectItem>}
                                {filteredGrades.map((g) => (
                                  <SelectItem key={g.id} value={String(g.id)}>
                                    {g.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {rowErrors?.gradeId && <FieldError errors={[rowErrors.gradeId]} />}
                      </td>

                      <td className="p-2 align-middle">
                        <Controller
                          control={control}
                          name={`groups.${groupIndex}.outputs.${itemIndex}.quantity`}
                          render={({ field }) => (
                            <Input
                              type="number"
                              {...field}
                              value={(field.value as number) ?? ""}
                              placeholder="Qty"
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const otherQty = watchedOutputs.reduce((sum: number, item: any, idx: number) => {
                                  if (idx === itemIndex) return sum;
                                  return sum + (Number(item.quantity) || 0);
                                }, 0);
                                const maxAllowed = computedGroup.maxQty - otherQty;
                                if (val > maxAllowed) {
                                  toast.error(`Quantity cannot exceed remaining available stock (${maxAllowed})`);
                                  field.onChange(maxAllowed > 0 ? maxAllowed : 0);
                                } else {
                                  field.onChange(e.target.value);
                                }
                              }}
                              className="h-8 w-full px-2 text-xs"
                            />
                          )}
                        />
                        {rowErrors?.quantity && <FieldError errors={[rowErrors.quantity]} />}
                      </td>

                      <td className="p-2 align-middle">
                        <Controller
                          control={control}
                          name={`groups.${groupIndex}.outputs.${itemIndex}.comment`}
                          render={({ field }) => (
                            <Input
                              type="text"
                              {...field}
                              value={field.value ?? ""}
                              placeholder="Add comment (e.g. slight warp)"
                              className="h-8 w-full px-2 text-xs"
                            />
                          )}
                        />
                        {rowErrors?.comment && <FieldError errors={[rowErrors.comment]} />}
                      </td>

                      <td className="p-2 text-right align-middle">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-xs"
                          onClick={() => removeOutput(itemIndex)}
                          aria-label="Remove grade item"
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
      </div>
    </div>
  );
}
