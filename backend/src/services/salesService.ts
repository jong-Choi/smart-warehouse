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

export class SalesService {
  /**
   * 월별 매출 통계를 조회합니다.
   * @param year 조회할 연도 (예: 2024)
   * @returns 월별 매출 데이터 배열
   */
  async getMonthlySales(year: number): Promise<SalesData[]> {
    const startDate = new Date(year, 0, 1); // 1월 1일
    const endDate = new Date(year + 1, 0, 1); // 다음 년도 1월 1일

    const monthlyData: SalesData[] = [];

    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 1);

      const data = await this.calculateSalesForPeriod(monthStart, monthEnd);
      monthlyData.push({
        ...data,
        period: `${year}.${String(month + 1).padStart(2, "0")}`,
      });
    }

    return monthlyData;
  }

  /**
   * 일별 매출 통계를 조회합니다.
   * @param year 조회할 연도
   * @param month 조회할 월 (1-12)
   * @returns 일별 매출 데이터 배열
   */
  async getDailySales(year: number, month: number): Promise<SalesData[]> {
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 1);
    const daysInMonth = new Date(year, month, 0).getDate();

    const dailyData: SalesData[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStart = new Date(year, month - 1, day);
      const dayEnd = new Date(year, month - 1, day + 1);

      const data = await this.calculateSalesForPeriod(dayStart, dayEnd);
      dailyData.push({
        ...data,
        period: `${day}일`,
      });
    }

    return dailyData;
  }

  /**
   * 특정 기간의 매출 통계를 계산합니다.
   */
  private async calculateSalesForPeriod(
    startDate: Date,
    endDate: Date
  ): Promise<Omit<SalesData, "period">> {
    // 하차물량(운송장 수) - processedAt 기준
    const unloadCount = await prisma.parcel.count({
      where: {
        processedAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    // 총 운송가액
    const totalShippingValueResult = await prisma.parcel.aggregate({
      where: {
        processedAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: {
        declaredValue: true,
      },
    });

    const totalShippingValue = totalShippingValueResult._sum.declaredValue || 0;

    // 운송장별 평균 운송가액
    const avgShippingValue =
      unloadCount > 0 ? totalShippingValue / unloadCount : 0;

    // 정상처리건수
    const normalProcessCount = await prisma.parcel.count({
      where: {
        processedAt: {
          gte: startDate,
          lt: endDate,
        },
        status: "NORMAL",
      },
    });

    // 처리가액 (정상처리된 소포의 가액 합계)
    const processValueResult = await prisma.parcel.aggregate({
      where: {
        processedAt: {
          gte: startDate,
          lt: endDate,
        },
        status: "NORMAL",
      },
      _sum: {
        declaredValue: true,
      },
    });

    const processValue = processValueResult._sum.declaredValue || 0;

    // 사고건수
    const accidentCount = await prisma.parcel.count({
      where: {
        processedAt: {
          gte: startDate,
          lt: endDate,
        },
        isAccident: true,
      },
    });

    // 사고가액
    const accidentValueResult = await prisma.parcel.aggregate({
      where: {
        processedAt: {
          gte: startDate,
          lt: endDate,
        },
        isAccident: true,
      },
      _sum: {
        declaredValue: true,
      },
    });

    const accidentValue = accidentValueResult._sum.declaredValue || 0;

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
}
