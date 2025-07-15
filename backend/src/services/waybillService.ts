import { PrismaClient, WaybillStatus } from "@generated/prisma";

const prisma = new PrismaClient();

export interface WaybillFilters {
  status?: WaybillStatus;
  startDate?: Date;
  endDate?: Date;
}

export class WaybillService {
  /**
   * 모든 운송장 목록을 조회합니다.
   */
  async getAllWaybills(filters: WaybillFilters = {}) {
    const where: any = {};

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

    return await prisma.waybill.findMany({
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
  async getWaybillStats() {
    const stats = await prisma.waybill.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    const totalCount = await prisma.waybill.count();

    return {
      total: totalCount,
      byStatus: stats.map((stat: any) => ({
        status: stat.status,
        count: stat._count.id,
      })),
    };
  }
}
