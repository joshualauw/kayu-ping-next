"use client";

import { useMemo, useState, useEffect } from "react";
import { useGetInventoryByLocation } from "@/hooks/swr/inventories/use-get-inventory-by-location";
import { LocationInventoryItem } from "@/app/api/inventories/by-location/route";
import { GradeForSelect } from "@/lib/services/grade-service";
import { MaterialForSelect } from "@/lib/services/material-service";
import { WoodForSelect } from "@/lib/services/wood-service";
import { generateWoodVariantLabel } from "@/lib/helpers/core";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, RotateCcw, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface InventoryPickerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  locationId: number | null;
  onSelect: (items: LocationInventoryItem[]) => void;
  woods: WoodForSelect[];
  materials: MaterialForSelect[];
  grades: GradeForSelect[];
  existingIds?: number[];
}

const ITEMS_PER_PAGE = 12;

export default function InventoryPicker({
  isOpen,
  onOpenChange,
  locationId,
  onSelect,
  woods,
  materials,
  grades,
  existingIds,
}: InventoryPickerProps) {
  const [showEmpty, setShowEmpty] = useState(false);
  const { data: inventoryData, isLoading, error } = useGetInventoryByLocation(locationId, showEmpty);

  const [search, setSearch] = useState("");
  const [selectedWoodId, setSelectedWoodId] = useState<string>("all");
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("all");
  const [selectedGradeId, setSelectedGradeId] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<LocationInventoryItem[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedItems([]);
    }
  }, [isOpen]);

  useEffect(() => {
    setSearch("");
    setSelectedWoodId("all");
    setSelectedMaterialId("all");
    setSelectedGradeId("all");
    setShowEmpty(false);
    setCurrentPage(1);
    setSelectedItems([]);
  }, [locationId]);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedWoodId("all");
    setSelectedMaterialId("all");
    setSelectedGradeId("all");
    setShowEmpty(false);
    setCurrentPage(1);
  };

  const filteredItems = useMemo(() => {
    if (!inventoryData) return [];

    return inventoryData.filter((item) => {
      if (existingIds && existingIds.includes(item.id)) {
        return false;
      }

      const woodLabel = generateWoodVariantLabel({
        woodCode: item.variant.wood.code,
        materialCode: item.variant.material.code,
        width: item.variant.width,
        height: item.variant.height,
        diameterSmall: item.variant.diameterSmall,
        diameterLarge: item.variant.diamterLarge,
        length: item.variant.length,
        measurement: item.variant.material.measurement,
      });

      const matchesSearch =
        search === "" ||
        woodLabel.toLowerCase().includes(search.toLowerCase()) ||
        item.variant.wood.name.toLowerCase().includes(search.toLowerCase()) ||
        item.variant.material.name.toLowerCase().includes(search.toLowerCase());

      const matchesWood = selectedWoodId === "all" || item.variant.woodId === Number(selectedWoodId);
      const matchesMaterial = selectedMaterialId === "all" || item.variant.materialId === Number(selectedMaterialId);
      const matchesGrade =
        selectedGradeId === "all" || (selectedGradeId === "none" && item.gradeId === null) || item.gradeId === Number(selectedGradeId);

      return matchesSearch && matchesWood && matchesMaterial && matchesGrade;
    });
  }, [inventoryData, search, selectedWoodId, selectedMaterialId, selectedGradeId, existingIds]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredItems, totalPages, currentPage]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const handleSelectAndClose = () => {
    if (selectedItems.length > 0) {
      onSelect(selectedItems);
      onOpenChange(false);
    }
  };

  const hasActiveFilters =
    search !== "" || selectedWoodId !== "all" || selectedMaterialId !== "all" || selectedGradeId !== "all" || showEmpty;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[95vh] flex-col p-6 sm:max-w-6xl">
        <DialogHeader className="border-b pb-2">
          <DialogTitle className="text-xl font-bold tracking-tight">Select Item from Stock</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Search, filter, and select a wood variant from the available stock at this location.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 pt-4 pb-3">
          <div className="w-75 space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Search Spec / Dimensions</label>
            <div className="relative">
              <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, spec, or code..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 pl-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Wood Type</label>
            <Select
              value={selectedWoodId}
              onValueChange={(val) => {
                setSelectedWoodId(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All Wood Types" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="all">All Wood Types</SelectItem>
                {woods.map((w) => (
                  <SelectItem key={w.id} value={String(w.id)}>
                    {w.name} ({w.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Material</label>
            <Select
              value={selectedMaterialId}
              onValueChange={(val) => {
                setSelectedMaterialId(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All Materials" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="all">All Materials</SelectItem>
                {materials.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Grade</label>
            <Select
              value={selectedGradeId}
              onValueChange={(val) => {
                setSelectedGradeId(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All Grades" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="none">No Grade</SelectItem>
                {grades.map((g) => (
                  <SelectItem key={g.id} value={String(g.id)}>
                    {g.name} ({g.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end pb-1.5 pl-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-empty"
                checked={showEmpty}
                onCheckedChange={(checked) => {
                  setShowEmpty(!!checked);
                  setCurrentPage(1);
                }}
              />
              <label htmlFor="show-empty" className="cursor-pointer text-xs font-semibold text-muted-foreground uppercase select-none">
                Show empty stock
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-b pt-1 pb-3 text-xs text-muted-foreground">
          <div>
            Found <span className="font-bold text-foreground">{filteredItems.length}</span> items in stock
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleResetFilters}
              className="h-6 gap-1 px-2 text-[11px] text-muted-foreground hover:text-primary"
            >
              <RotateCcw className="h-3 w-3" />
              Reset Filters
            </Button>
          )}
        </div>

        <div className="min-h-75 flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="border-muted bg-card">
                  <CardContent className="space-y-3 p-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <div className="flex items-center justify-between pt-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="flex h-75 flex-col items-center justify-center text-center text-sm text-destructive">
              Failed to load inventory logs. Please try again.
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex h-75 flex-col items-center justify-center text-center text-sm text-muted-foreground">
              No inventory logs match the selected filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {paginatedItems.map((item) => {
                const label = generateWoodVariantLabel({
                  woodCode: item.variant.wood.code,
                  materialCode: item.variant.material.code,
                  width: item.variant.width,
                  height: item.variant.height,
                  diameterSmall: item.variant.diameterSmall,
                  diameterLarge: item.variant.diamterLarge,
                  length: item.variant.length,
                  measurement: item.variant.material.measurement,
                });

                const isSelected = selectedItems.some((si) => si.id === item.id);
                const isOutOfStock = item.stock <= 0;

                return (
                  <Card
                    key={item.id}
                    className={`border transition-all duration-200 ${
                      isOutOfStock
                        ? "cursor-not-allowed border-muted bg-muted/30 opacity-50"
                        : isSelected
                          ? "cursor-pointer border-primary bg-primary/5 ring-1 ring-primary hover:shadow-md"
                          : "cursor-pointer border-muted bg-card hover:border-muted-foreground/30 hover:shadow-md"
                    }`}
                    onClick={() => {
                      if (isOutOfStock) return;
                      if (isSelected) {
                        setSelectedItems((prev) => prev.filter((si) => si.id !== item.id));
                      } else {
                        setSelectedItems((prev) => [...prev, item]);
                      }
                    }}
                  >
                    <CardContent className="relative flex h-full flex-col justify-between p-4">
                      {isSelected && (
                        <div className="absolute top-3 right-3 rounded-full bg-primary p-1 text-primary-foreground">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      <div className="space-y-1.5 pr-6">
                        <div className="line-clamp-1 text-sm font-semibold tracking-tight">{label}</div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Badge variant="outline" className="bg-card px-1.5 py-0 font-mono text-[10px]">
                            {item.lot.code}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-4">
                        <Badge variant="outline" className="bg-muted/30 text-[10px] font-semibold">
                          {item.grade?.name || "Ungraded"}
                        </Badge>
                        <div className="text-xs">
                          Stock:{" "}
                          <span className={`font-bold ${item.stock > 0 ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                            {item.stock}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {filteredItems.length > 0 && (
              <>
                <span>
                  Showing {Math.min(filteredItems.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)} -{" "}
                  {Math.min(filteredItems.length, currentPage * ITEMS_PER_PAGE)} of {filteredItems.length}
                </span>
                <div className="flex items-center gap-1 pl-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || isLoading}
                    className="h-7 w-7"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || isLoading}
                    className="h-7 w-7"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="flex flex-row items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-9 text-sm">
              Cancel
            </Button>
            <Button type="button" onClick={handleSelectAndClose} disabled={selectedItems.length === 0} className="h-9 text-sm">
              Add Selected ({selectedItems.length})
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
