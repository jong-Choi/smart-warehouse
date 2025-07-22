import type { Parcel, WaybillStatus } from "@/types/waybill";

// 실시간 모니터링을 위한 확장된 Parcel 타입
export interface UnloadingParcel extends Parcel {
  status: WaybillStatus; // 처리 상태 (PENDING_UNLOAD, UNLOADED, NORMAL, ACCIDENT)
  createdAt: string; // 생성일시 (운송장 생성)
  unloadedAt?: string; // 하차일시 (하차 완료 시점)
  workerProcessedAt?: string; // 작업자 처리일시 (작업자 처리 완료 시점)
  processedBy?: string; // 처리 작업자 (작업자 처리 완료 시점)
}

// 상태별 필터링을 위한 타입
export type UnloadingStatusFilter = WaybillStatus | "all";
