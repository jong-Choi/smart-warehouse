import { Router } from "express";
import { getMonthlySales, getDailySales } from "../controllers/salesController";
import { SalesController } from "../controllers/salesController";

const router = Router();
const salesController = new SalesController();

/**
 * @swagger
 * /api/sales/monthly:
 *   get:
 *     summary: 월별 매출 통계 조회
 *     tags: [Sales]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: 조회할 연도 (기본값은 현재 연도)
 *     responses:
 *       200:
 *         description: 월별 매출 데이터
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       period:
 *                         type: string
 *                         example: "2024.01"
 *                       unloadCount:
 *                         type: number
 *                         description: 하차물량(운송장 수)
 *                       totalShippingValue:
 *                         type: number
 *                         description: 총 운송가액
 *                       avgShippingValue:
 *                         type: number
 *                         description: 운송장별 평균 운송가액
 *                       normalProcessCount:
 *                         type: number
 *                         description: 정상처리건수
 *                       processValue:
 *                         type: number
 *                         description: 처리가액
 *                       accidentCount:
 *                         type: number
 *                         description: 사고건수
 *                       accidentValue:
 *                         type: number
 *                         description: 사고가액
 *                 meta:
 *                   type: object
 *                   properties:
 *                     year:
 *                       type: number
 *                     totalMonths:
 *                       type: number
 */
router.get("/monthly", getMonthlySales);

/**
 * @swagger
 * /api/sales/daily:
 *   get:
 *     summary: 일별 매출 통계 조회
 *     tags: [Sales]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: 조회할 연도 (기본값은 현재 연도)
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: 조회할 월 (기본값은 현재 월)
 *     responses:
 *       200:
 *         description: 일별 매출 데이터
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       period:
 *                         type: string
 *                         example: "1일"
 *                       unloadCount:
 *                         type: number
 *                         description: 하차물량(운송장 수)
 *                       totalShippingValue:
 *                         type: number
 *                         description: 총 운송가액
 *                       avgShippingValue:
 *                         type: number
 *                         description: 운송장별 평균 운송가액
 *                       normalProcessCount:
 *                         type: number
 *                         description: 정상처리건수
 *                       processValue:
 *                         type: number
 *                         description: 처리가액
 *                       accidentCount:
 *                         type: number
 *                         description: 사고건수
 *                       accidentValue:
 *                         type: number
 *                         description: 사고가액
 *                 meta:
 *                   type: object
 *                   properties:
 *                     year:
 *                       type: number
 *                     month:
 *                       type: number
 *                     totalDays:
 *                       type: number
 */
router.get("/daily", getDailySales);

// 매출 개요 조회
router.get("/overview", salesController.getSalesOverview);

// 지역별 매출 조회
router.get("/location", salesController.getLocationSales);

export default router;
