import { Request, Response } from "express";
import { TodoService } from "@services/todoService";
import { CreateTodoRequest, UpdateTodoRequest } from "@typings/todo";

export class TodoController {
  static async getAllTodos(req: Request, res: Response): Promise<void> {
    try {
      const todos = await TodoService.getAllTodos();
      res.status(200).json({
        success: true,
        data: todos,
        message: "Todos retrieved successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve todos",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async getTodoById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const todo = await TodoService.getTodoById(id);

      if (!todo) {
        res.status(404).json({
          success: false,
          message: "Todo not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: todo,
        message: "Todo retrieved successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve todo",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async createTodo(req: Request, res: Response): Promise<void> {
    try {
      const todoData: CreateTodoRequest = req.body;
      const todo = await TodoService.createTodo(todoData);

      res.status(201).json({
        success: true,
        data: todo,
        message: "Todo created successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        res.status(400).json({
          success: false,
          message: "Validation error",
          error: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Failed to create todo",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async updateTodo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateTodoRequest = req.body;
      const todo = await TodoService.updateTodo(id, updateData);

      if (!todo) {
        res.status(404).json({
          success: false,
          message: "Todo not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: todo,
        message: "Todo updated successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        res.status(400).json({
          success: false,
          message: "Validation error",
          error: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Failed to update todo",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async deleteTodo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await TodoService.deleteTodo(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Todo not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Todo deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete todo",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
