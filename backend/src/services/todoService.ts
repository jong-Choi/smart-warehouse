import {
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoResponse,
} from "@typings/todo";
import { JsonStorage } from "@utils/jsonStorage";
import { createTodoSchema, updateTodoSchema } from "@utils/validation";

export class TodoService {
  static async getAllTodos(): Promise<TodoResponse[]> {
    const todos = await JsonStorage.readTodos();
    return todos.map((todo) => this.mapToResponse(todo));
  }

  static async getTodoById(id: string): Promise<TodoResponse | null> {
    const todo = await JsonStorage.findTodoById(id);
    return todo ? this.mapToResponse(todo) : null;
  }

  static async createTodo(data: CreateTodoRequest): Promise<TodoResponse> {
    const validatedData = createTodoSchema.parse(data);

    const todo: Todo = {
      id: this.generateId(),
      title: validatedData.title,
      isComplete: validatedData.isComplete || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await JsonStorage.addTodo(todo);
    return this.mapToResponse(todo);
  }

  static async updateTodo(
    id: string,
    data: UpdateTodoRequest
  ): Promise<TodoResponse | null> {
    const validatedData = updateTodoSchema.parse(data);

    const updatedTodo = await JsonStorage.updateTodo(id, validatedData);
    return updatedTodo ? this.mapToResponse(updatedTodo) : null;
  }

  static async deleteTodo(id: string): Promise<boolean> {
    return await JsonStorage.deleteTodo(id);
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
