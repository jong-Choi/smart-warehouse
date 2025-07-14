import { Router } from "express";
import { TodoController } from "@controllers/todoController";

const router = Router();

// GET /api/todos - 모든 할 일 조회
router.get("/", TodoController.getAllTodos);

// GET /api/todos/:id - 특정 할 일 조회
router.get("/:id", TodoController.getTodoById);

// POST /api/todos - 새 할 일 생성
router.post("/", TodoController.createTodo);

// PATCH /api/todos/:id - 할 일 수정
router.patch("/:id", TodoController.updateTodo);

// DELETE /api/todos/:id - 할 일 삭제
router.delete("/:id", TodoController.deleteTodo);

export default router;
