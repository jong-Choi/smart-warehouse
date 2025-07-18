import { Router } from "express";
import { ParcelController } from "@controllers/parcelController";

const router = Router();
const parcelController = new ParcelController();

/**
 * @swagger
 * /api/parcels:
 *   get:
 *     summary: 모든 소포 목록 조회 (페이지네이션 지원)
 *     description: 필터링 옵션과 페이지네이션을 사용하여 소포 목록을 조회합니다.
 *     tags: [소포 (Parcels)]
 *     parameters:
 *       - $ref: '#/components/parameters/ParcelStatus'
 *       - $ref: '#/components/parameters/IsAccident'
 *       - name: operatorId
 *         in: query
 *         schema:
 *           type: integer
 *         description: 작업자 ID 필터
 *       - name: locationId
 *         in: query
 *         schema:
 *           type: integer
 *         description: 배송지 ID 필터
 *       - name: waybillId
 *         in: query
 *         schema:
 *           type: integer
 *         description: 운송장 ID 필터
 *       - $ref: '#/components/parameters/StartDate'
 *       - $ref: '#/components/parameters/EndDate'
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - $ref: '#/components/parameters/GetAll'
 *     responses:
 *       200:
 *         description: 성공적으로 소포 목록을 조회했습니다.
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
 *                     $ref: '#/components/schemas/Parcel'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 소포 목록 조회 중 오류가 발생했습니다.
 */
router.get("/", parcelController.getAllParcels);

/**
 * @swagger
 * /api/parcels/stats:
 *   get:
 *     summary: 소포 상태별 통계 조회
 *     description: 소포의 상태별 통계 정보를 조회합니다.
 *     tags: [소포 (Parcels)]
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
 *                       example: 6
 *                     byStatus:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           status:
 *                             type: string
 *                             example: NORMAL
 *                           count:
 *                             type: integer
 *                             example: 2
 *                     accidentCount:
 *                       type: integer
 *                       example: 2
 */
router.get("/stats", parcelController.getParcelStats);

/**
 * @swagger
 * /api/parcels/{id}:
 *   get:
 *     summary: 특정 소포 상세 조회
 *     description: ID로 특정 소포의 상세 정보를 조회합니다.
 *     tags: [소포 (Parcels)]
 *     parameters:
 *       - $ref: '#/components/parameters/ParcelId'
 *     responses:
 *       200:
 *         description: 성공적으로 소포 정보를 조회했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Parcel'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 유효하지 않은 소포 ID입니다.
 *       404:
 *         description: 소포를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 해당 소포를 찾을 수 없습니다.
 */
router.get("/:id", parcelController.getParcelById);

export default router;
