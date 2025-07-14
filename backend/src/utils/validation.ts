import { z } from "zod";

export const createTodoSchema = z.object({
  title: z
    .string({ message: "Title is required" })
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be less than 100 characters"),
  isComplete: z.boolean().optional().default(false),
});

export const updateTodoSchema = z.object({
  title: z
    .string({ message: "Title is required" })
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be less than 100 characters")
    .optional(),
  isComplete: z.boolean().optional(),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
