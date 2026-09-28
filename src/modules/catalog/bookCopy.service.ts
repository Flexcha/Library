import { prisma } from '../../config/prisma.ts';
import { NotFoundError, ConflictError } from '../../common/errors/AppError.ts';
import { BookCopyInput, UpdateCopyStatusInput } from './catalog.schema.ts';

export class BookCopyService {
  static async listByBook(bookId: number, isStaff = false) {
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      throw new NotFoundError(`Book with id ${bookId} not found`);
    }

    const copies = await prisma.bookCopy.findMany({
      where: { bookId },
      orderBy: { id: 'asc' },
    });

    if (!isStaff) {
      // Return limited fields for public
      return copies.map((copy) => ({
        id: copy.id,
        copyCode: copy.copyCode,
        status: copy.status,
        shelfLocation: copy.shelfLocation,
      }));
    }

    return copies;
  }

  static async getById(id: number) {
    const copy = await prisma.bookCopy.findUnique({
      where: { id },
      include: {
        book: true,
      },
    });

    if (!copy) {
      throw new NotFoundError(`Book copy with id ${id} not found`);
    }

    return copy;
  }

  static async addCopy(bookId: number, data: BookCopyInput) {
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      throw new NotFoundError(`Book with id ${bookId} not found`);
    }

    const existing = await prisma.bookCopy.findUnique({
      where: { copyCode: data.copyCode },
    });

    if (existing) {
      throw new ConflictError('A copy with this copy code already exists', 'DUPLICATE_COPY_CODE');
    }

    return prisma.bookCopy.create({
      data: {
        bookId,
        copyCode: data.copyCode,
        shelfLocation: data.shelfLocation,
        acquisitionDate: data.acquisitionDate || new Date().toISOString().split('T')[0],
        status: 'AVAILABLE',
      },
    });
  }

  static async updateStatus(id: number, data: UpdateCopyStatusInput) {
    await this.getById(id);

    return prisma.bookCopy.update({
      where: { id },
      data: { status: data.status },
    });
  }

  static async markBorrowed(id: number, tx: any = prisma) {
    return tx.bookCopy.update({
      where: { id },
      data: { status: 'BORROWED' },
    });
  }

  static async markAvailable(id: number, tx: any = prisma) {
    return tx.bookCopy.update({
      where: { id },
      data: { status: 'AVAILABLE' },
    });
  }

  static async markReserved(id: number, tx: any = prisma) {
    return tx.bookCopy.update({
      where: { id },
      data: { status: 'RESERVED' },
    });
  }
}
