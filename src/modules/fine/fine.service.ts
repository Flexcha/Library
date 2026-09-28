import { prisma } from '../../config/prisma.ts';
import { NotFoundError, ConflictError } from '../../common/errors/AppError.ts';
import { parsePagination, toPageResponse } from '../../common/pagination.ts';

export class FineService {
  static async listFines(query: any, currentUser: { id: number; role: string }) {
    const { skip, take, page, size, orderBy } = parsePagination(query, 'issuedDate', 'desc');

    const where: any = {};

    if (currentUser.role === 'MEMBER') {
      where.memberId = currentUser.id;
    } else if (query.memberId) {
      where.memberId = parseInt(query.memberId, 10);
    }

    if (query.status) {
      where.status = query.status;
    }

    const [total, fines] = await Promise.all([
      prisma.fine.count({ where }),
      prisma.fine.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          member: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          loan: {
            include: {
              bookCopy: {
                include: {
                  book: {
                    select: {
                      id: true,
                      title: true,
                      isbn: true,
                    },
                  },
                },
              },
            },
          },
          waivedUser: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      }),
    ]);

    return toPageResponse(fines, total, page, size);
  }

  static async payFine(fineId: number) {
    const fine = await prisma.fine.findUnique({ where: { id: fineId } });
    if (!fine) {
      throw new NotFoundError(`Fine with id ${fineId} not found`);
    }

    if (fine.status !== 'UNPAID') {
      throw new ConflictError(`Fine is already ${fine.status.toLowerCase()}`, 'FINE_ALREADY_SETTLED');
    }

    const today = new Date().toISOString().split('T')[0];

    const updated = await prisma.fine.update({
      where: { id: fineId },
      data: {
        status: 'PAID',
        paidDate: today,
      },
    });

    return updated;
  }

  static async waiveFine(fineId: number, adminUserId: number, _reason?: string) {
    const fine = await prisma.fine.findUnique({ where: { id: fineId } });
    if (!fine) {
      throw new NotFoundError(`Fine with id ${fineId} not found`);
    }

    if (fine.status !== 'UNPAID') {
      throw new ConflictError(`Fine is already ${fine.status.toLowerCase()}`, 'FINE_ALREADY_SETTLED');
    }

    const updated = await prisma.fine.update({
      where: { id: fineId },
      data: {
        status: 'WAIVED',
        waivedBy: adminUserId,
      },
    });

    return updated;
  }
}
