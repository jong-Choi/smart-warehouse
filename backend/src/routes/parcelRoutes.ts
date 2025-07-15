import { Router } from "express";
import { ParcelController } from "../controllers/parcelController";

const router = Router();
const parcelController = new ParcelController();

// 모든 소포 목록 조회 (필터링 가능)
router.get("/", parcelController.getAllParcels);

// 소포 상태별 통계 조회
router.get("/stats", parcelController.getParcelStats);

// 특정 소포 상세 조회
router.get("/:id", parcelController.getParcelById);

export default router;
