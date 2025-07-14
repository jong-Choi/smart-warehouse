import { Todo, Prisma } from "@generated/prisma";

// Prisma에서 생성한 Todo 타입을 재사용
export type { Todo };

// Prisma 유틸리티 타입 활용
export type CreateTodoRequest = Prisma.TodoCreateInput;
export type UpdateTodoRequest = Prisma.TodoUpdateInput;

// API 응답 타입 (Prisma Todo 타입을 확장)
export interface TodoResponse extends Todo {
  links: {
    self: string;
    update: string;
    delete: string;
  };
}
