import { useQuery } from "@tanstack/react-query";
import {
  fetchSalesOverview,
  fetchLocationSales,
  fetchMonthlySales,
  fetchDailySales,
} from "@/api/salesApi";
import type { SalesOverviewData, LocationSalesData } from "@/api/salesApi";
import type { MonthlySalesResponse, DailySalesResponse } from "@/types/sales";

// Query Keys
export const salesKeys = {
  overview: (year?: number) => ["sales", "overview", year] as const,
  location: (year?: number) => ["sales", "location", year] as const,
  monthly: (year: number) => ["sales", "monthly", year] as const,
  daily: (year: number, month: number) =>
    ["sales", "daily", year, month] as const,
};

// 매출 개요
export function useSalesOverview(year?: number) {
  return useQuery<{ success: boolean; data: SalesOverviewData }>({
    queryKey: salesKeys.overview(year),
    queryFn: () => fetchSalesOverview(year),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSalesOverviewSuspense(year?: number) {
  return useQuery<{ success: boolean; data: SalesOverviewData }>({
    queryKey: salesKeys.overview(year),
    queryFn: () => fetchSalesOverview(year),
    staleTime: 5 * 60 * 1000,
    throwOnError: true,
  });
}

// 지역별 매출
export function useLocationSales(year?: number) {
  return useQuery<{ success: boolean; data: LocationSalesData[] }>({
    queryKey: salesKeys.location(year),
    queryFn: () => fetchLocationSales(year),
    staleTime: 5 * 60 * 1000,
  });
}

export function useLocationSalesSuspense(year?: number) {
  return useQuery<{ success: boolean; data: LocationSalesData[] }>({
    queryKey: salesKeys.location(year),
    queryFn: () => fetchLocationSales(year),
    staleTime: 5 * 60 * 1000,
    throwOnError: true,
  });
}

// 월별 매출
export function useMonthlySales(year: number) {
  return useQuery<MonthlySalesResponse>({
    queryKey: salesKeys.monthly(year),
    queryFn: () => fetchMonthlySales(year),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMonthlySalesSuspense(year: number) {
  return useQuery<MonthlySalesResponse>({
    queryKey: salesKeys.monthly(year),
    queryFn: () => fetchMonthlySales(year),
    staleTime: 5 * 60 * 1000,
    throwOnError: true,
  });
}

// 일별 매출
export function useDailySales(year: number, month: number) {
  return useQuery<DailySalesResponse>({
    queryKey: salesKeys.daily(year, month),
    queryFn: () => fetchDailySales(year, month),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDailySalesSuspense(year: number, month: number) {
  return useQuery<DailySalesResponse>({
    queryKey: salesKeys.daily(year, month),
    queryFn: () => fetchDailySales(year, month),
    staleTime: 5 * 60 * 1000,
    throwOnError: true,
  });
}
