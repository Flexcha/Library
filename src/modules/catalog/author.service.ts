import { prisma } from '../../config/prisma.ts';
import { NotFoundError } from '../../common/errors/AppError.ts';
import { AuthorInput } from './catalog.schema.ts';

export class AuthorService {
  static async list() {
    return prisma.author.findMany({
      orderBy: { name: 'asc' },
    });
  }

  static async getById(id: number) {
    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        bookAuthors: {
          include: {
            book: true,
          },
        },
      },
    });

    if (!author) {
      throw new NotFoundError(`Author with id ${id} not found`);
    }

    return author;
  }

  static async create(data: AuthorInput) {
    return prisma.author.create({
      data: {
        name: data.name,
        biography: data.biography,
        birthDate: data.birthDate,
        nationality: data.nationality,
      },
    });
  }

  static async update(id: number, data: AuthorInput) {
    await this.getById(id);
    return prisma.author.update({
      where: { id },
      data,
    });
  }

  static async delete(id: number) {
    await this.getById(id);
    await prisma.author.delete({ where: { id } });
    return { message: 'Author deleted successfully' };
  }
}
