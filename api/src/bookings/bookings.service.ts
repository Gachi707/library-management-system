import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import type { AuthUser } from '../auth/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

// "2026-02-30" matches the YYYY-MM-DD shape but is not a real day
function isRealDate(value: string): boolean {
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  findSpaces() {
    return this.prisma.space.findMany({ orderBy: { id: 'asc' } });
  }

  async create(userId: number, dto: CreateBookingDto) {
    if (dto.endTime <= dto.startTime) {
      throw new BadRequestException('The end time must be after the start time');
    }
    if (!isRealDate(dto.date)) {
      throw new BadRequestException('date is not a real calendar date');
    }
    if (dto.date < new Date().toISOString().slice(0, 10)) {
      throw new BadRequestException('The date cannot be in the past');
    }

    const space = await this.prisma.space.findUnique({ where: { id: dto.spaceId } });
    if (!space) throw new NotFoundException(`Space ${dto.spaceId} not found`);

    try {
      // Serializable makes the database treat concurrent bookings as if they ran one after another,
      // so two people cannot both pass the check below and then both book the same slot.
      return await this.prisma.$transaction(
        async (tx) => {
          // Two time ranges overlap exactly when each one starts before the other ends.
          // A booking that ends at 12:00 does NOT clash with one that starts at 12:00.
          const clash = await tx.booking.findFirst({
            where: {
              spaceId: dto.spaceId,
              date: dto.date,
              status: BookingStatus.CONFIRMED, // cancelled bookings no longer block the slot
              startTime: { lt: dto.endTime },
              endTime: { gt: dto.startTime },
            },
          });
          if (clash) throw new ConflictException('This space is already booked for that time');

          return tx.booking.create({
            data: {
              userId, // from the verified token, never from the request body
              spaceId: dto.spaceId,
              date: dto.date,
              startTime: dto.startTime,
              endTime: dto.endTime,
            },
            include: { space: true },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (e) {
      // Two people booked at the same instant and the database made one of them back off
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2034') {
        throw new ConflictException('Someone else booked this space at the same moment. Please try again.');
      }
      throw e;
    }
  }

  findMine(userId: number) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: { space: true },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  // Librarian view: every booking, optionally for one day
  findAll(date?: string) {
    return this.prisma.booking.findMany({
      where: date ? { date } : {},
      include: { space: true, user: { select: { id: true, email: true } } },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  // A patron can cancel their own booking; a librarian can cancel any
  async cancel(user: AuthUser, id: number) {
    const booking = await this.prisma.booking.findFirst({
      where: user.role === 'LIBRARIAN' ? { id } : { id, userId: user.userId },
    });
    if (!booking) throw new NotFoundException(`Booking ${id} not found`);
    if (booking.status === BookingStatus.CANCELLED) {
      throw new ConflictException('This booking is already cancelled');
    }
    return this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
      include: { space: true },
    });
  }
}
