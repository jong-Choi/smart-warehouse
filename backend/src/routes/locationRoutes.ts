import { Router } from "express";
import { LocationController } from "@controllers/locationController";

const router = Router();
const locationController = new LocationController();

/**
 * @swagger
 * /api/locations:
 *   get:
 *     summary: 모든 배송지 목록 조회 (페이지네이션 지원)
 *     description: 모든 배송지 목록을 페이지네이션과 함께 조회합니다.
 *     tags: [배송지 (Locations)]
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - $ref: '#/components/parameters/GetAll'
 *     responses:
 *       200:
 *         description: 성공적으로 배송지 목록을 조회했습니다.
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
 *                     $ref: '#/components/schemas/Location'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 */
router.get("/", locationController.getAllLocations);

/**
 * @swagger
 * /api/locations/stats:
 *   get:
 *     summary: 배송지별 통계 조회
 *     description: 배송지별 통계 정보를 조회합니다.
 *     tags: [배송지 (Locations)]
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
 *                     locations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           address:
 *                             type: string
 *                           parcelCount:
 *                             type: integer
 *                           workCount:
 *                             type: integer
 */
router.get("/stats", locationController.getLocationStats);

/**
 * @swagger
 * /api/locations/{locationId}/parcels:
 *   get:
 *     summary: 특정 배송지의 소포 목록 조회
 *     description: 특정 배송지로 전달된 소포 목록을 조회합니다.
 *     tags: [배송지 (Locations)]
 *     parameters:
 *       - name: locationId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: 배송지 ID
 *       - $ref: '#/components/parameters/Limit'
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
 *                 count:
 *                   type: integer
 *                   example: 2
 */
router.get("/:locationId/parcels", locationController.getLocationParcels);

/**
 * @swagger
 * /api/locations/{locationId}/works:
 *   get:
 *     summary: 특정 배송지의 작업 통계 조회
 *     description: 특정 배송지에서 수행된 작업 통계를 조회합니다.
 *     tags: [배송지 (Locations)]
 *     parameters:
 *       - name: locationId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: 배송지 ID
 *       - $ref: '#/components/parameters/StartDate'
 *       - $ref: '#/components/parameters/EndDate'
 *     responses:
 *       200:
 *         description: 성공적으로 작업 통계를 조회했습니다.
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
 *                     $ref: '#/components/schemas/OperatorWork'
 *                 count:
 *                   type: integer
 *                   example: 1
 */
router.get("/:locationId/works", locationController.getLocationWorks);

/**
 * @swagger
 * /api/locations/{id}:
 *   get:
 *     summary: 특정 배송지 상세 조회
 *     description: ID로 특정 배송지의 상세 정보를 조회합니다.
 *     tags: [배송지 (Locations)]
 *     parameters:
 *       - $ref: '#/components/parameters/LocationId'
 *     responses:
 *       200:
 *         description: 성공적으로 배송지 정보를 조회했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Location'
 *       404:
 *         description: 배송지를 찾을 수 없음
 */
router.get("/:id", locationController.getLocationById);

export default router;
