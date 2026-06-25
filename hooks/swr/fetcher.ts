import axios, { AxiosRequestConfig } from "axios";

import type { ApiResponse } from "@/types/api-response";

export class ApiError<T = unknown> extends Error {
  status: number;
  payload: ApiResponse<T>;

  constructor(message: string, status: number, payload: ApiResponse<T>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export const api = axios.create();

export async function fetcher<T>(url: string, config?: AxiosRequestConfig<unknown>): Promise<T> {
  try {
    const response = await api<ApiResponse<T>>(url, { ...config, method: "GET" });
    const payload = response.data;

    if (!payload.success || payload.data == null) {
      throw new ApiError(payload.message || "Request failed", response.status, payload);
    }

    return payload.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
}

export async function mutator<TResponse, TArg>(url: string, arg: TArg, config?: AxiosRequestConfig<unknown>): Promise<TResponse | null> {
  try {
    const response = await api<ApiResponse<TResponse>>(url, { ...config, data: arg });
    const payload = response.data;

    if (!payload.success) {
      throw new ApiError(payload.message || "Request failed", response.status, payload);
    }

    return payload.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
}

function handleAxiosError(error: unknown): Error {
  if (axios.isAxiosError(error) && error.response) {
    const payload = error.response.data as ApiResponse<unknown>;
    return new ApiError(payload.message || "Server Error", error.response.status, payload);
  }
  return error instanceof Error ? error : new Error("An unexpected error occurred");
}
