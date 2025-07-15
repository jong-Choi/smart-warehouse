import { Router } from "express";
import { WaybillController } from "@controllers/waybillController";

const router = Router();
const waybillController = new WaybillController();

/**
 * @swagger
 * /api/waybills:
 *   get:
 *     summary: 모든 운송장 목록 조회
 *     description: 필터링 옵션을 사용하여 운송장 목록을 조회합니다.
 *     tags: [운송장 (Waybills)]
 *     parameters:
 *       - $ref: '#/components/parameters/WaybillStatus'
 *       - $ref: '#/components/parameters/StartDate'
 *       - $ref: '#/components/parameters/EndDate'
 *     responses:
 *       200:
 *         description: 성공적으로 운송장 목록을 조회했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Waybill'
 *                 count:
 *                   type: integer
 *                   example: 4
 */
router.get("/", waybillController.getAllWaybills);

/**
 * @swagger
 * /api/waybills/stats:
 *   get:
 *     summary: 운송장 상태별 통계 조회
 *     description: 운송장의 상태별 통계 정보를 조회합니다.
 *     tags: [운송장 (Waybills)]
 *     responses:
 *       200:
 *         description: 성공적으로 통계를 조회했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 4
 *                     byStatus:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           status:
 *                             type: string
 *                             example: DELIVERED
 *                           count:
 *                             type: integer
 *                             example: 1
 */
router.get("/stats", waybillController.getWaybillStats);

/**
 * @swagger
 * /api/waybills/number/{number}:
 *   get:
 *     summary: 운송장 번호로 조회
 *     description: 운송장 번호로 특정 운송장을 조회합니다.
 *     tags: [운송장 (Waybills)]
 *     parameters:
 *       - name: number
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: 운송장 번호
 *     responses:
 *       200:
 *         description: 성공적으로 운송장을 조회했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Waybill'
 *       404:
 *         description: 운송장을 찾을 수 없음
 */
router.get("/number/:number", waybillController.getWaybillByNumber);

/**
 * @swagger
 * /api/waybills/{id}:
 *   get:
 *     summary: 특정 운송장 상세 조회
 *     description: ID로 특정 운송장의 상세 정보를 조회합니다.
 *     tags: [운송장 (Waybills)]
 *     parameters:
 *       - $ref: '#/components/parameters/WaybillId'
 *     responses:
 *       200:
 *         description: 성공적으로 운송장 정보를 조회했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Waybill'
 *       404:
 *         description: 운송장을 찾을 수 없음
 */
router.get("/:id", waybillController.getWaybillById);

export default router;
