import { PrismaClient, OperatorType } from "../generated/prisma";

const prisma = new PrismaClient();

export interface OperatorFilters {
  type?: OperatorType;
  startDate?: Date;
  endDate?: Date;
}

export class OperatorService {
  /**
   * 모든 작업자 목록을 조회합니다.
   */
  async getAllOperators(filters: OperatorFilters = {}) {
    const where: any = {};

    if (filters.type) {
      where.type = filters.type;
    }

    return await prisma.operator.findMany({
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
  async getOperatorStats() {
    const stats = await prisma.operator.groupBy({
      by: ["type"],
      _count: {
        id: true,
      },
    });

    const totalCount = await prisma.operator.count();

    return {
      total: totalCount,
      byType: stats.map((stat: any) => ({
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
