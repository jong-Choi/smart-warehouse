import { PrismaClient } from "@generated/prisma";

const prisma = new PrismaClient();

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

export interface SalesOverviewData {
  totalRevenue: number; // 총 매출
  avgShippingValue: number; // 평균 운송가액
  accidentLossRate: number; // 사고 손실률
  monthlyGrowthRate: number; // 월별 성장률
  totalProcessedCount: number; // 총 처리 건수
  totalAccidentCount: number; // 총 사고 건수
  currentMonthRevenue: number; // 이번 달 매출
  previousMonthRevenue: number; // 지난 달 매출
}

export class SalesService {
  /**
   * 월별 매출 통계를 통계 테이블에서 조회
   */
  async getMonthlySales(year: number): Promise<SalesData[]> {
    const stats = await prisma.salesMonthlyStats.findMany({
      where: { year },
      select: { month: true, totalSales: true },
      orderBy: { month: "asc" },
    });
    return stats.map((row) => ({
      period: `${year}.${String(row.month).padStart(2, "0")}`,
      unloadCount: 0,
      totalShippingValue: row.totalSales,
      avgShippingValue: row.totalSales, // 단순화(필요시 평균 계산 가능)
      normalProcessCount: 0,
      processValue: 0,
      accidentCount: 0,
      accidentValue: 0,
    }));
  }

  /**
   * 일별 매출 통계를 통계 테이블에서 조회
   */
  async getDailySales(year: number, month: number): Promise<SalesData[]> {
    const monthStr = String(month).padStart(2, "0");
    const stats = await prisma.salesStats.findMany({
      where: {
        date: { gte: `${year}-${monthStr}-01`, lte: `${year}-${monthStr}-31` },
      },
      select: { date: true, totalSales: true },
      orderBy: { date: "asc" },
    });
    return stats.map((row) => {
      const day = Number(row.date.split("-")[2]);
      return {
        period: `${day}일`,
        unloadCount: 0,
        totalShippingValue: row.totalSales,
        avgShippingValue: row.totalSales,
        normalProcessCount: 0,
        processValue: 0,
        accidentCount: 0,
        accidentValue: 0,
      };
    });
  }

  /**
   * 특정 기간의 매출 통계를 통계 테이블에서 계산
   */
  private async calculateSalesForPeriod(
    startDate: Date,
    endDate: Date
  ): Promise<Omit<SalesData, "period">> {
    const start = startDate.toISOString().split("T")[0];
    const end = endDate.toISOString().split("T")[0];
    // 해당 기간의 sales_stats 집계
    const stats = await prisma.salesStats.findMany({
      where: {
        date: { gte: start, lt: end },
      },
    });
    const unloadCount = stats.length; // 일수(집계 row 수)
    const totalShippingValue = stats.reduce((sum, s) => sum + s.totalSales, 0);
    const avgShippingValue =
      unloadCount > 0 ? totalShippingValue / unloadCount : 0;
    // processValue, accidentValue 등은 통계 테이블에 없으므로 0으로 반환(추후 확장 가능)
    return {
      unloadCount,
      totalShippingValue,
      avgShippingValue: Math.round(avgShippingValue),
      normalProcessCount: 0,
      processValue: 0,
      accidentCount: 0,
      accidentValue: 0,
    };
  }

  /**
   * 매출 개요 데이터를 통계 테이블에서 조회
   */
  async getSalesOverview(year: number): Promise<SalesOverviewData> {
    const yearStr = year.toString();
    // 연간 전체
    const stats = await prisma.salesStats.findMany({
      where: { date: { gte: `${yearStr}-01-01`, lte: `${yearStr}-12-31` } },
    });
    const totalRevenue = stats.reduce((sum, s) => sum + s.totalSales, 0);
    const avgShippingValue = stats.length > 0 ? totalRevenue / stats.length : 0;
    // 월별 성장률, 사고율 등은 통계 테이블에 없으므로 0으로 반환(추후 확장 가능)
    return {
      totalRevenue,
      avgShippingValue: Math.round(avgShippingValue),
      accidentLossRate: 0,
      monthlyGrowthRate: 0,
      totalProcessedCount: 0,
      totalAccidentCount: 0,
      currentMonthRevenue: 0,
      previousMonthRevenue: 0,
    };
  }

  /**
   * 지역별 매출 통계를 통계 테이블에서 조회
   */
  async getLocationSales(year: number) {
    const yearStr = year.toString();
    const stats = await prisma.salesStats.findMany({
      where: { date: { gte: `${yearStr}-01-01`, lte: `${yearStr}-12-31` } },
      select: {
        locationId: true,
        totalSales: true,
        location: { select: { name: true } },
      },
    });
    // locationId별로 합산
    const locMap = new Map<
      number,
      {
        locationName: string;
        revenue: number;
        processedCount: number;
        accidentCount: number;
      }
    >();
    stats.forEach((row) => {
      if (!locMap.has(row.locationId)) {
        locMap.set(row.locationId, {
          locationName: row.location.name,
          revenue: 0,
          processedCount: 0,
          accidentCount: 0,
        });
      }
      locMap.get(row.locationId)!.revenue += row.totalSales;
      locMap.get(row.locationId)!.processedCount += 1;
    });
    return Array.from(locMap.values()).sort((a, b) => b.revenue - a.revenue);
  }
}
