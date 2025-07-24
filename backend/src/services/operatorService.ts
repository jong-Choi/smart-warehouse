import { PrismaClient } from "@generated/prisma";
import {
  OperatorFilters,
  OperatorWhereInput,
  OperatorStats,
  PaginationParams,
} from "@typings/index";

const prisma = new PrismaClient();

export class OperatorService {
  /**
   * 모든 작업자 목록을 조회합니다. (페이지네이션 지원)
   */
  async getAllOperators(
    filters: OperatorFilters = {},
    pagination?: { page?: number; limit?: number; getAll?: boolean },
    sorting?: { field: string; direction: "asc" | "desc" }
  ) {
    const where: OperatorWhereInput = {};

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    // 정렬 설정
    let orderBy: any;

    if (sorting) {
      // 특별한 정렬 필드들 처리
      if (
        sorting.field === "normalWaybills" ||
        sorting.field === "accidentWaybills"
      ) {
        // 집계된 데이터로 정렬하기 위해 서브쿼리 사용
        orderBy = {
          waybills: {
            _count: sorting.direction,
          },
        };
      } else {
        orderBy = { [sorting.field]: sorting.direction };
      }
    } else {
      orderBy = { name: "asc" as const }; // 기본값: 이름 오름차순
    }

    // getAll이 true이면 전체 조회
    if (pagination?.getAll) {
      const data = await prisma.operator.findMany({
        where,
        include: {
          _count: {
            select: {
              shifts: true,
              works: true,
              waybills: true,
            },
          },
          waybills: {
            select: {
              status: true,
              isAccident: true,
            },
          },
        },
        orderBy,
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
      prisma.operator.findMany({
        where,
        include: {
          _count: {
            select: {
              shifts: true,
              works: true,
              waybills: true,
            },
          },
          waybills: {
            select: {
              status: true,
              isAccident: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.operator.count({ where }),
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
   * 특정 작업자의 상세 정보를 조회합니다.
   */
  async getOperatorById(id: number) {
    return await prisma.operator.findUnique({
      where: { id },
      include: {
        shifts: {
          orderBy: {
            date: "desc",
          },
          take: 10, // 최근 10개 근무 기록
        },
        works: {
          include: {
            location: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
          take: 10, // 최근 10개 작업 기록
        },
        waybills: {
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
            processedAt: "desc",
          },
          take: 10, // 최근 10개 처리 운송장
        },
      },
    });
  }

  /**
   * 작업자 코드로 조회합니다. (대소문자 구분 없음)
   */
  async getOperatorByCode(
    code: string,
    pagination?: { page?: number; limit?: number },
    filters?: {
      status?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    const operator = await prisma.operator.findFirst({
      where: {
        OR: [
          { code: code.toUpperCase() },
          { code: code.toLowerCase() },
          { code: code },
        ],
      },
      include: {
        shifts: {
          orderBy: {
            date: "desc",
          },
          take: 10, // 최근 10개 근무 기록
        },
        works: {
          include: {
            location: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
          take: 10, // 최근 10개 작업 기록
        },
        _count: {
          select: {
            shifts: true,
            works: true,
            waybills: true,
          },
        },
      },
    });

    if (!operator) {
      return null;
    }

    // 운송장 처리 내역 조회 (페이지네이션 및 필터링)
    const page = pagination?.page || 1;
    const limit = Math.min(pagination?.limit || 20, 100);
    const skip = (page - 1) * limit;

    const waybillWhere: any = {
      operatorId: operator.id,
    };

    // 상태 필터
    if (filters?.status && filters.status !== "all") {
      waybillWhere.status = filters.status;
    }

    // 날짜 필터
    if (filters?.startDate || filters?.endDate) {
      waybillWhere.processedAt = {};
      if (filters.startDate) {
        waybillWhere.processedAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        waybillWhere.processedAt.lte = filters.endDate;
      }
    }

    const [waybills, totalWaybills] = await Promise.all([
      prisma.waybill.findMany({
        where: waybillWhere,
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
          processedAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.waybill.count({ where: waybillWhere }),
    ]);

    return {
      ...operator,
      waybills,
      waybillsPagination: {
        page,
        limit,
        total: totalWaybills,
        totalPages: Math.ceil(totalWaybills / limit),
      },
    };
  }

  /**
   * 작업자별 KPI 통계를 조회합니다.
   */
  async getOperatorStats(
    startDate?: Date,
    endDate?: Date
  ): Promise<OperatorStats> {
    // 날짜 필터 조건 설정
    const dateFilter: any = {};
    if (startDate || endDate) {
      if (startDate) {
        dateFilter.gte = startDate;
      }
      if (endDate) {
        dateFilter.lte = endDate;
      }
    }

    // 기본 통계 (타입별 개수)
    const stats = await prisma.operator.groupBy({
      by: ["type"],
      _count: {
        id: true,
      },
    });

    const totalCount = await prisma.operator.count();

    // 모든 작업자 조회
    const operators = await prisma.operator.findMany();

    // 각 작업자별 상세 통계 계산
    const operatorStats = await Promise.all(
      operators.map(async (operator) => {
        // 총 처리한 운송장 수 (NORMAL + ACCIDENT)
        const totalProcessedCount = await prisma.waybill.count({
          where: {
            operatorId: operator.id,
            status: { in: ["NORMAL", "ACCIDENT"] },
            ...(Object.keys(dateFilter).length > 0 && {
              processedAt: dateFilter,
            }),
          },
        });

        // 사고 처리 건수 (ACCIDENT)
        const accidentCount = await prisma.waybill.count({
          where: {
            operatorId: operator.id,
            status: "ACCIDENT",
            ...(Object.keys(dateFilter).length > 0 && {
              processedAt: dateFilter,
            }),
          },
        });

        // 총 처리 금액 (정상 처리된 운송장들의 가액 합계)
        const normalWaybillsWithParcels = await prisma.waybill.findMany({
          where: {
            operatorId: operator.id,
            status: "NORMAL",
            ...(Object.keys(dateFilter).length > 0 && {
              processedAt: dateFilter,
            }),
          },
          include: {
            parcel: {
              select: {
                declaredValue: true,
              },
            },
          },
        });

        const totalRevenue = normalWaybillsWithParcels.reduce(
          (sum, waybill) => sum + (waybill.parcel?.declaredValue || 0),
          0
        );

        // 사고 금액 (사고 처리된 운송장들의 가액 합계)
        const accidentWaybillsWithParcels = await prisma.waybill.findMany({
          where: {
            operatorId: operator.id,
            status: "ACCIDENT",
            ...(Object.keys(dateFilter).length > 0 && {
              processedAt: dateFilter,
            }),
          },
          include: {
            parcel: {
              select: {
                declaredValue: true,
              },
            },
          },
        });

        const accidentAmount = accidentWaybillsWithParcels.reduce(
          (sum, waybill) => sum + (waybill.parcel?.declaredValue || 0),
          0
        );

        // 일평균 처리량 계산
        let averageDailyProcessed = 0;
        if (Object.keys(dateFilter).length > 0) {
          const start = startDate || new Date(0);
          const end = endDate || new Date();
          const daysDiff = Math.ceil(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysDiff > 0) {
            averageDailyProcessed = Math.round(totalProcessedCount / daysDiff);
          }
        }

        return {
          id: operator.id,
          name: operator.name,
          code: operator.code,
          type: operator.type,
          totalProcessedCount,
          accidentCount,
          totalRevenue,
          accidentAmount,
          averageDailyProcessed,
        };
      })
    );

    return {
      total: totalCount,
      byType: stats.map((stat) => ({
        type: stat.type,
        count: stat._count.id,
      })),
      operators: operatorStats,
    };
  }

  /**
   * 작업자의 근무 기록을 조회합니다.
   */
  async getOperatorShifts(
    operatorId: number,
    startDate?: Date,
    endDate?: Date
  ) {
    const where: any = { operatorId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = startDate;
      }
      if (endDate) {
        where.date.lte = endDate;
      }
    }

    return await prisma.operatorShift.findMany({
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
      },
      orderBy: {
        date: "desc",
      },
    });
  }

  /**
   * 작업자의 작업 통계를 조회합니다.
   */
  async getOperatorWorks(operatorId: number, startDate?: Date, endDate?: Date) {
    const where: any = { operatorId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = startDate;
      }
      if (endDate) {
        where.date.lte = endDate;
      }
    }

    return await prisma.operatorWork.findMany({
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
      },
      orderBy: {
        date: "desc",
      },
    });
  }

  /**
   * 모든 작업자의 통계를 조회합니다.
   */
  async getAllOperatorsStats() {
    return await prisma.operatorsStats.findMany({
      include: {
        operator: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }
}
