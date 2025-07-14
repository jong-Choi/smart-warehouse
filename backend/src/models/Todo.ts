import { PrismaClient, Todo, Prisma } from "@generated/prisma";

const prisma = new PrismaClient();

export class TodoModel {
  static async findAll() {
    return await prisma.todo.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async findById(id: string) {
    return await prisma.todo.findUnique({
      where: { id },
    });
  }

  static async create(data: Prisma.TodoCreateInput) {
    return await prisma.todo.create({
      data,
    });
  }

  static async update(id: string, data: Prisma.TodoUpdateInput) {
    return await prisma.todo.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return await prisma.todo.delete({
      where: { id },
    });
  }
}
