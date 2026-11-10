import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Injectable()
export class GenresService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateGenreDto) {
    try {
      return await this.prisma.genre.create({ data: dto });
    } catch (e) {
      this.rethrow(e);
    }
  }

  findAll() {
    return this.prisma.genre.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: number) {
    const genre = await this.prisma.genre.findUnique({
      where: { id },
      include: { _count: { select: { books: true } } },
    });
    if (!genre) throw new NotFoundException(`Genre ${id} not found`);
    return genre;
  }

  async update(id: number, dto: UpdateGenreDto) {
    await this.findOne(id);
    try {
      return await this.prisma.genre.update({ where: { id }, data: dto });
    } catch (e) {
      this.rethrow(e);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    const inUse = await this.prisma.book.count({ where: { genreId: id } });
    if (inUse > 0) {
      throw new ConflictException(`Genre ${id} still has ${inUse} book(s)`);
    }
    return this.prisma.genre.delete({ where: { id } });
  }

  private rethrow(e: unknown): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new ConflictException('A genre with that name or slug already exists');
    }
    throw e;
  }
}
