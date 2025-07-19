import type {
  WaybillListResponse,
  Waybill,
  Parcel,
  ParcelStatus,
  WaybillStatus,
} from "@/types";
import type { UnloadingParcel } from "@/components/dashboard/unloading/types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// API 응답 타입
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 운송장 목록 조회 (필터링, 페이지네이션 지원)
export async function fetchWaybills(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: WaybillStatus;
  date?: Date;
  endDate?: Date;
}): Promise<WaybillListResponse> {
  console.info("Fetching waybills with params:", params);

  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.pageSize)
    searchParams.append("limit", params.pageSize.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.status) searchParams.append("status", params.status);
  if (params?.date)
    searchParams.append("startDate", params.date.toISOString().split("T")[0]);
  if (params?.endDate)
    searchParams.append("endDate", params.endDate.toISOString().split("T")[0]);

  const response = await fetch(
    `${API_BASE_URL}/api/waybills?${searchParams.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch waybills: ${response.statusText}`);
  }

  const result: PaginatedApiResponse<Waybill> = await response.json();

  return {
    waybills: result.data,
    total: result.pagination.total,
    page: result.pagination.page,
    pageSize: result.pagination.limit,
  };
}

// 특정 운송장 상세 조회
export async function fetchWaybillById(id: number): Promise<Waybill> {
  console.info("Fetching waybill:", id);

  const response = await fetch(`${API_BASE_URL}/api/waybills/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch waybill: ${response.statusText}`);
  }

  const result: ApiResponse<Waybill> = await response.json();
  return result.data;
}

// 운송장 번호로 조회
export async function fetchWaybillByNumber(number: string): Promise<Waybill> {
  console.info("Fetching waybill by number:", number);

  const response = await fetch(
    `${API_BASE_URL}/api/waybills/number/${number}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch waybill: ${response.statusText}`);
  }

  const result: ApiResponse<Waybill> = await response.json();
  return result.data;
}

// 운송장 통계 조회
export async function fetchWaybillStats(): Promise<{
  total: number;
  byStatus: Array<{
    status: WaybillStatus;
    count: number;
  }>;
}> {
  console.info("Fetching waybill stats");

  const response = await fetch(`${API_BASE_URL}/api/waybills/stats`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch waybill stats: ${response.statusText}`);
  }

  const result: ApiResponse<{
    total: number;
    byStatus: Array<{
      status: WaybillStatus;
      count: number;
    }>;
  }> = await response.json();

  return result.data;
}

// 운송장 달력 데이터 조회
export async function fetchWaybillCalendarData(params?: {
  startDate?: Date;
  endDate?: Date;
}): Promise<
  Array<{
    date: string;
    count: number;
    statuses: Record<string, number>;
  }>
> {
  console.info("Fetching waybill calendar data:", params);

  const searchParams = new URLSearchParams();

  if (params?.startDate) {
    searchParams.append(
      "startDate",
      params.startDate.toISOString().split("T")[0]
    );
  }
  if (params?.endDate) {
    searchParams.append("endDate", params.endDate.toISOString().split("T")[0]);
  }

  const response = await fetch(
    `${API_BASE_URL}/api/waybills/calendar?${searchParams.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch waybill calendar data: ${response.statusText}`
    );
  }

  const result: ApiResponse<
    Array<{
      date: string;
      count: number;
      statuses: Record<string, number>;
    }>
  > = await response.json();

  return result.data;
}

// 하차 예정 운송장 목록 조회 (기존 함수 유지)
export async function fetchUnloadingWaybills(): Promise<WaybillListResponse> {
  console.info("Fetching unloading waybills");

  const response = await fetch(
    `${API_BASE_URL}/api/waybills?status=IN_TRANSIT&getAll=true`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch unloading waybills: ${response.statusText}`
    );
  }

  const result: PaginatedApiResponse<Waybill> = await response.json();

  return {
    waybills: result.data,
    total: result.pagination.total,
    page: result.pagination.page,
    pageSize: result.pagination.limit,
  };
}

// 하차 예정 소포 목록 조회 (2000개) - 새로운 타입 사용
export async function fetchUnloadingParcels(): Promise<{
  parcels: UnloadingParcel[];
  total: number;
  page: number;
  pageSize: number;
}> {
  console.info("Fetching unloading parcels (2000 items)");

  // 실제 API가 구현되면 여기서 호출
  // 현재는 mock 데이터 사용
  const { getMockUnloadingParcelsWithTimestamps } = await import(
    "@/data/mockWaybills"
  );

  const parcels = getMockUnloadingParcelsWithTimestamps();

  return {
    parcels,
    total: parcels.length,
    page: 1,
    pageSize: parcels.length,
  };
}

// 소포 상태 업데이트 (하차 처리)
export async function updateParcelStatus(
  parcelId: number,
  status: ParcelStatus,
  operatorId?: number
): Promise<Parcel> {
  console.info("Updating parcel status:", parcelId, status);

  // 실제 API가 구현되면 여기서 호출
  // 현재는 mock 데이터 사용
  const { getMockUnloadingParcels } = await import("@/data/mockWaybills");

  const parcels = getMockUnloadingParcels();
  const parcel = parcels.find((p) => p.id === parcelId);

  if (!parcel) {
    throw new Error(`Parcel with id ${parcelId} not found`);
  }

  return {
    ...parcel,
    status,
    operatorId,
    processedAt: new Date().toISOString(),
  };
}
