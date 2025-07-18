import { PrismaClient } from "@generated/prisma";
import {
  ParcelFilters,
  ParcelWhereInput,
  ParcelStats,
  PaginationParams,
} from "@typings/index";

const prisma = new PrismaClient();

export class ParcelService {
  /**
   * 모든 소포 목록을 조회합니다. (페이지네이션 지원)
   */
  async getAllParcels(
    filters: ParcelFilters = {},
    pagination?: { page?: number; limit?: number; getAll?: boolean }
  ) {
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

    // getAll이 true이면 전체 조회
    if (pagination?.getAll) {
      const data = await prisma.parcel.findMany({
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
      prisma.parcel.findMany({
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
        skip,
        take: limit,
      }),
      prisma.parcel.count({ where }),
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
      accidentCount: accidentCount,
    };
  }
}
