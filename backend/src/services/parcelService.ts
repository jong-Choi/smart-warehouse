import { PrismaClient } from "@generated/prisma";
import { ParcelFilters, ParcelWhereInput, ParcelStats } from "@typings/index";

const prisma = new PrismaClient();

export class ParcelService {
  /**
   * 모든 소포 목록을 조회합니다.
   */
  async getAllParcels(filters: ParcelFilters = {}) {
    const where: ParcelWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.operatorId) {
      where.operatorId = filters.operatorId;
    }

    if (filters.locationId) {
      where.locationId = filters.locationId;
    }

    if (filters.waybillId) {
      where.waybillId = filters.waybillId;
    }

    if (filters.isAccident !== undefined) {
      where.isAccident = filters.isAccident;
    }

    if (filters.startDate || filters.endDate) {
      where.processedAt = {};
      if (filters.startDate) {
        where.processedAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.processedAt.lte = filters.endDate;
      }
    }

    return await prisma.parcel.findMany({
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
    });
  }

  /**
   * 특정 소포의 상세 정보를 조회합니다.
   */
  async getParcelById(id: number) {
    return await prisma.parcel.findUnique({
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
        waybill: {
          select: {
            id: true,
            number: true,
            status: true,
            shippedAt: true,
            deliveredAt: true,
          },
        },
      },
    });
  }

  /**
   * 소포 상태별 통계를 조회합니다.
   */
  async getParcelStats(): Promise<ParcelStats> {
    const stats = await prisma.parcel.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    const totalCount = await prisma.parcel.count();
    const accidentCount = await prisma.parcel.count({
      where: { isAccident: true },
    });

    return {
      total: totalCount,
      byStatus: stats.map((stat) => ({
        status: stat.status,
        count: stat._count.id,
      })),
      accidents: accidentCount,
    };
  }
}
