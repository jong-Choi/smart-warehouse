import { Request, Response } from "express";
import { LocationService } from "@services/locationService";
import { parsePaginationQuery } from "@utils/queryParser";

const locationService = new LocationService();

export class LocationController {
  /**
   * 모든 배송지 목록을 조회합니다. (페이지네이션 지원)
   */
  async getAllLocations(req: Request, res: Response) {
    try {
      // 페이지네이션 파라미터 파싱
      const pagination = parsePaginationQuery(req.query);

      const result = await locationService.getAllLocations(pagination);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Error fetching locations:", error);
      res.status(500).json({
        success: false,
        message: "배송지 목록 조회 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 특정 배송지의 상세 정보를 조회합니다.
   */
  async getLocationById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "유효하지 않은 배송지 ID입니다.",
        });
      }

      const location = await locationService.getLocationById(id);

      if (!location) {
        return res.status(404).json({
          success: false,
          message: "해당 배송지를 찾을 수 없습니다.",
        });
      }

      res.json({
        success: true,
        data: location,
      });
    } catch (error) {
      console.error("Error fetching location:", error);
      res.status(500).json({
        success: false,
        message: "배송지 조회 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 배송지별 통계를 조회합니다.
   */
  async getLocationStats(req: Request, res: Response) {
    try {
      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (req.query.startDate) {
        startDate = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        endDate = new Date(req.query.endDate as string);
      }

      const stats = await locationService.getLocationStats(startDate, endDate);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error fetching location stats:", error);
      res.status(500).json({
        success: false,
        message: "배송지 통계 조회 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 특정 배송지의 소포 목록을 조회합니다.
   */
  async getLocationParcels(req: Request, res: Response) {
    try {
      const locationId = parseInt(req.params.locationId);

      if (isNaN(locationId)) {
        return res.status(400).json({
          success: false,
          message: "유효하지 않은 배송지 ID입니다.",
        });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      const parcels = await locationService.getLocationParcels(
        locationId,
        limit
      );

      res.json({
        success: true,
        data: parcels,
        count: parcels.length,
      });
    } catch (error) {
      console.error("Error fetching location parcels:", error);
      res.status(500).json({
        success: false,
        message: "배송지 소포 목록 조회 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 특정 배송지의 작업 통계를 조회합니다.
   */
  async getLocationWorks(req: Request, res: Response) {
    try {
      const locationId = parseInt(req.params.locationId);

      if (isNaN(locationId)) {
        return res.status(400).json({
          success: false,
          message: "유효하지 않은 배송지 ID입니다.",
        });
      }

      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (req.query.startDate) {
        startDate = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        endDate = new Date(req.query.endDate as string);
      }

      const works = await locationService.getLocationWorks(
        locationId,
        startDate,
        endDate
      );

      res.json({
        success: true,
        data: works,
        count: works.length,
      });
    } catch (error) {
      console.error("Error fetching location works:", error);
      res.status(500).json({
        success: false,
        message: "배송지 작업 통계 조회 중 오류가 발생했습니다.",
      });
    }
  }
}
