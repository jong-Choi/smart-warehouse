import { PrismaClient } from "@generated/prisma";
import { LocationStats, PaginationParams } from "@typings/index";

const prisma = new PrismaClient();

export class LocationService {
  /**
   * 모든 배송지 목록을 조회합니다. (페이지네이션 지원)
   */
  async getAllLocations(pagination?: {
    page?: number;
    limit?: number;
    getAll?: boolean;
  }) {
    // getAll이 true이면 전체 조회
    if (pagination?.getAll) {
      const data = await prisma.location.findMany({
        include: {
          _count: {
            select: {
              parcels: true,
              operatorWorks: true,
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
      prisma.location.findMany({
        include: {
          _count: {
            select: {
              parcels: true,
              operatorWorks: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.location.count(),
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
   * 특정 배송지의 상세 정보를 조회합니다.
   */
  async getLocationById(id: number) {
    return await prisma.location.findUnique({
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
          take: 20, // 최근 20개 소포
        },
        operatorWorks: {
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
          take: 20, // 최근 20개 작업 기록
        },
      },
    });
  }

  /**
   * 배송지별 통계를 조회합니다.
   */
  async getLocationStats(): Promise<LocationStats> {
    const locations = await prisma.location.findMany({
      include: {
        _count: {
          select: {
            parcels: true,
            operatorWorks: true,
          },
        },
      },
    });

    return {
      total: locations.length,
      locations: locations.map((location) => ({
        id: location.id,
        name: location.name,
        address: location.address,
        parcelCount: location._count.parcels,
        workCount: location._count.operatorWorks,
      })),
    };
  }

  /**
   * 특정 배송지의 소포 목록을 조회합니다.
   */
  async getLocationParcels(locationId: number, limit = 50) {
    return await prisma.parcel.findMany({
      where: { locationId },
      include: {
        operator: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
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
      take: limit,
    });
  }

  /**
   * 특정 배송지의 작업 통계를 조회합니다.
   */
  async getLocationWorks(locationId: number, startDate?: Date, endDate?: Date) {
    const where: any = { locationId };

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
