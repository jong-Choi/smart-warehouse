import type { Parcel } from "../../../types/waybill";

export interface UnloadingParcel extends Parcel {
  createdAt: string; // 생성일시 (운송장 생성)
  unloadedAt?: string; // 하차일시 (하차 완료 시점)
  workerProcessedAt?: string; // 작업자 처리일시 (작업자 처리 완료 시점)
  processedBy?: string; // 처리 작업자 (작업자 처리 완료 시점)
}
