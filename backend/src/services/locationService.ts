import { PrismaClient } from "@generated/prisma";

const prisma = new PrismaClient();

export class LocationService {
  /**
   * 모든 배송지 목록을 조회합니다.
   */
  async getAllLocations() {
    return await prisma.location.findMany({
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
  async getLocationStats() {
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
