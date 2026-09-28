import { prisma } from '../../config/prisma.ts';
import { NotFoundError } from '../../common/errors/AppError.ts';
import { PublisherInput } from './catalog.schema.ts';

export class PublisherService {
  static async list() {
    return prisma.publisher.findMany({
      orderBy: { name: 'asc' },
    });
  }

  static async getById(id: number) {
    const publisher = await prisma.publisher.findUnique({
      where: { id },
      include: {
        books: {
          take: 10,
        },
      },
    });

    if (!publisher) {
      throw new NotFoundError(`Publisher with id ${id} not found`);
    }

    return publisher;
  }

  static async create(data: PublisherInput) {
    return prisma.publisher.create({
      data: {
        name: data.name,
        address: data.address,
        website: data.website,
      },
    });
  }

  static async update(id: number, data: PublisherInput) {
    await this.getById(id);
    return prisma.publisher.update({
      where: { id },
      data,
    });
  }

  static async delete(id: number) {
    await this.getById(id);
    await prisma.publisher.delete({ where: { id } });
    return { message: 'Publisher deleted successfully' };
  }
}
