import { Router } from "express";
import { OperatorController } from "../controllers/operatorController";

const router = Router();
const operatorController = new OperatorController();

// 모든 작업자 목록 조회 (필터링 가능)
router.get("/", operatorController.getAllOperators);

// 작업자별 통계 조회
router.get("/stats", operatorController.getOperatorStats);

// 작업자 코드로 조회
router.get("/code/:code", operatorController.getOperatorByCode);

// 작업자의 근무 기록 조회
router.get("/:operatorId/shifts", operatorController.getOperatorShifts);

// 작업자의 작업 통계 조회
router.get("/:operatorId/works", operatorController.getOperatorWorks);

// 특정 작업자 상세 조회
router.get("/:id", operatorController.getOperatorById);

export default router;
