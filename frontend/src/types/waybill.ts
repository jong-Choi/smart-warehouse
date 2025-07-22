// Prisma 스키마 기반 타입 정의

export type OperatorType = "HUMAN" | "MACHINE";
export type WaybillStatus =
  | "PENDING_UNLOAD"
  | "UNLOADED"
  | "NORMAL"
  | "ACCIDENT";

export interface Operator {
  id: number;
  name: string;
  code: string;
  type: OperatorType;
  createdAt: string;
}

export interface WaybillLocation {
  id: number;
  name: string;
  address?: string;
  createdAt: string;
}

// 수정된 Waybill 타입 - 처리 정보를 모두 관리
export interface Waybill {
  id: number;
  number: string;
  unloadDate: string; // 하차 예정일
  operatorId?: number; // 처리한 작업자/기계 ID
  locationId: number; // 배송지 ID
  status: WaybillStatus; // 처리 상태
  processedAt?: string; // 처리 일시
  isAccident: boolean; // 사고 여부
  operator?: Operator; // 처리한 작업자 정보
  location?: WaybillLocation; // 배송지 정보
  parcel?: Parcel; // 물건 정보
}

// 수정된 Parcel 타입 - 물건 정보만 관리
export interface Parcel {
  id: number;
  waybillId: string;
  declaredValue: number; // 물건 가격
}

// API 응답 타입들
export interface WaybillListResponse {
  waybills: Waybill[];
  total: number;
  page: number;
  pageSize: number;
}

// 필터링 옵션 타입
export interface WaybillFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: WaybillStatus;
  operatorId?: number;
  locationId?: number;
  isAccident?: boolean;
  startDate?: string;
  endDate?: string;
  getAll?: boolean;
}
