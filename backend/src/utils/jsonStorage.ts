import jsonfile from "jsonfile";
import path from "path";
import { Todo } from "@typings/todo";

const DATA_FILE_PATH = path.join(process.cwd(), "data/todos.json");

export class JsonStorage {
  private static async ensureDataFile(): Promise<void> {
    try {
      await jsonfile.readFile(DATA_FILE_PATH);
    } catch (error) {
      // 파일이 없으면 빈 배열로 생성
      await jsonfile.writeFile(DATA_FILE_PATH, []);
    }
  }

  static async readTodos(): Promise<Todo[]> {
    await this.ensureDataFile();
    return await jsonfile.readFile(DATA_FILE_PATH);
  }

  static async writeTodos(todos: Todo[]): Promise<void> {
    await jsonfile.writeFile(DATA_FILE_PATH, todos, { spaces: 2 });
  }

  static async findTodoById(id: string): Promise<Todo | undefined> {
    const todos = await this.readTodos();
    return todos.find((todo) => todo.id === id);
  }

  static async addTodo(todo: Todo): Promise<void> {
    const todos = await this.readTodos();
    todos.push(todo);
    await this.writeTodos(todos);
  }

  static async updateTodo(
    id: string,
    updates: Partial<Todo>
  ): Promise<Todo | null> {
    const todos = await this.readTodos();
    const index = todos.findIndex((todo) => todo.id === id);

    if (index === -1) {
      return null;
    }

    todos[index] = { ...todos[index], ...updates, updatedAt: new Date() };
    await this.writeTodos(todos);
    return todos[index];
  }

  static async deleteTodo(id: string): Promise<boolean> {
    const todos = await this.readTodos();
    const filteredTodos = todos.filter((todo) => todo.id !== id);

    if (filteredTodos.length === todos.length) {
      return false; // 삭제할 항목이 없음
    }

    await this.writeTodos(filteredTodos);
    return true;
  }
}
