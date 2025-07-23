import { useSuspenseQuery } from "@tanstack/react-query";
import {
  fetchOperatorById,
  fetchOperatorDetail,
  fetchOperatorParcels,
  fetchOperators,
} from "@/api/operatorApi";
import type { Operator, OperatorDetail, OperatorParcel } from "@types";

// Query Keys
export const operatorKeys = {
  all: ["operators"] as const,
  list: (params: Record<string, unknown>) =>
    [...operatorKeys.all, "list", params] as const,
  detail: (id: string) => [...operatorKeys.all, "detail", id] as const,
  parcels: (id: string) => [...operatorKeys.all, "parcels", id] as const,
};

// 작업자 목록 조회
export function useOperators(
  params: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    sortField?: string;
    sortDirection?: "asc" | "desc";
  } = {}
) {
  return useSuspenseQuery({
    queryKey: operatorKeys.list(params),
    queryFn: () => fetchOperators(params),
    staleTime: 5 * 60 * 1000, // 5분간 fresh
  });
}

// Suspense를 사용하는 작업자 목록 조회 훅
export function useOperatorsSuspense(
  params: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    sortField?: string;
    sortDirection?: "asc" | "desc";
  } = {}
) {
  return useSuspenseQuery({
    queryKey: operatorKeys.list(params),
    queryFn: () => fetchOperators(params),
    staleTime: 5 * 60 * 1000,
  });
}

// 작업자 기본 정보 조회
export function useOperator(id: string) {
  return useSuspenseQuery<Operator>({
    queryKey: operatorKeys.detail(id),
    queryFn: () => fetchOperatorById(id),
    staleTime: 5 * 60 * 1000, // 5분간 fresh
  });
}

// 작업자 상세 정보 조회
export function useOperatorDetail(
  code: string,
  page: number = 1,
  pageSize: number = 20,
  status: string = "all",
  startDate?: string,
  endDate?: string
) {
  return useSuspenseQuery<OperatorDetail>({
    queryKey: [
      ...operatorKeys.detail(code),
      page,
      pageSize,
      status,
      startDate,
      endDate,
    ],
    queryFn: () =>
      fetchOperatorDetail(code, page, pageSize, status, startDate, endDate),
    staleTime: 5 * 60 * 1000, // 5분간 fresh
  });
}

// Suspense를 사용하는 작업자 상세 정보 조회 훅
export function useOperatorDetailSuspense(
  code: string,
  page: number = 1,
  pageSize: number = 20,
  status: string = "all",
  startDate?: string,
  endDate?: string
) {
  return useSuspenseQuery({
    queryKey: [
      ...operatorKeys.detail(code),
      page,
      pageSize,
      status,
      startDate,
      endDate,
    ],
    queryFn: () =>
      fetchOperatorDetail(code, page, pageSize, status, startDate, endDate),
    staleTime: 5 * 60 * 1000,
  });
}

// 작업자가 처리한 소포 목록 조회
export function useOperatorParcels(
  operatorId: string,
  page: number = 1,
  pageSize: number = 20,
  status: string = "all"
) {
  return useSuspenseQuery<{
    data: OperatorParcel[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>({
    queryKey: [...operatorKeys.parcels(operatorId), page, pageSize, status],
    queryFn: () => fetchOperatorParcels(operatorId, page, pageSize, status),
    staleTime: 2 * 60 * 1000, // 2분간 fresh
  });
}
