import { prisma } from '../../config/prisma.ts';
import { NotFoundError } from '../../common/errors/AppError.ts';
import { CategoryInput } from './catalog.schema.ts';

export class CategoryService {
  static async list() {
    return prisma.category.findMany({
      include: {
        parentCategory: true,
        subCategories: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  static async getById(id: number) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parentCategory: true,
        subCategories: true,
        books: {
          take: 10,
        },
      },
    });

    if (!category) {
      throw new NotFoundError(`Category with id ${id} not found`);
    }

    return category;
  }

  static async create(data: CategoryInput) {
    return prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
        parentCategoryId: data.parentCategoryId || null,
      },
    });
  }

  static async update(id: number, data: CategoryInput) {
    await this.getById(id);
    return prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        parentCategoryId: data.parentCategoryId !== undefined ? data.parentCategoryId : undefined,
      },
    });
  }

  static async delete(id: number) {
    await this.getById(id);
    await prisma.category.delete({ where: { id } });
    return { message: 'Category deleted successfully' };
  }
}
