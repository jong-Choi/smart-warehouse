export interface Todo {
  id: string;
  title: string;
  isComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTodoRequest {
  title: string;
  isComplete?: boolean;
}

export interface UpdateTodoRequest {
  title?: string;
  isComplete?: boolean;
}

export interface TodoResponse {
  id: string;
  title: string;
  isComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
  links: {
    self: string;
    update: string;
    delete: string;
  };
}
