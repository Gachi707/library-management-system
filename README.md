# Library Management System

A full-stack library management system built with React, NestJS, PostgreSQL and Prisma. This repository currently contains the backend (Weeks 1 and 2): the database schema, the Prisma service, seed data, CRUD APIs for books and genres with validation, JWT authentication and role-based authorization.

## Project Structure

```
library-management-system/
├── api/                      # NestJS backend
│   ├── prisma/               # schema.prisma, seed.ts, migrations/
│   └── src/
│       ├── prisma/           # PrismaService and PrismaModule
│       ├── genres/           # Genre CRUD
│       ├── books/            # Book CRUD, search, filtering, pagination
│       └── auth/             # Register/login, JWT strategy, roles guard
├── docs/
│   └── postman_collection.json
├── scripts/                  # README generator
└── README.md
```

## Setup (api)

1. `cd api && npm install`
2. Copy `.env.example` to `.env` and set your own `DATABASE_URL` and `JWT_SECRET`
3. `npx prisma migrate dev`
4. `npx prisma db seed`
5. `npm run start:dev`

## API (Week 2)

Base URL: `http://localhost:3000`

- Public: `GET /books` (supports `genreId`, `search`, `page`, `limit`), `GET /books/:id`, `GET /genres`, `GET /genres/:id`
- Librarian only: `POST`, `PATCH` and `DELETE` on `/books` and `/genres`
- Auth: `POST /auth/register`, `POST /auth/login` (returns an access_token, sent as `Authorization: Bearer <token>`)

Seeded dev librarian: `librarian@library.test` / `Librarian123!`. Import `docs/postman_collection.json` to try every endpoint.

## Schema Decisions

### Why Book references Genre instead of embedding it

Each Book stores a `genreId` foreign key that points to a row in the Genre table, rather than storing the genre name as text inside every book.

If the genre name were stored directly on each book, renaming a genre such as "Science Fiction" to "Sci-Fi" would mean updating every book that uses the old name. If even one record were missed, the database would hold inconsistent names for the same category. It would also repeat the same genre name across many book records.

Keeping genres in their own table and linking to them through `genreId` means the name is stored once. Renaming a genre is a single update, and every book reflects it automatically. Since `slug` also lives on Genre, it is updated in that same single row.

### What the foreign key protects

Because `genreId` is a foreign key, PostgreSQL will not allow a book to reference a genre that does not exist. For example, if a book is created with `genreId = 15` and no genre with ID 15 exists, the database rejects the operation.

It also protects existing relationships: a genre that is still used by books cannot simply be deleted unless the deletion rules allow it. This keeps the data reliable, since every book is always connected to a valid genre.

### Why `totalCopies` and `availableCopies` are separate

The two fields represent different things:

- `totalCopies` is how many physical copies of a book the library owns.
- `availableCopies` is how many of those copies can currently be borrowed.

For example, if the library owns 10 copies of *Things Fall Apart* and 4 are borrowed, `totalCopies` stays at 10 while `availableCopies` becomes 6.

Keeping both values lets the system track the whole collection without confusing borrowed books with missing stock. It also makes it simple to check that a copy is available before approving a borrow request.

The schema only stores these numbers. It does not stop `availableCopies` from exceeding `totalCopies` or going below zero, so the borrowing logic in a later week will need to keep them consistent.

### Users and roles

The User model has a `Role` enum with two values, `PATRON` and `LIBRARIAN`, defaulting to `PATRON`. The `RolesGuard` uses this role to restrict creating, updating and deleting books and genres to librarians.

<!-- REQUIRED-FILES:START -->
## Required Files

_Generated from the real files by `scripts/update-readme.sh`._

