import { Request, Response } from "express";
import { WaybillService } from "@services/waybillService";
import { WaybillFilters } from "@typings/index";
import { parsePaginationQuery } from "@utils/queryParser";

const waybillService = new WaybillService();

export class WaybillController {
  /**
   * 모든 운송장 목록을 조회합니다. (페이지네이션 지원)
   */
  async getAllWaybills(req: Request, res: Response) {
    try {
      const filters: WaybillFilters = {};

      // 쿼리 파라미터 파싱
      if (req.query.search) {
        filters.search = req.query.search as string;
      }
      if (req.query.status) {
        filters.status = req.query.status as
          | "PENDING_UNLOAD"
          | "UNLOADED"
          | "NORMAL"
          | "ACCIDENT";
      }
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }
      if (req.query.date) {
        const date = new Date(req.query.date as string);
        filters.startDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        );
        filters.endDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + 1
        );
      }

      // 페이지네이션 파라미터 파싱
      const pagination = parsePaginationQuery(req.query);

      const result = await waybillService.getAllWaybills(filters, pagination);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
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

  /**
   * 운송장 달력 데이터를 조회합니다.
   */
  async getWaybillCalendarData(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      let start: Date | undefined;
      let end: Date | undefined;

      if (startDate) {
        start = new Date(startDate as string);
      }
      if (endDate) {
        end = new Date(endDate as string);
        // 종료 날짜를 포함하기 위해 하루를 더합니다
        end.setDate(end.getDate() + 1);
      }

      const calendarData = await waybillService.getWaybillCalendarData(
        start,
        end
      );

      res.json({
        success: true,
        data: calendarData,
      });
    } catch (error) {
      console.error("Error fetching waybill calendar data:", error);
      res.status(500).json({
        success: false,
        message: "운송장 달력 데이터 조회 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 지역별 운송장 통계를 조회합니다.
   */
  async getWaybillsByLocationStats(req: Request, res: Response) {
    try {
      const filters: WaybillFilters = {};

      // 쿼리 파라미터 파싱
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }

      const stats = await waybillService.getWaybillsByLocationStats(filters);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error fetching waybills by location stats:", error);
      res.status(500).json({
        success: false,
        message: "지역별 운송장 통계 조회 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 특정 지역의 운송장 목록을 조회합니다.
   */
  async getWaybillsByLocation(req: Request, res: Response) {
    try {
      const locationId = parseInt(req.params.locationId);

      if (isNaN(locationId)) {
        return res.status(400).json({
          success: false,
          message: "유효하지 않은 지역 ID입니다.",
        });
      }

      const filters: WaybillFilters = {};

      // 쿼리 파라미터 파싱
      if (req.query.search) {
        filters.search = req.query.search as string;
      }
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }

      // 페이지네이션 파라미터 파싱
      const pagination = parsePaginationQuery(req.query);

      const result = await waybillService.getWaybillsByLocation(
        locationId,
        filters,
        pagination
      );

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Error fetching waybills by location:", error);
      res.status(500).json({
        success: false,
        message: "지역별 운송장 목록 조회 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 지역별 운송장 달력 데이터를 조회합니다.
   */
  async getWaybillsByLocationCalendarData(req: Request, res: Response) {
    try {
      const filters: WaybillFilters = {};

      // 쿼리 파라미터 파싱
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }

      const calendarData =
        await waybillService.getWaybillsByLocationCalendarData(filters);

      res.json({
        success: true,
        data: calendarData,
      });
    } catch (error) {
      console.error(
        "Error fetching waybills by location calendar data:",
        error
      );
      res.status(500).json({
        success: false,
        message: "지역별 운송장 달력 데이터 조회 중 오류가 발생했습니다.",
      });
    }
  }
}
