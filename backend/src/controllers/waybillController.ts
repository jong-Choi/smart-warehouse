import { Request, Response } from "express";
import { WaybillService } from "@services/waybillService";
import { WaybillFilters, WaybillStatus } from "@typings/index";

const waybillService = new WaybillService();

export class WaybillController {
  /**
   * 모든 운송장 목록을 조회합니다.
   */
  async getAllWaybills(req: Request, res: Response) {
    try {
      const filters: WaybillFilters = {};

      // 쿼리 파라미터 파싱
      if (req.query.status) {
        filters.status = req.query.status as WaybillStatus;
      }
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }

      const waybills = await waybillService.getAllWaybills(filters);

      res.json({
        success: true,
        data: waybills,
        count: waybills.length,
      });
    } catch (error) {
      console.error("Error fetching waybills:", error);
      res.status(500).json({
        success: false,
        message: "운송장 목록 조회 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 특정 운송장의 상세 정보를 조회합니다.
   */
  async getWaybillById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "유효하지 않은 운송장 ID입니다.",
        });
      }

      const waybill = await waybillService.getWaybillById(id);

      if (!waybill) {
        return res.status(404).json({
          success: false,
          message: "해당 운송장을 찾을 수 없습니다.",
        });
      }

      res.json({
        success: true,
        data: waybill,
      });
    } catch (error) {
      console.error("Error fetching waybill:", error);
      res.status(500).json({
        success: false,
        message: "운송장 조회 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 운송장 번호로 조회합니다.
   */
  async getWaybillByNumber(req: Request, res: Response) {
    try {
      const { number } = req.params;

      if (!number) {
        return res.status(400).json({
          success: false,
          message: "운송장 번호가 필요합니다.",
        });
      }

      const waybill = await waybillService.getWaybillByNumber(number);

      if (!waybill) {
        return res.status(404).json({
          success: false,
          message: "해당 운송장을 찾을 수 없습니다.",
        });
      }

      res.json({
        success: true,
        data: waybill,
      });
    } catch (error) {
      console.error("Error fetching waybill by number:", error);
      res.status(500).json({
        success: false,
        message: "운송장 조회 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 운송장 상태별 통계를 조회합니다.
   */
  async getWaybillStats(req: Request, res: Response) {
    try {
      const stats = await waybillService.getWaybillStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error fetching waybill stats:", error);
      res.status(500).json({
        success: false,
        message: "운송장 통계 조회 중 오류가 발생했습니다.",
      });
    }
  }
}
