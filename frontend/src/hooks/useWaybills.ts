import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchUnloadingWaybills,
  fetchUnloadingParcels,
  fetchWaybillById,
  updateWaybillStatus,
  fetchWaybills, // 추가
  fetchWaybillsByLocationStats,
  fetchWaybillsByLocation,
} from "@/api/waybillApi";
import type { WaybillListResponse, Waybill, WaybillStatus } from "@/types";
import type { UnloadingParcel } from "@/components/dashboard/unloading/types";

// ParcelListResponse 타입 정의
interface ParcelListResponse {
  parcels: UnloadingParcel[];
  total: number;
  page: number;
  pageSize: number;
}

// Query Keys
export const waybillKeys = {
  all: ["waybills"] as const,
  unloading: () => [...waybillKeys.all, "unloading"] as const,
  detail: (id: number) => [...waybillKeys.all, "detail", id] as const,
  parcels: {
    all: ["parcels"] as const,
    unloading: () => [...waybillKeys.parcels.all, "unloading"] as const,
  },
};

// 하차 예정 운송장 목록 조회
export function useUnloadingWaybills() {
  return useSuspenseQuery<WaybillListResponse>({
    queryKey: waybillKeys.unloading(),
    queryFn: fetchUnloadingWaybills,
    staleTime: 60 * 60 * 1000, // 60분간 fresh
    gcTime: 120 * 60 * 1000, // 120분간 캐시 유지
  });
}

// 하차 예정 소포 목록 조회 (2000개) - 가장 중요한 hook
export function useUnloadingParcels() {
  return useSuspenseQuery<ParcelListResponse>({
    queryKey: waybillKeys.parcels.unloading(),
    queryFn: fetchUnloadingParcels,
    staleTime: 60 * 60 * 1000, // 60분간 fresh
    gcTime: 120 * 60 * 1000, // 120분간 캐시 유지
  });
}

// 특정 운송장 상세 조회
export function useWaybillDetail(id: number) {
  return useSuspenseQuery<Waybill>({
    queryKey: waybillKeys.detail(id),
    queryFn: () => fetchWaybillById(id),
    staleTime: 2 * 60 * 1000, // 2분간 fresh
  });
}

// 소포 상태 업데이트 mutation
export function useUpdateWaybillStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      parcelId,
      status,
      operatorId,
    }: {
      parcelId: number;
      status: WaybillStatus;
      operatorId?: number;
    }) => updateWaybillStatus(parcelId, status, operatorId),

    onSuccess: (updatedParcel) => {
      // 관련 쿼리들 무효화하여 데이터 새로고침
      queryClient.invalidateQueries({
        queryKey: waybillKeys.parcels.unloading(),
      });
      queryClient.invalidateQueries({
        queryKey: waybillKeys.unloading(),
      });

      // 특정 운송장 캐시도 업데이트
      if (updatedParcel.id) {
        queryClient.invalidateQueries({
          queryKey: waybillKeys.detail(updatedParcel.id),
        });
      }
    },

    onError: (error) => {
      console.error("Failed to update parcel status:", error);
    },
  });
}

// Suspense를 사용하는 하차 예정 소포 hook
export function useUnloadingParcelsSuspense() {
  return useSuspenseQuery<ParcelListResponse>({
    queryKey: waybillKeys.parcels.unloading(),
    queryFn: fetchUnloadingParcels,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// 전체 운송장 목록 Suspense hook
export function useWaybillsSuspense(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: WaybillStatus;
  startDate?: string;
  endDate?: string;
}) {
  return useSuspenseQuery<WaybillListResponse>({
    queryKey: ["waybills", params],
    queryFn: () => fetchWaybills(params),
    staleTime: 5 * 60 * 1000,
  });
}

// 운송장 상세 Suspense hook
export function useWaybillDetailSuspense(id: number) {
  return useSuspenseQuery<Waybill>({
    queryKey: waybillKeys.detail(id),
    queryFn: () => fetchWaybillById(id),
    staleTime: 2 * 60 * 1000,
  });
}

// LocationWaybillStats 타입 정의
export interface LocationWaybillStats {
  locationId: number;
  locationName: string;
  address: string;
  count: number;
  statuses: { [key: string]: number };
}

// 지역별 운송장 통계 Suspense hook
export function useLocationWaybillsStatsSuspense(params: {
  status?: WaybillStatus;
  startDate?: Date;
  endDate?: Date;
}) {
  return useSuspenseQuery<LocationWaybillStats[]>({
    queryKey: ["locationWaybillsStats", params],
    queryFn: () => fetchWaybillsByLocationStats(params),
    staleTime: 5 * 60 * 1000,
  });
}

// 지역별 운송장 목록 Suspense hook
export function useWaybillsByLocationSuspense(
  locationId: number,
  params: {
    status?: WaybillStatus;
    search?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }
) {
  return useSuspenseQuery<{
    data: Waybill[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>({
    queryKey: ["waybillsByLocation", locationId, params],
    queryFn: () => fetchWaybillsByLocation(locationId, params),
    staleTime: 5 * 60 * 1000,
  });
}
