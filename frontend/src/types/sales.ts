export interface SalesData {
  period: string; // "2024.01" 또는 "1일" 형식
  unloadCount: number; // 하차물량(운송장 수)
  totalShippingValue: number; // 총 운송가액
  avgShippingValue: number; // 운송장별 평균 운송가액
  normalProcessCount: number; // 정상처리건수
  processValue: number; // 처리가액
  accidentCount: number; // 사고건수
  accidentValue: number; // 사고가액
}

export interface MonthlySalesResponse {
  success: boolean;
  data: SalesData[];
  meta: {
    year: number;
    totalMonths: number;
  };
}

export interface DailySalesResponse {
  success: boolean;
  data: SalesData[];
  meta: {
    year: number;
    month: number;
    totalDays: number;
  };
}

export interface SalesFilters {
  year: number;
  month?: number; // 일별 조회 시에만 사용
}
