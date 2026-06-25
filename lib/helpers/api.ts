import { ApiResponse } from "@/types/api-response";

export function successResponse<T>(data: T, message: string): ApiResponse<T> {
  return { data, message, success: true };
}

export function errorResponse(message: string): ApiResponse<null> {
  return { data: null, message, success: false };
}
