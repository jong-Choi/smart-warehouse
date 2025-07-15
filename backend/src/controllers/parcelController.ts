import { Request, Response } from "express";
import { ParcelService, ParcelFilters } from "@services/parcelService";

const parcelService = new ParcelService();

export class ParcelController {
  /**
   * 모든 소포 목록을 조회합니다.
   */
  async getAllParcels(req: Request, res: Response) {
    try {
      const filters: ParcelFilters = {};

      // 쿼리 파라미터 파싱
      if (req.query.status) {
        filters.status = req.query.status as any;
      }
      if (req.query.operatorId) {
        filters.operatorId = parseInt(req.query.operatorId as string);
      }
      if (req.query.locationId) {
        filters.locationId = parseInt(req.query.locationId as string);
      }
      if (req.query.waybillId) {
        filters.waybillId = parseInt(req.query.waybillId as string);
      }
      if (req.query.isAccident !== undefined) {
        filters.isAccident = req.query.isAccident === "true";
      }
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }

      const parcels = await parcelService.getAllParcels(filters);

      res.json({
        success: true,
        data: parcels,
        count: parcels.length,
      });
    } catch (error) {
      console.error("Error fetching parcels:", error);
      res.status(500).json({
        success: false,
        message: "소포 목록 조회 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 특정 소포의 상세 정보를 조회합니다.
   */
  async getParcelById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "유효하지 않은 소포 ID입니다.",
        });
      }

      const parcel = await parcelService.getParcelById(id);

      if (!parcel) {
        return res.status(404).json({
          success: false,
          message: "해당 소포를 찾을 수 없습니다.",
        });
      }

      res.json({
        success: true,
        data: parcel,
      });
    } catch (error) {
      console.error("Error fetching parcel:", error);
      res.status(500).json({
        success: false,
        message: "소포 조회 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 소포 상태별 통계를 조회합니다.
   */
  async getParcelStats(req: Request, res: Response) {
    try {
      const stats = await parcelService.getParcelStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error fetching parcel stats:", error);
      res.status(500).json({
        success: false,
        message: "소포 통계 조회 중 오류가 발생했습니다.",
      });
    }
  }
}
