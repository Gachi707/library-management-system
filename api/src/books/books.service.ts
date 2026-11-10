import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  findAll(genreId?: string, search?: string, page = 1, limit = 20) {
    if (genreId !== undefined && Number.isNaN(Number(genreId))) {
      throw new BadRequestException('genreId must be a number');
    }
    const take = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (Math.max(Number(page), 1) - 1) * take;

    return this.prisma.book.findMany({
      // Build the where clause from whichever filters were supplied
      where: {
        ...(genreId && { genreId: Number(genreId) }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { author: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: { genre: true },
      orderBy: { title: 'asc' }, // a stable order keeps pages consistent
      skip, // pagination: skip the earlier pages...
      take, // ...and return one page
    });
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { genre: true },
    });
    if (!book) throw new NotFoundException(`Book ${id} not found`);
    return book;
  }

  async create(dto: CreateBookDto) {
    try {
      return await this.prisma.book.create({
        // a new book starts with every copy available
        data: { ...dto, availableCopies: dto.totalCopies },
        include: { genre: true },
      });
    } catch (e) {
      this.rethrow(e);
    }
  }

  async update(id: number, dto: UpdateBookDto) {
    const book = await this.findOne(id);
    const data: Prisma.BookUncheckedUpdateInput = { ...dto };

    // Keep availableCopies in step when the total changes
    if (dto.totalCopies !== undefined) {
      const available = book.availableCopies + (dto.totalCopies - book.totalCopies);
      if (available < 0) {
        throw new BadRequestException(
          'totalCopies cannot be lower than the number of copies currently borrowed',
        );
      }
      data.availableCopies = available;
    }

    try {
      return await this.prisma.book.update({
        where: { id },
        data,
        include: { genre: true },
      });
    } catch (e) {
      this.rethrow(e);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.book.delete({ where: { id } });
  }

  private rethrow(e: unknown): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') throw new ConflictException('A book with that ISBN already exists');
      if (e.code === 'P2003') throw new BadRequestException('That genreId does not exist');
    }
    throw e;
  }
}
