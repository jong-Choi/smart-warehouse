import { Router } from "express";
import { WaybillController } from "../controllers/waybillController";

const router = Router();
const waybillController = new WaybillController();

// 모든 운송장 목록 조회 (필터링 가능)
router.get("/", waybillController.getAllWaybills);

// 운송장 상태별 통계 조회
router.get("/stats", waybillController.getWaybillStats);

// 운송장 번호로 조회
router.get("/number/:number", waybillController.getWaybillByNumber);

// 특정 운송장 상세 조회
router.get("/:id", waybillController.getWaybillById);

export default router;
