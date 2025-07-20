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
    const unloadCount = await prisma.waybill.count({
      where: {
        processedAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    // 총 운송가액 (Waybill을 통해 Parcel의 declaredValue 조회)
    const waybillsWithParcels = await prisma.waybill.findMany({
      where: {
        processedAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: {
        parcel: {
          select: {
            declaredValue: true,
          },
        },
      },
    });

    const totalShippingValue = waybillsWithParcels.reduce(
      (sum, waybill) => sum + (waybill.parcel?.declaredValue || 0),
      0
    );

    // 운송장별 평균 운송가액
    const avgShippingValue =
      unloadCount > 0 ? totalShippingValue / unloadCount : 0;

    // 정상처리건수
    const normalProcessCount = await prisma.waybill.count({
      where: {
        processedAt: {
          gte: startDate,
          lt: endDate,
        },
        status: "NORMAL",
      },
    });

    // 처리가액 (정상처리된 운송장의 가액 합계)
    const normalWaybillsWithParcels = await prisma.waybill.findMany({
      where: {
        processedAt: {
          gte: startDate,
          lt: endDate,
        },
        status: "NORMAL",
      },
      include: {
        parcel: {
          select: {
            declaredValue: true,
          },
        },
      },
    });

    const processValue = normalWaybillsWithParcels.reduce(
      (sum, waybill) => sum + (waybill.parcel?.declaredValue || 0),
      0
    );

    // 사고건수
    const accidentCount = await prisma.waybill.count({
      where: {
        processedAt: {
          gte: startDate,
          lt: endDate,
        },
        isAccident: true,
      },
    });

    // 사고가액
    const accidentWaybillsWithParcels = await prisma.waybill.findMany({
      where: {
        processedAt: {
          gte: startDate,
          lt: endDate,
        },
        isAccident: true,
      },
      include: {
        parcel: {
          select: {
            declaredValue: true,
          },
        },
      },
    });

    const accidentValue = accidentWaybillsWithParcels.reduce(
      (sum, waybill) => sum + (waybill.parcel?.declaredValue || 0),
      0
    );

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
   * 매출 개요 데이터를 조회합니다.
   * @param year 조회할 연도
   * @returns 매출 개요 데이터
   */
  async getSalesOverview(year: number): Promise<SalesOverviewData> {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // 요청된 연도의 12월 데이터 (이번 달 대신)
    const requestedYearMonthStart = new Date(year, 11, 1); // 12월 1일
    const requestedYearMonthEnd = new Date(year + 1, 0, 1); // 다음 년도 1월 1일
    const currentMonthData = await this.calculateSalesForPeriod(
      requestedYearMonthStart,
      requestedYearMonthEnd
    );

    // 요청된 연도의 11월 데이터 (지난 달 대신)
    const previousMonthStart = new Date(year, 10, 1); // 11월 1일
    const previousMonthEnd = new Date(year, 11, 1); // 12월 1일
    const previousMonthData = await this.calculateSalesForPeriod(
      previousMonthStart,
      previousMonthEnd
    );

    // 요청된 연도 전체 데이터
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year + 1, 0, 1);
    const yearData = await this.calculateSalesForPeriod(yearStart, yearEnd);

    // 요청된 연도의 이전 년도 전체 데이터 (성장률 계산용)
    const lastYearStart = new Date(year - 1, 0, 1);
    const lastYearEnd = new Date(year, 0, 1);
    const lastYearData = await this.calculateSalesForPeriod(
      lastYearStart,
      lastYearEnd
    );

    // 월별 성장률 계산
    const monthlyGrowthRate =
      previousMonthData.processValue > 0
        ? ((currentMonthData.processValue - previousMonthData.processValue) /
            previousMonthData.processValue) *
          100
        : 0;

    // 사고 손실률 계산
    const accidentLossRate =
      yearData.processValue > 0
        ? (yearData.accidentValue / yearData.processValue) * 100
        : 0;

    return {
      totalRevenue: yearData.processValue,
      avgShippingValue: Math.round(yearData.avgShippingValue),
      accidentLossRate: Math.round(accidentLossRate * 100) / 100, // 소수점 2자리
      monthlyGrowthRate: Math.round(monthlyGrowthRate * 100) / 100, // 소수점 2자리
      totalProcessedCount: yearData.normalProcessCount,
      totalAccidentCount: yearData.accidentCount,
      currentMonthRevenue: currentMonthData.processValue,
      previousMonthRevenue: previousMonthData.processValue,
    };
  }

  /**
   * 지역별 매출 데이터를 조회합니다.
   * @param year 조회할 연도
   * @returns 지역별 매출 데이터
   */
  async getLocationSales(year: number): Promise<
    Array<{
      locationName: string;
      revenue: number;
      processedCount: number;
      accidentCount: number;
    }>
  > {
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year + 1, 0, 1);

    // 정상처리된 운송장들을 지역별로 그룹화
    const normalWaybillsWithParcels = await prisma.waybill.findMany({
      where: {
        processedAt: {
          gte: yearStart,
          lt: yearEnd,
        },
        status: "NORMAL",
      },
      include: {
        location: {
          select: {
            name: true,
          },
        },
        parcel: {
          select: {
            declaredValue: true,
          },
        },
      },
    });

    // 사고 운송장들을 지역별로 그룹화
    const accidentWaybills = await prisma.waybill.findMany({
      where: {
        processedAt: {
          gte: yearStart,
          lt: yearEnd,
        },
        isAccident: true,
      },
      include: {
        location: {
          select: {
            name: true,
          },
        },
      },
    });

    // 지역별로 데이터 그룹화
    const locationMap = new Map<
      string,
      {
        locationName: string;
        revenue: number;
        processedCount: number;
        accidentCount: number;
      }
    >();

    // 정상처리 데이터 처리
    normalWaybillsWithParcels.forEach((waybill) => {
      const locationName = waybill.location?.name || "알 수 없는 위치";
      const value = waybill.parcel?.declaredValue || 0;

      if (!locationMap.has(locationName)) {
        locationMap.set(locationName, {
          locationName,
          revenue: 0,
          processedCount: 0,
          accidentCount: 0,
        });
      }

      const locationData = locationMap.get(locationName)!;
      locationData.revenue += value;
      locationData.processedCount += 1;
    });

    // 사고 데이터 처리
    accidentWaybills.forEach((waybill) => {
      const locationName = waybill.location?.name || "알 수 없는 위치";

      if (!locationMap.has(locationName)) {
        locationMap.set(locationName, {
          locationName,
          revenue: 0,
          processedCount: 0,
          accidentCount: 0,
        });
      }

      const locationData = locationMap.get(locationName)!;
      locationData.accidentCount += 1;
    });

    // 결과를 배열로 변환하고 매출 순으로 정렬
    const result = Array.from(locationMap.values()).sort(
      (a, b) => b.revenue - a.revenue
    );

    return result;
  }
}
