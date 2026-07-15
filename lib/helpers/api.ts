import { ApiResponse } from "@/types/api-response";

export function successResponse<T>(data: T, message: string): ApiResponse<T> {
  return { data, message, success: true };
}

export function errorResponse(message: string): ApiResponse<null> {
  return { data: null, message, success: false };
}

export function getOrderBySort(
  sortBy: string,
  sortOrder: "asc" | "desc",
  allowedSortFields: string[],
  defaultField = "createdAt",
  defaultOrder: "asc" | "desc" = "desc"
) {
  const orderBy: Record<string, "asc" | "desc"> = {};
  if (sortBy && allowedSortFields.includes(sortBy) && (sortOrder === "asc" || sortOrder === "desc")) {
    orderBy[sortBy] = sortOrder;
  } else {
    orderBy[defaultField] = defaultOrder;
  }
  return orderBy;
}
