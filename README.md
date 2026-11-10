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

<!-- REQUIRED-FILES:START -->
## Repository Contents

_Generated from the real files by `scripts/update-readme.sh`._

### Every file in the repository

```text
docs/newman-results.txt
scripts/run-tests.sh
scripts/verify-submission.sh
README.md
api/.env.example
api/.gitattributes
api/.gitignore
api/.oxlintrc.json
api/.prettierrc
api/AGENTS.md
api/README.md
api/jest.config.ts
api/nest-cli.json
api/package-lock.json
api/package.json
api/prisma/migrations/20261108133914_init/migration.sql
api/prisma/migrations/migration_lock.toml
api/prisma/schema.prisma
api/prisma/seed.ts
api/src/app.controller.spec.ts
api/src/app.controller.ts
api/src/app.module.ts
api/src/app.service.ts
api/src/auth/auth.controller.ts
api/src/auth/auth.module.ts
api/src/auth/auth.service.ts
api/src/auth/dto/login.dto.ts
api/src/auth/dto/register.dto.ts
api/src/auth/jwt-auth.guard.ts
api/src/auth/jwt.strategy.ts
api/src/auth/roles.decorator.ts
api/src/auth/roles.guard.ts
api/src/books/books.controller.ts
api/src/books/books.module.ts
api/src/books/books.service.ts
api/src/books/dto/create-book.dto.ts
api/src/books/dto/update-book.dto.ts
api/src/genres/dto/create-genre.dto.ts
api/src/genres/dto/update-genre.dto.ts
api/src/genres/genres.controller.ts
api/src/genres/genres.module.ts
api/src/genres/genres.service.ts
api/src/main.ts
api/src/prisma/prisma.module.ts
api/src/prisma/prisma.service.spec.ts
api/src/prisma/prisma.service.ts
api/test/app.e2e-spec.ts
api/test/jest-e2e.json
api/tsconfig.build.json
api/tsconfig.json
docs/postman_collection.json
scripts/readme-files.txt
scripts/update-readme.sh
```

### Required files

| File | Link |
|---|---|
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

### API test results (Newman, run against the live API)

