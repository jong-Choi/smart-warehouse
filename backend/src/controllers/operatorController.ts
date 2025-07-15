import { Request, Response } from "express";
import { OperatorService, OperatorFilters } from "../services/operatorService";

const operatorService = new OperatorService();

export class OperatorController {
  /**
   * 모든 작업자 목록을 조회합니다.
   */
  async getAllOperators(req: Request, res: Response) {
    try {
      const filters: OperatorFilters = {};

      // 쿼리 파라미터 파싱
      if (req.query.type) {
        filters.type = req.query.type as any;
      }
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }

      const operators = await operatorService.getAllOperators(filters);

      res.json({
        success: true,
        data: operators,
        count: operators.length,
      });
    } catch (error) {
      console.error("Error fetching operators:", error);
      res.status(500).json({
        success: false,
        message: "작업자 목록 조회 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 특정 작업자의 상세 정보를 조회합니다.
   */
  async getOperatorById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "유효하지 않은 작업자 ID입니다.",
        });
      }

      const operator = await operatorService.getOperatorById(id);

      if (!operator) {
        return res.status(404).json({
          success: false,
          message: "해당 작업자를 찾을 수 없습니다.",
        });
      }

      res.json({
        success: true,
        data: operator,
      });
    } catch (error) {
      console.error("Error fetching operator:", error);
      res.status(500).json({
        success: false,
        message: "작업자 조회 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 작업자 코드로 조회합니다.
   */
  async getOperatorByCode(req: Request, res: Response) {
    try {
      const { code } = req.params;

      if (!code) {
        return res.status(400).json({
          success: false,
          message: "작업자 코드가 필요합니다.",
        });
      }

      const operator = await operatorService.getOperatorByCode(code);

      if (!operator) {
        return res.status(404).json({
          success: false,
          message: "해당 작업자를 찾을 수 없습니다.",
        });
      }

      res.json({
        success: true,
        data: operator,
      });
    } catch (error) {
      console.error("Error fetching operator by code:", error);
      res.status(500).json({
        success: false,
        message: "작업자 조회 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 작업자별 통계를 조회합니다.
   */
  async getOperatorStats(req: Request, res: Response) {
    try {
      const stats = await operatorService.getOperatorStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error fetching operator stats:", error);
      res.status(500).json({
        success: false,
        message: "작업자 통계 조회 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 작업자의 근무 기록을 조회합니다.
   */
  async getOperatorShifts(req: Request, res: Response) {
    try {
      const operatorId = parseInt(req.params.operatorId);

      if (isNaN(operatorId)) {
        return res.status(400).json({
          success: false,
          message: "유효하지 않은 작업자 ID입니다.",
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

      const shifts = await operatorService.getOperatorShifts(
        operatorId,
        startDate,
        endDate
      );

      res.json({
        success: true,
        data: shifts,
        count: shifts.length,
      });
    } catch (error) {
      console.error("Error fetching operator shifts:", error);
      res.status(500).json({
        success: false,
        message: "근무 기록 조회 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 작업자의 작업 통계를 조회합니다.
   */
  async getOperatorWorks(req: Request, res: Response) {
    try {
      const operatorId = parseInt(req.params.operatorId);

      if (isNaN(operatorId)) {
        return res.status(400).json({
          success: false,
          message: "유효하지 않은 작업자 ID입니다.",
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

      const works = await operatorService.getOperatorWorks(
        operatorId,
        startDate,
        endDate
      );

      res.json({
        success: true,
        data: works,
        count: works.length,
      });
    } catch (error) {
      console.error("Error fetching operator works:", error);
      res.status(500).json({
        success: false,
        message: "작업 통계 조회 중 오류가 발생했습니다.",
      });
    }
  }
}
