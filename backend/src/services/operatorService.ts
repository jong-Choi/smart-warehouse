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
    pagination?: { page?: number; limit?: number; getAll?: boolean }
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

    // getAll이 true이면 전체 조회
    if (pagination?.getAll) {
      const data = await prisma.operator.findMany({
        where,
        include: {
          _count: {
            select: {
              shifts: true,
              works: true,
              parcels: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
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
      prisma.operator.findMany({
        where,
        include: {
          _count: {
            select: {
              shifts: true,
              works: true,
              parcels: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
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
        parcels: {
          include: {
            location: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
            waybill: {
              select: {
                id: true,
                number: true,
                status: true,
              },
            },
          },
          orderBy: {
            processedAt: "desc",
          },
          take: 10, // 최근 10개 처리 소포
        },
      },
    });
  }

  /**
   * 작업자 코드로 조회합니다.
   */
  async getOperatorByCode(code: string) {
    return await prisma.operator.findUnique({
      where: { code },
      include: {
        _count: {
          select: {
            shifts: true,
            works: true,
            parcels: true,
          },
        },
      },
    });
  }

  /**
   * 작업자별 KPI 통계를 조회합니다.
   */
  async getOperatorStats(): Promise<OperatorStats> {
    const stats = await prisma.operator.groupBy({
      by: ["type"],
      _count: {
        id: true,
      },
    });

    const totalCount = await prisma.operator.count();

    return {
      total: totalCount,
      byType: stats.map((stat) => ({
        type: stat.type,
        count: stat._count.id,
      })),
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
}
