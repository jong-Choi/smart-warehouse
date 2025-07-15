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

    if (filters.startDate || filters.endDate) {
      where.shippedAt = {};
      if (filters.startDate) {
        where.shippedAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.shippedAt.lte = filters.endDate;
      }
    }

    // getAll이 true이면 전체 조회
    if (pagination?.getAll) {
      const data = await prisma.waybill.findMany({
        where,
        include: {
          parcels: {
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
          },
        },
        orderBy: {
          shippedAt: "desc",
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
          parcels: {
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
          },
        },
        orderBy: {
          shippedAt: "desc",
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
        parcels: {
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
        parcels: {
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

    return {
      total: totalCount,
      byStatus: stats.map((stat) => ({
        status: stat.status,
        count: stat._count.id,
      })),
    };
  }
}
