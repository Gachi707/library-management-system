import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { BorrowStatus, Prisma } from '@prisma/client';
import type { BorrowRequest } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBorrowRequestDto } from './dto/create-borrow-request.dto';
import { UpdateBorrowRequestDto } from './dto/update-borrow-request.dto';
import { calculateFine } from './fine-calculator';

export const LOAN_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

// A patron may only have one open request per book
const OPEN_STATUSES: BorrowStatus[] = [
  BorrowStatus.REQUESTED,
  BorrowStatus.APPROVED,
  BorrowStatus.BORROWED,
  BorrowStatus.OVERDUE,
];

// The only moves a request is allowed to make. A librarian declines a request by moving it to CANCELLED.
export const ALLOWED_TRANSITIONS: Record<BorrowStatus, BorrowStatus[]> = {
  REQUESTED: [BorrowStatus.APPROVED, BorrowStatus.CANCELLED],
  APPROVED: [BorrowStatus.BORROWED, BorrowStatus.CANCELLED],
  BORROWED: [BorrowStatus.RETURNED, BorrowStatus.OVERDUE],
  OVERDUE: [BorrowStatus.RETURNED],
  RETURNED: [],
  CANCELLED: [],
};

// In these states one physical copy is set aside for the patron, so availableCopies is one lower
const HOLDS_A_COPY: BorrowStatus[] = [BorrowStatus.APPROVED, BorrowStatus.BORROWED, BorrowStatus.OVERDUE];

@Injectable()
export class BorrowRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateBorrowRequestDto) {
    const book = await this.prisma.book.findUnique({ where: { id: dto.bookId } });
    if (!book) throw new NotFoundException(`Book ${dto.bookId} not found`);

    const open = await this.prisma.borrowRequest.findFirst({
      where: { userId, bookId: book.id, status: { in: OPEN_STATUSES } },
    });
    if (open) throw new ConflictException('You already have an open request for this book');

    return this.prisma.borrowRequest.create({
      data: { userId, bookId: book.id, bookTitle: book.title, bookAuthor: book.author },
    });
  }

  findMine(userId: number) {
    return this.prisma.borrowRequest.findMany({
      where: { userId },
      orderBy: { requestDate: 'desc' },
    });
  }

  // Librarian view: everyone's requests, optionally only one status
  findAll(status?: BorrowStatus) {
    return this.prisma.borrowRequest.findMany({
      where: status ? { status } : {},
      include: { user: { select: { id: true, email: true } } },
      orderBy: { requestDate: 'desc' },
    });
  }

  // Librarian: move a request to its next status
  async update(id: number, dto: UpdateBorrowRequestDto) {
    const request = await this.prisma.borrowRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException(`Borrow request ${id} not found`);
    return this.transition(request, dto.status, dto.dueDate ? new Date(dto.dueDate) : undefined);
  }

  // Patron: withdraw their own request before the book has been collected
  async cancelOwn(userId: number, id: number) {
    // Someone else's request looks exactly like one that does not exist
    const request = await this.prisma.borrowRequest.findFirst({ where: { id, userId } });
    if (!request) throw new NotFoundException(`Borrow request ${id} not found`);
    if (request.status !== BorrowStatus.REQUESTED && request.status !== BorrowStatus.APPROVED) {
      throw new ConflictException('Only a request that has not been collected yet can be cancelled');
    }
    return this.transition(request, BorrowStatus.CANCELLED);
  }

  private async transition(request: BorrowRequest, target: BorrowStatus, dueDateOverride?: Date) {
    // Malformed input is rejected first (400), whatever state the request is in...
    if (dueDateOverride && target !== BorrowStatus.BORROWED) {
      throw new BadRequestException('dueDate can only be set when marking a request as BORROWED');
    }
    // ...then a well-formed move that this request cannot make right now (409)
    if (!ALLOWED_TRANSITIONS[request.status].includes(target)) {
      throw new ConflictException(`A request that is ${request.status} cannot be changed to ${target}`);
    }

    const now = new Date();
    const data: Prisma.BorrowRequestUpdateManyMutationInput = { status: target };

    if (target === BorrowStatus.BORROWED) {
      data.dueDate = dueDateOverride ?? new Date(now.getTime() + LOAN_DAYS * DAY_MS);
    }
    if (target === BorrowStatus.OVERDUE && (!request.dueDate || request.dueDate.getTime() >= now.getTime())) {
      throw new ConflictException('This request is not past its due date yet');
    }
    if (target === BorrowStatus.RETURNED) {
      data.returnDate = now;
      // The fine is always worked out here, from the stored due date. It is never taken from the client.
      data.fineAmount = request.dueDate ? calculateFine(request.dueDate, now) : 0;
    }

    const copyBefore = HOLDS_A_COPY.includes(request.status);
    const copyAfter = HOLDS_A_COPY.includes(target);

    // All or nothing: the stock change and the status change succeed together or not at all
    return this.prisma.$transaction(async (tx) => {
      if (!copyBefore && copyAfter) {
        // Setting a copy aside. The "greater than 0" condition makes this safe even if two librarians act at once.
        const reserved = await tx.book.updateMany({
          where: { id: request.bookId, availableCopies: { gt: 0 } },
          data: { availableCopies: { decrement: 1 } },
        });
        if (reserved.count === 0) throw new ConflictException('No copies of this book are available right now');
      } else if (copyBefore && !copyAfter) {
        // The copy goes back on the shelf
        await tx.book.update({ where: { id: request.bookId }, data: { availableCopies: { increment: 1 } } });
      }

      // Only change the row if it still has the status we read (guards against two people acting at once)
      const changed = await tx.borrowRequest.updateMany({
        where: { id: request.id, status: request.status },
        data,
      });
      if (changed.count === 0) {
        throw new ConflictException('This request was changed by someone else. Reload and try again.');
      }
      return tx.borrowRequest.findUniqueOrThrow({ where: { id: request.id } });
    });
  }
}
