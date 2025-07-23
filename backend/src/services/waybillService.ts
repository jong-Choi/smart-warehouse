import { PrismaClient } from "@generated/prisma";
import {
  WaybillFilters,
  WaybillWhereInput,
  WaybillStats,
  PaginationParams,
} from "@typings/index";

const prisma = new PrismaClient();

export class WaybillService {
  /**
   * 모든 운송장 목록을 조회합니다. (페이지네이션 지원)
   */
  async getAllWaybills(
    filters: WaybillFilters = {},
    pagination?: { page?: number; limit?: number; getAll?: boolean }
  ) {
    const where: WaybillWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.operatorId) {
      where.operatorId = filters.operatorId;
    }

    if (filters.locationId) {
      where.locationId = filters.locationId;
    }

    // isAccident 필터는 제거 - status에 ACCIDENT가 있으므로 불필요

    if (filters.search) {
      where.OR = [
        {
          number: {
            contains: filters.search,
          },
        },
      ];
    }

    if (filters.startDate || filters.endDate) {
      where.unloadDate = {};
      if (filters.startDate) {
        where.unloadDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.unloadDate.lte = filters.endDate;
      }
    }

    // getAll이 true이면 전체 조회
    if (pagination?.getAll) {
      const data = await prisma.waybill.findMany({
        where,
        include: {
          operator: {
            select: {
              id: true,
              name: true,
              code: true,
              type: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
          parcel: {
            select: {
              id: true,
              declaredValue: true,
            },
          },
        },
        orderBy: {
          unloadDate: "desc",
        },
      });

      return {
        data,
        pagination: {
          page: 1,
          limit: data.length,
          total: data.length,
          totalPages: 1,
        },
      };
    }

    // 페이지네이션 파라미터 설정
    const page = pagination?.page || 1;
    const limit = Math.min(pagination?.limit || 20, 100); // 최대 100개로 제한
    const skip = (page - 1) * limit;

    // 데이터와 전체 개수를 병렬로 조회
    const [data, total] = await Promise.all([
      prisma.waybill.findMany({
        where,
        include: {
          operator: {
            select: {
              id: true,
              name: true,
              code: true,
              type: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
          parcel: {
            select: {
              id: true,
              declaredValue: true,
            },
          },
        },
        orderBy: {
          unloadDate: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.waybill.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 특정 운송장의 상세 정보를 조회합니다.
   */
  async getWaybillById(id: number) {
    return await prisma.waybill.findUnique({
      where: { id },
      include: {
        operator: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        parcel: {
          select: {
            id: true,
            declaredValue: true,
          },
        },
      },
    });
  }

  /**
   * 운송장 번호로 조회합니다.
   */
  async getWaybillByNumber(number: string) {
    return await prisma.waybill.findUnique({
      where: { number },
      include: {
        operator: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        parcel: {
          select: {
            id: true,
            declaredValue: true,
          },
        },
      },
    });
  }

  /**
   * 운송장 상태별 통계를 조회합니다.
   */
  async getWaybillStats(): Promise<WaybillStats> {
    const stats = await prisma.waybill.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    const totalCount = await prisma.waybill.count();
    const accidentCount = await prisma.waybill.count({
      where: { isAccident: true },
    });

    return {
      total: totalCount,
      byStatus: stats.map((stat) => ({
        status: stat.status,
        count: stat._count.id,
      })),
      accidentCount: accidentCount,
    };
  }

  /**
   * 운송장 달력 데이터(일별 집계)를 통계 테이블에서 조회
   */
  async getWaybillCalendarData(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate) where.date = { gte: startDate.toISOString().split("T")[0] };
    if (endDate)
      where.date = {
        ...(where.date || {}),
        lte: endDate.toISOString().split("T")[0],
      };

    // 일별 전체 합계
    const stats = await prisma.waybillStats.findMany({
      where,
      select: {
        date: true,
        totalCount: true,
      },
      orderBy: { date: "asc" },
    });

    // 날짜별로 합산
    const dateMap = new Map<string, number>();
    stats.forEach((row) => {
      dateMap.set(row.date, (dateMap.get(row.date) || 0) + row.totalCount);
    });
    return Array.from(dateMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  }

  /**
   * 지역별 운송장 통계(통계 테이블 기반)
   */
  async getWaybillsByLocationStats(filters: WaybillFilters = {}) {
    const where: any = {};
    if (filters.startDate)
      where.date = { gte: filters.startDate.toISOString().split("T")[0] };
    if (filters.endDate)
      where.date = {
        ...(where.date || {}),
        lte: filters.endDate.toISOString().split("T")[0],
      };

    // locationId별 합계
    const stats = await prisma.waybillStats.findMany({
      where,
      select: {
        locationId: true,
        totalCount: true,
        location: { select: { name: true, address: true } },
      },
    });

    // locationId별로 합산
    const locMap = new Map<
      number,
      {
        locationId: number;
        locationName: string;
        address: string;
        count: number;
        statuses: { [key: string]: number };
      }
    >();
    stats.forEach((row) => {
      if (!locMap.has(row.locationId)) {
        locMap.set(row.locationId, {
          locationId: row.locationId,
          locationName: row.location.name,
          address: row.location.address || "",
          count: 0,
          statuses: {},
        });
      }
      locMap.get(row.locationId)!.count += row.totalCount;
    });

    // 상태별 카운트 계산 (waybill 테이블에서 실제 상태별로 집계)
    const waybills = await prisma.waybill.findMany({
      where: {
        locationId: { in: Array.from(locMap.keys()) },
        ...(filters.startDate || filters.endDate
          ? {
              unloadDate: {
                ...(filters.startDate && { gte: filters.startDate }),
                ...(filters.endDate && { lte: filters.endDate }),
              },
            }
          : {}),
      },
      select: {
        locationId: true,
        status: true,
      },
    });
    waybills.forEach((wb) => {
      const loc = locMap.get(wb.locationId);
      if (!loc) return;
      loc.statuses[wb.status] = (loc.statuses[wb.status] || 0) + 1;
    });

    return Array.from(locMap.values()).sort((a, b) => b.count - a.count);
  }

  /**
   * 특정 지역의 운송장 목록을 조회합니다.
   */
  async getWaybillsByLocation(
    locationId: number,
    filters: WaybillFilters = {},
    pagination?: { page?: number; limit?: number; getAll?: boolean }
  ) {
    const where: any = {
      locationId: locationId,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        {
          number: {
            contains: filters.search,
          },
        },
      ];
    }

    if (filters.startDate || filters.endDate) {
      where.unloadDate = {};
      if (filters.startDate) {
        where.unloadDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.unloadDate.lte = filters.endDate;
      }
    }

    // getAll이 true이면 전체 조회
    if (pagination?.getAll) {
      const data = await prisma.waybill.findMany({
        where,
        include: {
          location: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
          parcel: {
            select: {
              id: true,
              declaredValue: true,
            },
          },
        },
        orderBy: {
          unloadDate: "desc",
        },
      });

      return {
        data,
        pagination: {
          page: 1,
          limit: data.length,
          total: data.length,
          totalPages: 1,
        },
      };
    }

    // 페이지네이션 처리
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.waybill.findMany({
        where,
        include: {
          location: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
          parcel: {
            select: {
              id: true,
              declaredValue: true,
            },
          },
        },
        orderBy: {
          unloadDate: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.waybill.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * 지역별 운송장 달력 데이터를 조회합니다.
   */
  async getWaybillsByLocationCalendarData(filters: WaybillFilters = {}) {
    const where: WaybillWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.unloadDate = {};
      if (filters.startDate) {
        where.unloadDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.unloadDate.lte = filters.endDate;
      }
    }

    const waybills = await prisma.waybill.findMany({
      where,
      include: {
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 날짜별로 그룹화
    const dateMap = new Map<
      string,
      {
        count: number;
        statuses: { [key: string]: number };
        locations: { [key: string]: { name: string; count: number } };
      }
    >();

    waybills.forEach((waybill) => {
      const dateStr = waybill.unloadDate.toISOString().split("T")[0];

      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { count: 0, statuses: {}, locations: {} });
      }

      const dateData = dateMap.get(dateStr)!;
      dateData.count++;
      dateData.statuses[waybill.status] =
        (dateData.statuses[waybill.status] || 0) + 1;

      // 지역별 카운트
      const locationName = waybill.location?.name || "미지정";
      if (!dateData.locations[locationName]) {
        dateData.locations[locationName] = { name: locationName, count: 0 };
      }
      dateData.locations[locationName].count++;
    });

    // 결과를 배열로 변환
    const result = Array.from(dateMap.entries()).map(([date, data]) => ({
      date,
      count: data.count,
      statuses: data.statuses,
      locations: Object.values(data.locations),
    }));

    return result;
  }
}
