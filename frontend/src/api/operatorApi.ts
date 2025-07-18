import type { Operator, OperatorDetail, OperatorParcel } from "@/types";

const API_BASE_URL = "http://localhost:4000/api";

// 작업자 기본 정보 조회
export async function fetchOperatorById(id: string): Promise<Operator> {
  const response = await fetch(`${API_BASE_URL}/operators/${id}`);
  if (!response.ok) {
    throw new Error("작업자 정보를 불러오는데 실패했습니다.");
  }
  const result = await response.json();
  return result.data;
}

// 작업자 상세 정보 조회 (처리 내역 포함)
export async function fetchOperatorDetail(id: string): Promise<OperatorDetail> {
  const response = await fetch(`${API_BASE_URL}/operators/${id}`);
  if (!response.ok) {
    throw new Error("작업자 상세 정보를 불러오는데 실패했습니다.");
  }
  const result = await response.json();
  return result.data;
}

// 작업자가 처리한 소포 목록 조회 (페이지네이션)
export async function fetchOperatorParcels(
  operatorId: string,
  page: number = 1,
  limit: number = 20,
  status?: string
): Promise<{
  data: OperatorParcel[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    operatorId: operatorId,
  });

  if (status && status !== "all") {
    params.append("status", status);
  }

  const response = await fetch(`${API_BASE_URL}/parcels?${params.toString()}`);

  if (!response.ok) {
    throw new Error("작업자 처리 내역을 불러오는데 실패했습니다.");
  }

  const result = await response.json();
  return result;
}
