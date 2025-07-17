import type {
  WaybillListResponse,
  ParcelListResponse,
  Waybill,
  Parcel,
  ParcelStatus,
} from "@/types";
import {
  generateMockWaybills,
  getMockUnloadingParcels,
  delay,
} from "@/data/mockWaybills";

// 하차 예정 운송장 목록 조회
export async function fetchUnloadingWaybills(): Promise<WaybillListResponse> {
  console.info("Fetching unloading waybills");

  // API 호출 시뮬레이션 (1초 지연)
  await delay(1000);

  const waybills = generateMockWaybills();

  return {
    waybills,
    total: waybills.length,
    page: 1,
    pageSize: waybills.length,
  };
}

// 하차 예정 소포 목록 조회 (2000개)
export async function fetchUnloadingParcels(): Promise<ParcelListResponse> {
  console.info("Fetching unloading parcels (2000 items)");

  // API 호출 시뮬레이션 (1.5초 지연)
  await delay(1500);

  const parcels = getMockUnloadingParcels();

  return {
    parcels,
    total: parcels.length,
    page: 1,
    pageSize: parcels.length,
  };
}

// 특정 운송장 상세 조회
export async function fetchWaybillById(id: number): Promise<Waybill> {
  console.info("Fetching waybill:", id);

  await delay(500);

  const waybills = generateMockWaybills();
  const waybill = waybills.find((wb) => wb.id === id);

  if (!waybill) {
    throw new Error(`Waybill with id ${id} not found`);
  }

  return waybill;
}

// 소포 상태 업데이트 (하차 처리)
export async function updateParcelStatus(
  parcelId: number,
  status: ParcelStatus,
  operatorId?: number
): Promise<Parcel> {
  console.info("Updating parcel status:", parcelId, status);

  await delay(300);

  // 실제로는 서버에서 업데이트하고 결과를 받아올 것
  // 지금은 가짜 응답 반환
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
