import { PrismaClient } from "@generated/prisma";

const prisma = new PrismaClient();

export interface SalesData {
  period: string; // "2024.01" 또는 "1일" 형식
  unloadCount: number; // 하차물량(운송장 수)
  totalShippingValue: number; // 총 운송가액
  avgShippingValue: number; // 운송장별 평균 운송가액
  normalProcessCount: number; // 정상처리건수
  processValue: number; // 정상처리가액
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
    const salesStats = await prisma.salesMonthlyStats.findMany({
      where: { year },
      orderBy: { month: "asc" },
      select: {
        month: true,
        totalSales: true,
        totalCount: true,
        normalCount: true,
        normalValue: true,
        accidentCount: true,
        accidentValue: true,
        locationId: true,
      },
    });
    return salesStats.map((row) => {
      return {
        period: `${year}.${String(row.month).padStart(2, "0")}`,
        unloadCount: row.totalCount,
        totalShippingValue: row.totalSales,
        avgShippingValue:
          row.totalCount > 0 ? Math.round(row.totalSales / row.totalCount) : 0,
        normalProcessCount: row.normalCount,
        processValue: row.normalValue,
        accidentCount: row.accidentCount,
        accidentValue: row.accidentValue,
      };
    });
  }

  /**
   * 일별 매출 통계를 통계 테이블에서 조회
   */
  async getDailySales(year: number, month: number): Promise<SalesData[]> {
    const monthStr = String(month).padStart(2, "0");
    const salesStats = await prisma.salesStats.findMany({
      where: {
        date: {
          gte: `${year}-${monthStr}-01`,
          lte: `${year}-${monthStr}-31`,
        },
      },
      orderBy: { date: "asc" },
      select: {
        date: true,
        totalSales: true,
        totalCount: true,
        normalCount: true,
        normalValue: true,
        accidentCount: true,
        accidentValue: true,
        locationId: true,
      },
    });
    return salesStats.map((row) => {
      const day = Number(row.date.split("-")[2]);
      return {
        period: `${day}일`,
        unloadCount: row.totalCount,
        totalShippingValue: row.totalSales,
        avgShippingValue:
          row.totalCount > 0 ? Math.round(row.totalSales / row.totalCount) : 0,
        normalProcessCount: row.normalCount,
        processValue: row.normalValue,
        accidentCount: row.accidentCount,
        accidentValue: row.accidentValue,
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
    const stats = await prisma.salesStats.findMany({
      where: {
        date: { gte: start, lt: end },
      },
    });
    const unloadCount = stats.reduce((sum, s) => sum + s.totalCount, 0);
    const totalShippingValue = stats.reduce((sum, s) => sum + s.totalSales, 0);
    const avgShippingValue =
      unloadCount > 0 ? totalShippingValue / unloadCount : 0;
    const normalProcessCount = stats.reduce((sum, s) => sum + s.normalCount, 0);
    const processValue = stats.reduce((sum, s) => sum + s.normalValue, 0);
    const accidentCount = stats.reduce((sum, s) => sum + s.accidentCount, 0);
    const accidentValue = stats.reduce((sum, s) => sum + s.accidentValue, 0);
    return {
      unloadCount,
      totalShippingValue,
      avgShippingValue: Math.round(avgShippingValue),
      normalProcessCount,
      processValue,
      accidentCount,
      accidentValue,
    };
  }

  /**
   * 매출 개요 데이터를 통계 테이블에서 조회
   */
  async getSalesOverview(year: number): Promise<SalesOverviewData> {
    const yearStr = year.toString();
    const stats = await prisma.salesStats.findMany({
      where: { date: { gte: `${yearStr}-01-01`, lte: `${yearStr}-12-31` } },
    });
    const totalRevenue = stats.reduce((sum, s) => sum + s.totalSales, 0);
    const avgShippingValue =
      stats.reduce((sum, s) => sum + s.totalSales, 0) /
      (stats.reduce((sum, s) => sum + s.totalCount, 0) || 1);
    const totalProcessedCount = stats.reduce((sum, s) => sum + s.totalCount, 0);
    const totalAccidentCount = stats.reduce(
      (sum, s) => sum + s.accidentCount,
      0
    );
    const totalAccidentValue = stats.reduce(
      (sum, s) => sum + s.accidentValue,
      0
    );
    const accidentLossRate =
      totalRevenue > 0
        ? Math.round((totalAccidentValue / totalRevenue) * 1000) / 10
        : 0; // %
    // 월별 성장률 계산
    const monthlyStats = await prisma.salesMonthlyStats.findMany({
      where: { year },
      orderBy: { month: "asc" },
    });
    let monthlyGrowthRate = 0;
    let currentMonthRevenue = 0;
    let previousMonthRevenue = 0;
    if (monthlyStats.length >= 2) {
      currentMonthRevenue = monthlyStats[monthlyStats.length - 1].totalSales;
      previousMonthRevenue = monthlyStats[monthlyStats.length - 2].totalSales;
      if (previousMonthRevenue > 0) {
        monthlyGrowthRate =
          Math.round(
            ((currentMonthRevenue - previousMonthRevenue) /
              previousMonthRevenue) *
              1000
          ) / 10;
      }
    }
    return {
      totalRevenue,
      avgShippingValue: Math.round(avgShippingValue),
      accidentLossRate,
      monthlyGrowthRate,
      totalProcessedCount,
      totalAccidentCount,
      currentMonthRevenue,
      previousMonthRevenue,
    };
  }

  /**
   * 지역별 매출 통계를 통계 테이블에서 조회
   */
  async getLocationSales(year: number) {
    const yearStr = year.toString();
    // location별 매출, 운송장수 각각 조회 후 매핑
    const salesStats = await prisma.salesStats.findMany({
      where: { date: { gte: `${yearStr}-01-01`, lte: `${yearStr}-12-31` } },
      select: {
        locationId: true,
        totalSales: true,
        totalCount: true,
        accidentCount: true,
        location: { select: { name: true } },
      },
    });
    // locationId별로 집계
    const locMap = new Map<
      number,
      {
        locationName: string;
        revenue: number;
        processedCount: number;
        accidentCount: number;
      }
    >();
    salesStats.forEach((row) => {
      if (!locMap.has(row.locationId)) {
        locMap.set(row.locationId, {
          locationName: row.location.name,
          revenue: 0,
          processedCount: 0,
          accidentCount: 0,
        });
      }
      const loc = locMap.get(row.locationId)!;
      loc.revenue += row.totalSales;
      loc.processedCount += row.totalCount;
      loc.accidentCount += row.accidentCount;
    });
    return Array.from(locMap.values()).sort((a, b) => b.revenue - a.revenue);
  }
}