```text
newman

Library Management System API

□ Auth
└ Register patron
  POST http://127.0.0.1:3000/auth/register [409 Conflict, 347B, 1183ms]
  √  201 with an access_token (or 409 if already registered)

└ Login librarian
  POST http://127.0.0.1:3000/auth/login [200 OK, 451B, 446ms]
  √  Status is 200
  √  Response has access_token

└ Login patron
  POST http://127.0.0.1:3000/auth/login [200 OK, 447B, 362ms]
  √  Status is 200

└ Register - invalid body (400)
  POST http://127.0.0.1:3000/auth/register [400 Bad Request, 410B, 15ms]
  √  Status is 400

└ Login - wrong password (401)
  POST http://127.0.0.1:3000/auth/login [401 Unauthorized, 350B, 367ms]
  √  Status is 401

□ Genres
└ List genres
  GET http://127.0.0.1:3000/genres [200 OK, 447B, 189ms]
  √  Status is 200

└ Get genre by id
  GET http://127.0.0.1:3000/genres/1 [200 OK, 330B, 450ms]
  √  Status is 200

└ Create genre (librarian)
  POST http://127.0.0.1:3000/genres [201 Created, 312B, 425ms]
  √  Status is 201

└ Update genre (librarian)
  PATCH http://127.0.0.1:3000/genres/6 [200 OK, 317B, 613ms]
  √  Status is 200

└ Delete genre (librarian)
  DELETE http://127.0.0.1:3000/genres/6 [200 OK, 317B, 957ms]
  √  Status is 200

└ Delete genre in use (409)
  DELETE http://127.0.0.1:3000/genres/1 [409 Conflict, 350B, 372ms]
  √  Status is 409

└ Create genre - no token (401)
  POST http://127.0.0.1:3000/genres [401 Unauthorized, 320B, 7ms]
  √  Status is 401

└ Create genre - patron token (403)
  POST http://127.0.0.1:3000/genres [403 Forbidden, 343B, 8ms]
  √  Status is 403

□ Books
└ List books (paginated)
  GET http://127.0.0.1:3000/books?page=1&limit=10 [200 OK, 3.58kB, 740ms]
  √  Status is 200 and body is an array
  √  limit is respected

└ Filter by genre
  GET http://127.0.0.1:3000/books?genreId=1 [200 OK, 1.59kB, 732ms]
  √  Status is 200
  √  Every book belongs to genre 1

└ Search title or author
  GET http://127.0.0.1:3000/books?search=clean [200 OK, 581B, 579ms]
  √  Status is 200

└ Get book by id
  GET http://127.0.0.1:3000/books/1 [200 OK, 612B, 554ms]
  √  Status is 200

└ Create book (librarian)
  POST http://127.0.0.1:3000/books [201 Created, 566B, 1306ms]
  √  Status is 201
  √  availableCopies equals totalCopies

└ Update book (librarian)
  PATCH http://127.0.0.1:3000/books/19 [200 OK, 561B, 1460ms]
  √  Status is 200

└ Delete book (librarian)
  DELETE http://127.0.0.1:3000/books/19 [200 OK, 509B, 736ms]
  √  Status is 200

└ Create book - no token (401)
  POST http://127.0.0.1:3000/books [401 Unauthorized, 320B, 8ms]
  √  Status is 401

└ Create book - patron token (403)
  POST http://127.0.0.1:3000/books [403 Forbidden, 343B, 6ms]
  √  Status is 403

└ Create book - missing title (400)
  POST http://127.0.0.1:3000/books [400 Bad Request, 382B, 6ms]
  √  Status is 400

└ Create book - missing description (400)
  POST http://127.0.0.1:3000/books [400 Bad Request, 394B, 5ms]
  √  Status is 400

└ Get missing book (404)
  GET http://127.0.0.1:3000/books/999999 [404 Not Found, 346B, 201ms]
  √  Status is 404

┌─────────────────────────┬────────────────────┬────────────────────┐
│                         │           executed │             failed │
├─────────────────────────┼────────────────────┼────────────────────┤
│              iterations │                  1 │                  0 │
├─────────────────────────┼────────────────────┼────────────────────┤
│                requests │                 25 │                  0 │
├─────────────────────────┼────────────────────┼────────────────────┤
│            test-scripts │                 25 │                  0 │
├─────────────────────────┼────────────────────┼────────────────────┤
│      prerequest-scripts │                  0 │                  0 │
├─────────────────────────┼────────────────────┼────────────────────┤
│              assertions │                 29 │                  0 │
├─────────────────────────┴────────────────────┴────────────────────┤
│ total run duration: 13.7s                                         │
├───────────────────────────────────────────────────────────────────┤
│ total data received: 7.73kB (approx)                              │
├───────────────────────────────────────────────────────────────────┤
│ average response time: 469ms [min: 5ms, max: 1460ms, s.d.: 417ms] │
└───────────────────────────────────────────────────────────────────┘
```

### Source code

#### api/src/main.ts

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

#### api/src/genres/genres.controller.ts

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

#### api/src/genres/genres.service.ts

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

#### api/src/genres/genres.module.ts

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

#### api/src/books/dto/create-book.dto.ts

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

#### api/src/books/books.controller.ts

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

#### api/src/books/books.service.ts

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

#### api/src/auth/auth.controller.ts

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

#### api/src/auth/auth.service.ts

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

#### api/src/auth/auth.module.ts

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

#### api/src/auth/jwt.strategy.ts

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

#### api/src/auth/jwt-auth.guard.ts

```ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

#### api/src/auth/roles.decorator.ts

```ts
import { SetMetadata } from '@nestjs/common';
import type { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

// Tags a route with the role(s) allowed to call it; RolesGuard reads the tag back
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

#### api/src/auth/roles.guard.ts

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

