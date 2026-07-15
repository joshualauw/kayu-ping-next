import { prisma } from "@/lib/db/prisma";
import { Grade } from "@/generated/prisma/client";
import { GradeWhereInput } from "@/generated/prisma/models";
import { TableQuery, TableResponse } from "@/lib/schemas/table-query";
import { CreateGradeSchema } from "@/lib/schemas/grades/create-grade";
import { getOrderBySort } from "@/lib/helpers/api";
import dayjs from "@/lib/integrations/dayjs";

export type GradeListItem = Grade;
export type GradeForSelect = Pick<Grade, "id" | "name" | "code">;

class GradeService {
  async getAllGrades(params: TableQuery): Promise<TableResponse<GradeListItem>> {
    const { page, size, search, sortBy, sortOrder, startDate, endDate } = params;
    const where: GradeWhereInput = {};

    if (search) {
      where.OR = [{ name: { contains: search, mode: "insensitive" } }, { code: { contains: search, mode: "insensitive" } }];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = dayjs(startDate).toDate();
      }
      if (endDate) {
        where.createdAt.lte = dayjs(endDate).toDate();
      }
    }

    const allowedSortFields = ["name", "code", "createdAt", "updatedAt"];
    const orderBy = getOrderBySort(sortBy, sortOrder, allowedSortFields);

    const [count, items] = await Promise.all([
      prisma.grade.count({ where }),
      prisma.grade.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy,
      }),
    ]);

    return { items, count };
  }

  async getGradesForSelect(): Promise<GradeForSelect[]> {
    return prisma.grade.findMany({
      select: {
        id: true,
        name: true,
        code: true,
      },
    });
  }

  async getGradeById(id: number): Promise<Grade | null> {
    return prisma.grade.findUnique({
      where: { id },
    });
  }

  async checkCodeExists(code: string, excludeId?: number): Promise<boolean> {
    if (excludeId !== undefined) {
      const existing = await prisma.grade.findFirst({
        where: {
          code,
          NOT: { id: excludeId },
        },
      });
      return !!existing;
    } else {
      const existing = await prisma.grade.findUnique({
        where: { code },
      });
      return !!existing;
    }
  }

  async createGrade(data: CreateGradeSchema): Promise<Grade> {
    const codeExists = await this.checkCodeExists(data.code);
    if (codeExists) throw new Error("Grade code already exists");

    return prisma.grade.create({
      data,
    });
  }

  async updateGrade(id: number, data: CreateGradeSchema): Promise<Grade> {
    const codeExists = await this.checkCodeExists(data.code, id);
    if (codeExists) throw new Error("Grade code already exists");

    return prisma.grade.update({
      where: { id },
      data,
    });
  }

  async deleteGrade(id: number): Promise<Grade> {
    return prisma.grade.delete({
      where: { id },
    });
  }
}

export default new GradeService();
