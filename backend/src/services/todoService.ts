import {
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoResponse,
} from "@typings/todo";
import { Todo } from "@generated/prisma";
import { TodoModel } from "@models/Todo";
import { createTodoSchema, updateTodoSchema } from "@utils/validation";

export class TodoService {
  static async getAllTodos(): Promise<TodoResponse[]> {
    const todos = await TodoModel.findAll();
    return todos.map((todo: Todo) => this.mapToResponse(todo));
  }

  static async getTodoById(id: string): Promise<TodoResponse | null> {
    const todo = await TodoModel.findById(id);
    return todo ? this.mapToResponse(todo) : null;
  }

  static async createTodo(data: CreateTodoRequest): Promise<TodoResponse> {
    const validatedData = createTodoSchema.parse(data);

    const todo = await TodoModel.create(validatedData);

    return this.mapToResponse(todo);
  }

  static async updateTodo(
    id: string,
    data: UpdateTodoRequest
  ): Promise<TodoResponse | null> {
    const validatedData = updateTodoSchema.parse(data);

    const updatedTodo = await TodoModel.update(id, validatedData);
    return updatedTodo ? this.mapToResponse(updatedTodo) : null;
  }

  static async deleteTodo(id: string): Promise<boolean> {
    try {
      await TodoModel.delete(id);
      return true;
    } catch (error) {
      return false;
    }
  }

  private static mapToResponse(todo: Todo): TodoResponse {
    return {
      id: todo.id,
      title: todo.title,
      isComplete: todo.isComplete,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
      links: {
        self: `/api/todos/${todo.id}`,
        update: `/api/todos/${todo.id}`,
        delete: `/api/todos/${todo.id}`,
      },
    };
  }
}
