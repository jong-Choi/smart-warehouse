import { Request, Response } from "express";
import { SalesService } from "../services/salesService";

const salesService = new SalesService();

/**
 * 월별 매출 통계 조회
 * GET /api/sales/monthly?year=2024
 */
export const getMonthlySales = async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();

    const salesData = await salesService.getMonthlySales(year);

    res.json({
      success: true,
      data: salesData,
      meta: {
        year,
        totalMonths: salesData.length,
      },
    });
  } catch (error) {
    console.error("Error fetching monthly sales:", error);
    res.status(500).json({
      success: false,
      message: "월별 매출 데이터를 가져오는 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * 일별 매출 통계 조회
 * GET /api/sales/daily?year=2024&month=1
 */
export const getDailySales = async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const month =
      parseInt(req.query.month as string) || new Date().getMonth() + 1;

    if (month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        message: "월은 1부터 12 사이의 값이어야 합니다.",
      });
    }

    const salesData = await salesService.getDailySales(year, month);

    res.json({
      success: true,
      data: salesData,
      meta: {
        year,
        month,
        totalDays: salesData.length,
      },
    });
  } catch (error) {
    console.error("Error fetching daily sales:", error);
    res.status(500).json({
      success: false,
      message: "일별 매출 데이터를 가져오는 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export class SalesController {
  /**
   * 매출 개요 데이터를 조회합니다.
   */
  async getSalesOverview(req: Request, res: Response) {
    try {
      const year =
        parseInt(req.query.year as string) || new Date().getFullYear();
      const salesService = new SalesService();
      const overviewData = await salesService.getSalesOverview(year);

      res.json({
        success: true,
        data: overviewData,
      });
    } catch (error) {
      console.error("Error fetching sales overview:", error);
      res.status(500).json({
        success: false,
        message: "매출 개요 데이터를 불러오는데 실패했습니다.",
      });
    }
  }

  /**
   * 지역별 매출 데이터를 조회합니다.
   */
  async getLocationSales(req: Request, res: Response) {
    try {
      const year =
        parseInt(req.query.year as string) || new Date().getFullYear();
      const salesService = new SalesService();
      const locationData = await salesService.getLocationSales(year);

      res.json({
        success: true,
        data: locationData,
      });
    } catch (error) {
      console.error("Error fetching location sales:", error);
      res.status(500).json({
        success: false,
        message: "지역별 매출 데이터를 불러오는데 실패했습니다.",
      });
    }
  }
}
