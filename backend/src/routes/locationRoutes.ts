import { Router } from "express";
import { LocationController } from "../controllers/locationController";

const router = Router();
const locationController = new LocationController();

// 모든 배송지 목록 조회
router.get("/", locationController.getAllLocations);

// 배송지별 통계 조회
router.get("/stats", locationController.getLocationStats);

// 특정 배송지의 소포 목록 조회
router.get("/:locationId/parcels", locationController.getLocationParcels);

// 특정 배송지의 작업 통계 조회
router.get("/:locationId/works", locationController.getLocationWorks);

// 특정 배송지 상세 조회
router.get("/:id", locationController.getLocationById);

export default router;
