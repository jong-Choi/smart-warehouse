import type { MonthlySalesResponse, DailySalesResponse } from "../types/sales";

const API_BASE_URL = "http://localhost:4000/api";

/**
 * 월별 매출 통계를 조회합니다.
 * @param year 조회할 연도
 * @returns 월별 매출 데이터
 */
export const fetchMonthlySales = async (
  year: number
): Promise<MonthlySalesResponse> => {
  const response = await fetch(`${API_BASE_URL}/sales/monthly?year=${year}`);

  if (!response.ok) {
    throw new Error(`월별 매출 데이터 조회 실패: ${response.status}`);
  }

  return response.json();
};

/**
 * 일별 매출 통계를 조회합니다.
 * @param year 조회할 연도
 * @param month 조회할 월
 * @returns 일별 매출 데이터
 */
export const fetchDailySales = async (
  year: number,
  month: number
): Promise<DailySalesResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/sales/daily?year=${year}&month=${month}`
  );

  if (!response.ok) {
    throw new Error(`일별 매출 데이터 조회 실패: ${response.status}`);
  }

  return response.json();
};
