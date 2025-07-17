// Prisma 스키마 기반 타입 정의

export type OperatorType = "HUMAN" | "MACHINE";
export type ParcelStatus =
  | "PENDING_UNLOAD"
  | "UNLOADED"
  | "NORMAL"
  | "ACCIDENT";
export type WaybillStatus = "IN_TRANSIT" | "DELIVERED" | "RETURNED" | "ERROR";

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

export interface Waybill {
  id: number;
  number: string;
  status: WaybillStatus;
  shippedAt: string;
  deliveredAt?: string;
  parcels: Parcel[];
}

export interface Parcel {
  id: number;
  waybillId: number;
  operatorId?: number;
  locationId: number;
  status: ParcelStatus;
  declaredValue: number;
  processedAt: string;
  isAccident: boolean;
  waybill?: Waybill;
  operator?: Operator;
  location?: WaybillLocation;
}

// API 응답 타입들
export interface WaybillListResponse {
  waybills: Waybill[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ParcelListResponse {
  parcels: Parcel[];
  total: number;
  page: number;
  pageSize: number;
}