| File | Link |
|---|---|
| `api/prisma/schema.prisma` | [view](https://github.com/Gachi707/library-management-system/blob/main/api/prisma/schema.prisma) |
| `api/prisma/seed.ts` | [view](https://github.com/Gachi707/library-management-system/blob/main/api/prisma/seed.ts) |
| `api/src/prisma/prisma.service.ts` | [view](https://github.com/Gachi707/library-management-system/blob/main/api/src/prisma/prisma.service.ts) |
| `api/.env.example` | [view](https://github.com/Gachi707/library-management-system/blob/main/api/.env.example) |
| `api/prisma/migrations/20261108133914_init/migration.sql` | [view](https://github.com/Gachi707/library-management-system/blob/main/api/prisma/migrations/20261108133914_init/migration.sql) |
| `api/src/main.ts` | [view](https://github.com/Gachi707/library-management-system/blob/main/api/src/main.ts) |
| `api/src/genres/genres.controller.ts` | [view](https://github.com/Gachi707/library-management-system/blob/main/api/src/genres/genres.controller.ts) |
| `api/src/genres/genres.service.ts` | [view](https://github.com/Gachi707/library-management-system/blob/main/api/src/genres/genres.service.ts) |
| `api/src/genres/genres.module.ts` | [view](https://github.com/Gachi707/library-management-system/blob/main/api/src/genres/genres.module.ts) |
| `api/src/books/dto/create-book.dto.ts` | [view](https://github.com/Gachi707/library-management-system/blob/main/api/src/books/dto/create-book.dto.ts) |
| `api/src/books/books.controller.ts` | [view](https://github.com/Gachi707/library-management-system/blob/main/api/src/books/books.controller.ts) |
| `api/src/books/books.service.ts` | [view](https://github.com/Gachi707/library-management-system/blob/main/api/src/books/books.service.ts) |
| `api/src/auth/auth.controller.ts` | [view](https://github.com/Gachi707/library-management-system/blob/main/api/src/auth/auth.controller.ts) |
| `api/src/auth/auth.service.ts` | [view](https://github.com/Gachi707/library-management-system/blob/main/api/src/auth/auth.service.ts) |
| `api/src/auth/auth.module.ts` | [view](https://github.com/Gachi707/library-management-system/blob/main/api/src/auth/auth.module.ts) |
| `api/src/auth/jwt.strategy.ts` | [view](https://github.com/Gachi707/library-management-system/blob/main/api/src/auth/jwt.strategy.ts) |
| `api/src/auth/jwt-auth.guard.ts` | [view](https://github.com/Gachi707/library-management-system/blob/main/api/src/auth/jwt-auth.guard.ts) |
| `api/src/auth/roles.decorator.ts` | [view](https://github.com/Gachi707/library-management-system/blob/main/api/src/auth/roles.decorator.ts) |
| `api/src/auth/roles.guard.ts` | [view](https://github.com/Gachi707/library-management-system/blob/main/api/src/auth/roles.guard.ts) |

### api/prisma/schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  PATRON
  LIBRARIAN
}

model User {
  id       Int    @id @default(autoincrement())
  email    String @unique
  password String
  role     Role   @default(PATRON)
}

model Genre {
  id    Int    @id @default(autoincrement())
  name  String @unique
  slug  String @unique
  books Book[]
}

model Book {
  id              Int      @id @default(autoincrement())
  title           String
  author          String
  isbn            String   @unique
  description     String
  coverImage      String?
  totalCopies     Int      @default(1)
  availableCopies Int      @default(1)
  genreId         Int
  genre           Genre    @relation(fields: [genreId], references: [id])
  createdAt       DateTime @default(now())
}
```

### api/prisma/seed.ts

```ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const catalog = [
  {
    name: 'Fiction',
    slug: 'fiction',
    books: [
      {
        title: 'Things Fall Apart',
        author: 'Chinua Achebe',
        isbn: '9780385474542',
        copies: 3,
        description: "Okonkwo's story and the collision between Igbo tradition and colonial rule in Nigeria.",
      },
      {
        title: 'Half of a Yellow Sun',
        author: 'Chimamanda Ngozi Adichie',
        isbn: '9781400095209',
        copies: 2,
        description: 'A novel of three lives caught up in the Nigerian-Biafran War.',
      },
      {
        title: 'Petals of Blood',
        author: 'Ngũgĩ wa Thiong’o',
        isbn: '9780143026358',
        copies: 2,
        description: 'Corruption, land and struggle in post-independence Kenya.',
      },
      {
        title: 'The Alchemist',
        author: 'Paulo Coelho',
        isbn: '9780062315007',
        copies: 4,
        description: "A shepherd boy's journey in search of treasure and his personal legend.",
      },
    ],
  },
  {
    name: 'Science',
    slug: 'science',
    books: [
      {
        title: 'A Brief History of Time',
        author: 'Stephen Hawking',
        isbn: '9780553380163',
        copies: 3,
        description: 'The Big Bang, black holes and the nature of time, explained for general readers.',
      },
      {
        title: 'The Selfish Gene',
        author: 'Richard Dawkins',
        isbn: '9780198788607',
        copies: 2,
        description: 'Evolution seen from the point of view of the gene.',
      },
      {
        title: 'Cosmos',
        author: 'Carl Sagan',
        isbn: '9780345539434',
        copies: 2,
        description: "A tour of the universe and humanity's place in it.",
      },
      {
        title: 'Silent Spring',
        author: 'Rachel Carson',
        isbn: '9780618249060',
        copies: 1,
        description: 'The 1962 warning about pesticides and the damage they do to nature.',
      },
    ],
  },
  {
    name: 'History',
    slug: 'history',
    books: [
      {
        title: 'Long Walk to Freedom',
        author: 'Nelson Mandela',
        isbn: '9780316548182',
        copies: 3,
        description: "Mandela's autobiography, from a rural childhood to the presidency of South Africa.",
      },
      {
        title: 'Sapiens',
        author: 'Yuval Noah Harari',
        isbn: '9780062316110',
        copies: 4,
        description: 'A brief history of humankind from the Stone Age to the present.',
      },
      {
        title: 'Guns, Germs, and Steel',
        author: 'Jared Diamond',
        isbn: '9780393317558',
        copies: 2,
        description: 'Why human societies developed so differently across the continents.',
      },
      {
        title: 'How Europe Underdeveloped Africa',
        author: 'Walter Rodney',
        isbn: '9781788731218',
        copies: 2,
        description: "An analysis of how colonial exploitation shaped Africa's economic position.",
      },
    ],
  },
  {
    name: 'Technology',
    slug: 'technology',
    books: [
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '9780132350884',
        copies: 3,
        description: 'A handbook of writing readable, maintainable code.',
      },
      {
        title: 'The Pragmatic Programmer',
        author: 'Andrew Hunt and David Thomas',
        isbn: '9780135957059',
        copies: 2,
        description: 'Practical advice on the craft and habits of working programmers.',
      },
      {
        title: 'Eloquent JavaScript',
        author: 'Marijn Haverbeke',
        isbn: '9781593279509',
        copies: 2,
        description: 'A modern introduction to JavaScript and programming.',
      },
      {
        title: 'Designing Data-Intensive Applications',
        author: 'Martin Kleppmann',
        isbn: '9781449373320',
        copies: 1,
        description: 'The principles behind reliable, scalable and maintainable data systems.',
      },
    ],
  },
];

async function main() {
  // Dev-only librarian account so the protected routes can be tested.
  // Change this password for any real deployment.
  const passwordHash = await bcrypt.hash('Librarian123!', 10);
  await prisma.user.upsert({
    where: { email: 'librarian@library.test' },
    update: {},
    create: {
      email: 'librarian@library.test',
      password: passwordHash,
      role: 'LIBRARIAN',
    },
  });

  for (const g of catalog) {
    // Genres first, because every book needs a genreId that already exists
    const genre = await prisma.genre.upsert({
      where: { slug: g.slug },
      update: {},
      create: { name: g.name, slug: g.slug },
    });

    for (const b of g.books) {
      await prisma.book.upsert({
        where: { isbn: b.isbn },
        update: {},
        create: {
          title: b.title,
          author: b.author,
          isbn: b.isbn,
          description: b.description,
          totalCopies: b.copies,
          availableCopies: b.copies,
          genreId: genre.id,
        },
      });
    }
  }
  console.log('Seeding complete: 4 genres, 16 books, 1 librarian');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

### api/src/prisma/prisma.service.ts

```ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

### api/.env.example

```text
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME"
JWT_SECRET="replace-with-a-long-random-string"
```

### api/prisma/migrations/20261108133914_init/migration.sql

```sql
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PATRON', 'LIBRARIAN');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PATRON',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverImage" TEXT,
    "totalCopies" INTEGER NOT NULL DEFAULT 1,
    "availableCopies" INTEGER NOT NULL DEFAULT 1,
    "genreId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_slug_key" ON "Genre"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn_key" ON "Book"("isbn");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

### api/src/main.ts

```ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

### api/src/genres/genres.controller.ts

```ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GenresService } from './genres.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('genres')
export class GenresController {
  constructor(private genresService: GenresService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('LIBRARIAN')
  create(@Body() dto: CreateGenreDto) {
    return this.genresService.create(dto);
  }

  @Get()
  findAll() {
    return this.genresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.genresService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('LIBRARIAN')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGenreDto) {
    return this.genresService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('LIBRARIAN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.genresService.remove(id);
  }
}
```

### api/src/genres/genres.service.ts

```ts
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
```

### api/src/genres/genres.module.ts

```ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GenresController } from './genres.controller';
import { GenresService } from './genres.service';

@Module({
  imports: [PrismaModule],
  controllers: [GenresController],
  providers: [GenresService],
})
export class GenresModule {}
```

### api/src/books/dto/create-book.dto.ts

```ts
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateBookDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() author: string;
  @IsString() @IsNotEmpty() isbn: string;
  @IsString() @IsNotEmpty() description: string;
  @IsOptional() @IsString() coverImage?: string;
  @IsInt() @Min(1) totalCopies: number;
  @IsInt() genreId: number;
}
```

### api/src/books/books.controller.ts

```ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('books')
export class BooksController {
  constructor(private booksService: BooksService) {}

  @Get()
  findAll(
    @Query('genreId') genreId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.booksService.findAll(genreId, search, Number(page) || 1, Number(limit) || 20);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('LIBRARIAN')
  create(@Body() dto: CreateBookDto) {
    return this.booksService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('LIBRARIAN')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBookDto) {
    return this.booksService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('LIBRARIAN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.remove(id);
  }
}
```

### api/src/books/books.service.ts

```ts
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
```

### api/src/auth/auth.controller.ts

```ts
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
```

### api/src/auth/auth.service.ts

```ts
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs'; // bcrypt hashing (pure-JS build, same algorithm)
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already registered');

    // Never store the plain password: hash it first
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { email, password: hashed },
    });
    return this.issueToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      // Same message for "no such user" and "wrong password" on purpose
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueToken(user);
  }

  // Issuing a token happens here (once, at login/register);
  // verifying it happens later in JwtStrategy on every protected request.
  private issueToken(user: { id: number; role: string }) {
    return { access_token: this.jwt.sign({ sub: user.id, role: user.role }) };
  }
}
```

### api/src/auth/auth.module.ts

```ts
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: 60 * 60 * 24 }, // 1 day, in seconds
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
```

### api/src/auth/jwt.strategy.ts

```ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // Whatever this returns becomes req.user for the rest of the request
  async validate(payload: { sub: number; role: string }) {
    return { userId: payload.sub, role: payload.role };
  }
}
```

### api/src/auth/jwt-auth.guard.ts

```ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### api/src/auth/roles.decorator.ts

```ts
import { SetMetadata } from '@nestjs/common';
import type { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

// Tags a route with the role(s) allowed to call it; RolesGuard reads the tag back
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

### api/src/auth/roles.guard.ts

```ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    // req.user was set by JwtAuthGuard, which must run before this guard
    const { user } = context.switchToHttp().getRequest();
    return !!user && required.includes(user.role);
  }
}
```

<!-- REQUIRED-FILES:END -->
