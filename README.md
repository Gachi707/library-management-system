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
## Client (Weeks 3 and 4)

A React app built with Vite, React Router, axios and Tailwind CSS. The full documentation, the requirement checklists and the complete source code are in [`client/README.md`](client/README.md).

1. `cd client && npm install`
2. `client/.env` points at the API (`VITE_API_URL=http://localhost:3000`)
3. Start the API (`cd api && npm run start:dev`), then in a second terminal run `cd client && npm run dev`
4. Open http://localhost:5173
5. Automated tests: `cd client && npm test` (the saved report is `docs/client-test-results.txt`)

Features: debounced live search, genre filter and sort, book detail pages, a reading list kept in a React Context and saved in `localStorage`, register and login with the JWT kept in `localStorage`, a protected `/book-space` route with a controlled booking form, and loading, error and empty states.

| Week 4 requirement | File |
|---|---|
| Reducer (`ADD_BOOK`, `REMOVE_BOOK`, `CLEAR_LIST`) persisted to and restored from `localStorage` | `client/src/context/ReadingListContext.jsx` |
| Wraps its routes in `<ReadingListProvider>` | `client/src/App.jsx` |
| Controlled login form, posts to `/auth/login`, stores the JWT | `client/src/pages/LoginPage.jsx` |
| Controlled registration form, posts to `/auth/register` | `client/src/pages/RegisterPage.jsx` |
| Redirects to `/login` when there is no token, otherwise renders its children | `client/src/components/ProtectedRoute.jsx` |
| Controlled booking form: space dropdown, date, start time, end time | `client/src/pages/SpaceBookingPage.jsx` |
| Displays the reading list count from `ReadingListContext` | `client/src/components/Navbar.jsx` |

| Week 3 requirement | File |
|---|---|
| `<App />` wrapped in `<BrowserRouter>` | `client/src/main.jsx` |
| Routes for `/` and `/books/:id` | `client/src/App.jsx` |
| Shared filter state, genre filter, search bar and grid together | `client/src/pages/HomePage.jsx` |
| Fetch `GET /books` with `genreId`/`search`; loading, error and empty states | `client/src/components/BookGrid.jsx` |
| One book, mapped with `key={book.id}` | `client/src/components/BookCard.jsx` |
| Debounced search (`setTimeout` + cleanup) | `client/src/components/SearchBar.jsx` |
| Reads `id` with `useParams()`, fetches `GET /books/:id` | `client/src/pages/BookDetail.jsx` |
| `VITE_API_URL` pointing at the NestJS API | `client/.env` |

## Borrow requests and bookings (Week 5)

The API now handles borrowing and study-space bookings. The full documentation, the lifecycle rules and the complete source are in [`api/README.md`](api/README.md).

1. `cd api && npx prisma migrate dev` creates the new tables, then `npx prisma db seed` adds the study spaces
2. Unit tests (no database needed): `cd api && npm test` (the saved report is `docs/api-test-results.txt`)
3. API checks against the running server: `bash scripts/run-tests.sh` (Postman collection, report in `docs/newman-results.txt`)

- Borrow requests move through `REQUESTED`, `APPROVED`, `BORROWED`, `RETURNED`, `OVERDUE` and `CANCELLED`, and only legal moves are accepted. Approving sets a copy aside and returning frees it, inside one database transaction.
- Fines are worked out on the server by `calculateFine()` from the stored due date, never taken from the client.
- Space bookings are checked for overlaps with one Prisma query (`startTime < newEnd` and `endTime > newStart`) inside a Serializable transaction, so a space can never be double-booked.
- Librarian routes: `GET /admin/borrow-requests`, `PATCH /admin/borrow-requests/:id`, `GET /admin/bookings`.

| Week 5 requirement | File |
|---|---|
| `BorrowRequest`, `Space`, `Booking` models and the `BorrowStatus` and `BookingStatus` enums, migrated | `api/prisma/schema.prisma` |
| `POST /borrow-requests`, and the librarian-only `PATCH` that updates the status | `api/src/borrow-requests/borrow-requests.controller.ts` |
| Request creation, the status lifecycle, stock changes and fines | `api/src/borrow-requests/borrow-requests.service.ts` |
| Validated input for a borrow request | `api/src/borrow-requests/dto/create-borrow-request.dto.ts` |
| `calculateFine` and its passing Jest test | `api/src/borrow-requests/fine-calculator.ts`, `fine-calculator.spec.ts` |
| `POST /bookings` with the overlap check and `409 Conflict` | `api/src/bookings/bookings.controller.ts`, `bookings.service.ts` |
| Validated input for a booking | `api/src/bookings/dto/create-booking.dto.ts` |

## Repository Contents

_Generated from the real files by `scripts/update-readme.sh`._

### Every file in the repository

```text
api/prisma/migrations/20261119104237_add_transactions/migration.sql
api/src/auth/current-user.decorator.ts
api/src/bookings/bookings.controller.ts
api/src/bookings/bookings.module.ts
api/src/bookings/bookings.service.spec.ts
api/src/bookings/bookings.service.ts
api/src/bookings/dto/create-booking.dto.ts
api/src/books/books.service.spec.ts
api/src/borrow-requests/borrow-requests.controller.ts
api/src/borrow-requests/borrow-requests.module.ts
api/src/borrow-requests/borrow-requests.service.spec.ts
api/src/borrow-requests/borrow-requests.service.ts
api/src/borrow-requests/dto/create-borrow-request.dto.ts
api/src/borrow-requests/dto/update-borrow-request.dto.ts
api/src/borrow-requests/fine-calculator.spec.ts
api/src/borrow-requests/fine-calculator.ts
api/test/support/in-memory-prisma.ts
docs/api-test-results.txt
scripts/run-api-tests.sh
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
client/.env
client/.gitignore
client/README.md
client/index.html
client/package-lock.json
client/package.json
client/src/App.jsx
client/src/__tests__/auth.test.jsx
client/src/__tests__/catalog.test.jsx
client/src/__tests__/readingList.test.jsx
client/src/__tests__/spaceBooking.test.jsx
client/src/components/BookCard.jsx
client/src/components/BookCover.jsx
client/src/components/BookGrid.jsx
client/src/components/GenreFilter.jsx
client/src/components/Navbar.jsx
client/src/components/ProtectedRoute.jsx
client/src/components/ReadingListButton.jsx
client/src/components/SearchBar.jsx
client/src/context/AuthContext.jsx
client/src/context/ReadingListContext.jsx
client/src/index.css
client/src/main.jsx
client/src/pages/BookDetail.jsx
client/src/pages/HomePage.jsx
client/src/pages/LoginPage.jsx
client/src/pages/NotFound.jsx
client/src/pages/ReadingListPage.jsx
client/src/pages/RegisterPage.jsx
client/src/pages/SpaceBookingPage.jsx
client/src/test/helpers.jsx
client/src/test/setup.js
client/src/utils/apiError.js
client/vite.config.js
client/vitest.config.js
docs/client-test-results.txt
docs/newman-results.txt
docs/postman_collection.json
scripts/readme-files.txt
scripts/run-client-tests.sh
scripts/run-tests.sh
scripts/update-readme.sh
scripts/verify-submission.sh
```

### Required files

| File | Link |
|---|---|
| `api/prisma/schema.prisma` | [view](https://github.com/Gachi707/library-management-system/blob/main/api/prisma/schema.prisma) |
| `api/src/borrow-requests/borrow-requests.controller.ts` | [view](https://github.com/Gachi707/library-management-system/blob/main/api/src/borrow-requests/borrow-requests.controller.ts) |
| `api/src/borrow-requests/borrow-requests.service.ts` | [view](https://github.com/Gachi707/library-management-system/blob/main/api/src/borrow-requests/borrow-requests.service.ts) |
| `api/src/borrow-requests/borrow-requests.module.ts` | [view](https://github.com/Gachi707/library-management-system/blob/main/api/src/borrow-requests/borrow-requests.module.ts) |
| `api/src/borrow-requests/dto/create-borrow-request.dto.ts` | [view](https://github.com/Gachi707/library-management-system/blob/main/api/src/borrow-requests/dto/create-borrow-request.dto.ts) |
| `api/src/borrow-requests/fine-calculator.ts` | [view](https://github.com/Gachi707/library-management-system/blob/main/api/src/borrow-requests/fine-calculator.ts) |
| `api/src/borrow-requests/fine-calculator.spec.ts` | [view](https://github.com/Gachi707/library-management-system/blob/main/api/src/borrow-requests/fine-calculator.spec.ts) |
| `api/src/bookings/bookings.controller.ts` | [view](https://github.com/Gachi707/library-management-system/blob/main/api/src/bookings/bookings.controller.ts) |
| `api/src/bookings/bookings.service.ts` | [view](https://github.com/Gachi707/library-management-system/blob/main/api/src/bookings/bookings.service.ts) |
| `api/src/bookings/bookings.module.ts` | [view](https://github.com/Gachi707/library-management-system/blob/main/api/src/bookings/bookings.module.ts) |
| `api/src/bookings/dto/create-booking.dto.ts` | [view](https://github.com/Gachi707/library-management-system/blob/main/api/src/bookings/dto/create-booking.dto.ts) |

### Source code

#### api/prisma/schema.prisma

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

  borrowRequests BorrowRequest[]
  bookings       Booking[]
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

  borrowRequests BorrowRequest[]
}

// Where a borrow request is in its life
enum BorrowStatus {
  REQUESTED // the patron asked for the book
  APPROVED // a librarian said yes, and a copy is set aside
  BORROWED // the patron collected it; dueDate is set
  RETURNED // it came back; any fine is recorded
  OVERDUE // not returned by the due date
  CANCELLED // withdrawn by the patron, or declined by a librarian
}

enum BookingStatus {
  CONFIRMED
  CANCELLED
}

model BorrowRequest {
  id          Int          @id @default(autoincrement())
  userId      Int
  bookId      Int
  // A snapshot of the book at request time, so history still reads correctly if the catalog entry later changes
  bookTitle   String
  bookAuthor  String
  status      BorrowStatus @default(REQUESTED)
  requestDate DateTime     @default(now())
  dueDate     DateTime?
  returnDate  DateTime?
  fineAmount  Float        @default(0)

  user User @relation(fields: [userId], references: [id])
  book Book @relation(fields: [bookId], references: [id])

  @@index([userId])
  @@index([status])
}

model Space {
  id       Int    @id @default(autoincrement())
  name     String @unique
  capacity Int

  bookings Booking[]
}

model Booking {
  id        Int           @id @default(autoincrement())
  userId    Int
  spaceId   Int
  date      String // "YYYY-MM-DD"
  startTime String // 24-hour "HH:MM"
  endTime   String // 24-hour "HH:MM"
  status    BookingStatus @default(CONFIRMED)
  createdAt DateTime      @default(now())

  user  User  @relation(fields: [userId], references: [id])
  space Space @relation(fields: [spaceId], references: [id])

  @@index([spaceId, date])
  @@index([userId])
}
```

#### api/src/borrow-requests/borrow-requests.controller.ts

```ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BorrowStatus } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { BorrowRequestsService } from './borrow-requests.service';
import { CreateBorrowRequestDto } from './dto/create-borrow-request.dto';
import { UpdateBorrowRequestDto } from './dto/update-borrow-request.dto';

// Patron routes: any logged-in user
@Controller('borrow-requests')
@UseGuards(JwtAuthGuard)
export class BorrowRequestsController {
  constructor(private borrowRequestsService: BorrowRequestsService) {}

  // The patron asks to borrow a book (for example one from their reading list)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateBorrowRequestDto) {
    return this.borrowRequestsService.create(user.userId, dto);
  }

  @Get('mine')
  findMine(@CurrentUser() user: AuthUser) {
    return this.borrowRequestsService.findMine(user.userId);
  }

  @Patch(':id/cancel')
  cancel(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.borrowRequestsService.cancelOwn(user.userId, id);
  }
}

// Librarian routes: JwtAuthGuard first (sets req.user), then RolesGuard (checks the role)
@Controller('admin/borrow-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('LIBRARIAN')
export class AdminBorrowRequestsController {
  constructor(private borrowRequestsService: BorrowRequestsService) {}

  @Get()
  findAll(@Query('status', new ParseEnumPipe(BorrowStatus, { optional: true })) status?: BorrowStatus) {
    return this.borrowRequestsService.findAll(status);
  }

  // Approve, decline (CANCELLED), hand over (BORROWED), mark OVERDUE or RETURNED
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBorrowRequestDto) {
    return this.borrowRequestsService.update(id, dto);
  }
}
```

#### api/src/borrow-requests/borrow-requests.service.ts

```ts
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
```

#### api/src/borrow-requests/borrow-requests.module.ts

```ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminBorrowRequestsController, BorrowRequestsController } from './borrow-requests.controller';
import { BorrowRequestsService } from './borrow-requests.service';

@Module({
  imports: [PrismaModule],
  controllers: [BorrowRequestsController, AdminBorrowRequestsController],
  providers: [BorrowRequestsService],
})
export class BorrowRequestsModule {}
```

#### api/src/borrow-requests/dto/create-borrow-request.dto.ts

```ts
import { IsInt, Min } from 'class-validator';

// The patron only says WHICH book. Everything else (who they are, the status, the dates, the fine)
// is set by the server, and whitelist: true strips anything else they send.
export class CreateBorrowRequestDto {
  @IsInt()
  @Min(1)
  bookId: number;
}
```

#### api/src/borrow-requests/fine-calculator.ts

```ts
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Fine charged for each day (or part of a day) a book is returned after its due date
export const DEFAULT_FINE_PER_DAY = 10;

// A pure function: the same inputs always give the same fine, with no database and no clock,
// which is why it is so easy to test.
export function calculateFine(
  dueDate: Date,
  returnDate: Date,
  ratePerDay: number = DEFAULT_FINE_PER_DAY,
): number {
  if (Number.isNaN(dueDate.getTime()) || Number.isNaN(returnDate.getTime())) {
    throw new RangeError('calculateFine needs two valid dates');
  }
  if (ratePerDay < 0) {
    throw new RangeError('ratePerDay cannot be negative');
  }

  // Returned on time or early: no fine. Otherwise every started day late counts as a full day.
  const daysLate = Math.max(0, Math.ceil((returnDate.getTime() - dueDate.getTime()) / MS_PER_DAY));
  return daysLate * ratePerDay;
}
```

#### api/src/borrow-requests/fine-calculator.spec.ts

```ts
import { calculateFine, DEFAULT_FINE_PER_DAY } from './fine-calculator';

const day = 24 * 60 * 60 * 1000;
const due = new Date('2026-11-01T12:00:00Z');

describe('calculateFine', () => {
  it('returns 0 for a book returned on time', () => {
    expect(calculateFine(due, new Date('2026-10-30T12:00:00Z'))).toBe(0);
  });

  it('returns 0 when returned exactly on the due date', () => {
    expect(calculateFine(due, due)).toBe(0);
  });

  it('charges the daily rate for each day late', () => {
    expect(calculateFine(due, new Date(due.getTime() + 3 * day))).toBe(3 * DEFAULT_FINE_PER_DAY);
  });

  it('counts a part of a day as a full day', () => {
    expect(calculateFine(due, new Date(due.getTime() + 60 * 60 * 1000))).toBe(DEFAULT_FINE_PER_DAY); // 1 hour late
    expect(calculateFine(due, new Date(due.getTime() + 2 * day + 1))).toBe(3 * DEFAULT_FINE_PER_DAY); // 2 days + 1 ms
  });

  it('uses a custom daily rate', () => {
    expect(calculateFine(due, new Date(due.getTime() + 5 * day), 25)).toBe(125);
  });

  it('a rate of 0 means no fine at all', () => {
    expect(calculateFine(due, new Date(due.getTime() + 5 * day), 0)).toBe(0);
  });

  it('rejects invalid dates and negative rates instead of returning nonsense', () => {
    expect(() => calculateFine(new Date('nope'), due)).toThrow(RangeError);
    expect(() => calculateFine(due, new Date('nope'))).toThrow(RangeError);
    expect(() => calculateFine(due, due, -1)).toThrow(RangeError);
  });
});
```

#### api/src/bookings/bookings.controller.ts

```ts
import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

// Public: the booking form needs the list of spaces
@Controller('spaces')
export class SpacesController {
  constructor(private bookingsService: BookingsService) {}

  @Get()
  findAll() {
    return this.bookingsService.findSpaces();
  }
}

// Patron routes: any logged-in user
@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  // 201 when the slot is free, 409 Conflict when it overlaps an existing booking
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(user.userId, dto);
  }

  @Get('mine')
  findMine(@CurrentUser() user: AuthUser) {
    return this.bookingsService.findMine(user.userId);
  }

  @Patch(':id/cancel')
  cancel(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.cancel(user, id);
  }
}

// Librarian routes
@Controller('admin/bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('LIBRARIAN')
export class AdminBookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Get()
  findAll(@Query('date') date?: string) {
    if (date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException('date must be in YYYY-MM-DD format');
    }
    return this.bookingsService.findAll(date);
  }
}
```

#### api/src/bookings/bookings.service.ts

```ts
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
```

#### api/src/bookings/bookings.module.ts

```ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminBookingsController, BookingsController, SpacesController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [PrismaModule],
  controllers: [SpacesController, BookingsController, AdminBookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
```

#### api/src/bookings/dto/create-booking.dto.ts

```ts
import { IsInt, Matches, Min } from 'class-validator';

// 24-hour time, zero padded: 00:00 to 23:59. Text in this shape sorts correctly, which the overlap check relies on.
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateBookingDto {
  @IsInt()
  @Min(1)
  spaceId: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in YYYY-MM-DD format' })
  date: string;

  @Matches(TIME, { message: 'startTime must be a 24-hour time like 09:30' })
  startTime: string;

  @Matches(TIME, { message: 'endTime must be a 24-hour time like 11:00' })
  endTime: string;
}
```

### API test results (Jest)

```text
API test report - 2026-11-19 15:47 UTC
Command: cd api && npm test


PASS src/bookings/bookings.service.spec.ts (25.063 s)
  BookingsService.create
    √ books a free slot: CONFIRMED, owned by the caller, with the space included (67 ms)
    √ runs in a Serializable transaction, so concurrent bookings cannot both pass the check (8 ms)
    √ turns a database serialization failure (two bookings at the same instant) into a friendly 409 (5 ms)
    √ lets other database errors through untouched (4 ms)
    overlap check (existing booking: Room A, 10:00 to 12:00)
      √ the exact same slot -> 10:00 to 12:00 (3336 ms)
      √ starts inside the existing booking -> 11:00 to 13:00 (18 ms)
      √ ends inside the existing booking -> 09:00 to 10:30 (25 ms)
      √ wraps around the existing booking -> 09:00 to 13:00 (10 ms)
      √ sits entirely inside it -> 10:30 to 11:30 (2 ms)
      √ starts the minute before it ends -> 11:59 to 13:00 (3 ms)
      √ ends the minute after it starts -> 09:00 to 10:01 (8 ms)
      √ starts exactly when it ends (back to back) -> 12:00 to 13:00 (3 ms)
      √ ends exactly when it starts (back to back) -> 09:00 to 10:00 (2 ms)
      √ entirely before it -> 08:00 to 09:00 (2 ms)
      √ entirely after it -> 14:00 to 15:00 (2 ms)
      √ a different space at the same time is fine (8 ms)
      √ the same time on a different day is fine (2 ms)
      √ a CANCELLED booking no longer blocks the slot (2 ms)
      √ the conflict is a 409 and nothing extra is saved (4 ms)
    input checks
      √ 400 when the end is before the start (423 ms)
      √ 400 when the end equals the start (2 ms)
      √ 400 for a date in the past (2 ms)
      √ today is allowed (3 ms)
      √ 400 for 2026-02-30, which is not a real day (2 ms)
      √ 400 for 2026-13-01, which is not a real day (2 ms)
      √ 400 for 2026-00-10, which is not a real day (2 ms)
      √ 400 for 2026-04-31, which is not a real day (3 ms)
      √ 404 for a space that does not exist, and nothing is saved (3 ms)
  BookingsService.cancel
    √ a patron cancels their own booking, and the slot can be booked again (4 ms)
    √ a librarian can cancel anyone's booking (1 ms)
    √ another patron cannot cancel it: it looks like it does not exist (404) (5 ms)
    √ 409 when it is already cancelled (2 ms)
    √ 404 for a booking that does not exist (1 ms)
  BookingsService: lists
    √ findMine returns only the caller's bookings, soonest first, with the space (3 ms)
    √ findAll (librarian) shows everyone's bookings with the patron's email, and can filter by date (4 ms)
    √ findSpaces lists the spaces in id order (3 ms)

PASS src/books/books.service.spec.ts
  BooksService.remove
    √ deletes a book nobody has borrowed (14 ms)
    √ refuses with a clear 409 when borrow requests still point at the book (16 ms)
    √ checks for borrow history BEFORE trying to delete, so it never depends on the database error code (3 ms)
    √ still answers 409 if the database itself refuses the delete with P2003 (a request slipped in) (2 ms)
    √ still answers 409 if the database itself refuses the delete with P2014 (a request slipped in) (1 ms)
    √ lets any other database error through untouched (15 ms)
    √ 404 for a book that does not exist (2 ms)

PASS src/borrow-requests/borrow-requests.service.spec.ts (5.314 s)
  BorrowRequestsService.create
    √ starts as REQUESTED and keeps a snapshot of the book title and author (83 ms)
    √ does not touch the stock: only an approval sets a copy aside (11 ms)
    √ 404 for a book that does not exist (6 ms)
    √ 409 when the patron already has an open request that is REQUESTED (13 ms)
    √ 409 when the patron already has an open request that is APPROVED (2 ms)
    √ 409 when the patron already has an open request that is BORROWED (27 ms)
    √ 409 when the patron already has an open request that is OVERDUE (40 ms)
    √ can request again once the earlier request is RETURNED (13 ms)
    √ can request again once the earlier request is CANCELLED (54 ms)
    √ a different patron can request the same book (16 ms)
  BorrowRequestsService.update: the lifecycle, stock and fines
    √ APPROVED sets a copy aside (15 ms)
    √ cannot approve when no copies are left, and nothing changes (196 ms)
    √ two requests, one copy left: the first approval wins, the second is refused (5 ms)
    √ is all-or-nothing: if the status change fails, the stock change is undone (157 ms)
    √ BORROWED sets the due date 14 days ahead by default (2 ms)
    √ BORROWED accepts a librarian-chosen due date, and does not change the stock (3 ms)
    √ a due date is refused for any status except BORROWED (19 ms)
    √ a due date on the wrong status is a 400 even when the move itself would also be refused (5 ms)
    √ RETURNED on time: no fine, the copy goes back on the shelf (4 ms)
    √ RETURNED late: the fine is worked out from the stored due date (4.5 days late = 5 days x 10) (3 ms)
    √ ignores a fineAmount sent by the client (6 ms)
    √ OVERDUE is only allowed once the due date has passed (24 ms)
    √ OVERDUE keeps the copy held, then RETURNED charges the fine and frees it (5 ms)
    √ CANCELLED from APPROVED gives the held copy back; from REQUESTED the stock is untouched (9 ms)
    √ runs the whole journey and ends with the stock where it started (54 ms)
    √ refuses the move REQUESTED -> REQUESTED and leaves everything unchanged (10 ms)
    √ refuses the move REQUESTED -> BORROWED and leaves everything unchanged (2 ms)
    √ refuses the move REQUESTED -> RETURNED and leaves everything unchanged (13 ms)
    √ refuses the move REQUESTED -> OVERDUE and leaves everything unchanged (5 ms)
    √ refuses the move APPROVED -> RETURNED and leaves everything unchanged (10 ms)
    √ refuses the move APPROVED -> OVERDUE and leaves everything unchanged (4 ms)
    √ refuses the move BORROWED -> APPROVED and leaves everything unchanged (8 ms)
    √ refuses the move BORROWED -> CANCELLED and leaves everything unchanged (2 ms)
    √ refuses the move OVERDUE -> BORROWED and leaves everything unchanged (12 ms)
    √ refuses the move RETURNED -> BORROWED and leaves everything unchanged (6 ms)
    √ refuses the move RETURNED -> CANCELLED and leaves everything unchanged (9 ms)
    √ refuses the move CANCELLED -> APPROVED and leaves everything unchanged (2 ms)
    √ 404 for a request that does not exist (15 ms)
  BorrowRequestsService.cancelOwn (the patron withdraws a request)
    √ cancels the patron's own REQUESTED request (2 ms)
    √ cancelling an APPROVED request gives the held copy back (5 ms)
    √ someone else's request looks like it does not exist (404) (11 ms)
    √ cannot cancel a request that is already BORROWED (2 ms)
    √ cannot cancel a request that is already OVERDUE (3 ms)
    √ cannot cancel a request that is already RETURNED (2 ms)
    √ cannot cancel a request that is already CANCELLED (3 ms)
  BorrowRequestsService: lists
    √ findMine returns only the caller's requests, newest first (5 ms)
    √ findAll lists everyone's requests with the patron's email, and can filter by status (15 ms)
    √ findAll never exposes the patron's password (8 ms)

PASS src/borrow-requests/fine-calculator.spec.ts
  calculateFine
    √ returns 0 for a book returned on time (7 ms)
    √ returns 0 when returned exactly on the due date (2 ms)
    √ charges the daily rate for each day late (4 ms)
    √ counts a part of a day as a full day (2 ms)
    √ uses a custom daily rate (1 ms)
    √ a rate of 0 means no fine at all (1 ms)
    √ rejects invalid dates and negative rates instead of returning nonsense (97 ms)

PASS src/app.controller.spec.ts (48.07 s)
  AppController
    root
      √ should return "Hello World!" (22701 ms)

PASS src/prisma/prisma.service.spec.ts (48.07 s)
  PrismaService
    √ should be defined (22654 ms)

Test Suites: 6 passed, 6 total
Tests:       100 passed, 100 total
Snapshots:   0 total
Time:        53.16 s
Ran all test suites.
```

### Client test results (Vitest)

```text
Client test report - 2026-11-15 13:29 UTC
Command: cd client && npm test


 RUN  v5.1.0 (client folder)

 ✓ src/__tests__/readingList.test.jsx > readingListReducer (ADD_BOOK / REMOVE_BOOK / CLEAR_LIST) > ADD_BOOK adds a book 185ms
 ✓ src/__tests__/readingList.test.jsx > readingListReducer (ADD_BOOK / REMOVE_BOOK / CLEAR_LIST) > ADD_BOOK ignores a book that is already on the list 5ms
 ✓ src/__tests__/readingList.test.jsx > readingListReducer (ADD_BOOK / REMOVE_BOOK / CLEAR_LIST) > REMOVE_BOOK removes by id and leaves the others 2ms
 ✓ src/__tests__/readingList.test.jsx > readingListReducer (ADD_BOOK / REMOVE_BOOK / CLEAR_LIST) > CLEAR_LIST empties the list 1ms
 ✓ src/__tests__/readingList.test.jsx > readingListReducer (ADD_BOOK / REMOVE_BOOK / CLEAR_LIST) > an unknown action leaves the state alone 1ms
 ✓ src/__tests__/readingList.test.jsx > readingListReducer (ADD_BOOK / REMOVE_BOOK / CLEAR_LIST) > never changes the old state (it returns a new array) 1ms
 ✓ src/__tests__/auth.test.jsx > parseToken > reads the role and id from a JWT 312ms
 ✓ src/__tests__/auth.test.jsx > parseToken > returns null for garbage 7ms
 ✓ src/__tests__/catalog.test.jsx > Week 3 catalog still works (regression) > shows a loading skeleton, then the books 636ms
 ✓ src/__tests__/readingList.test.jsx > ReadingListProvider: persisted to and restored from localStorage > saves every change to localStorage 564ms
 ✓ src/__tests__/readingList.test.jsx > ReadingListProvider: persisted to and restored from localStorage > keeps only what the list needs, not the whole book record 143ms
 ✓ src/__tests__/readingList.test.jsx > ReadingListProvider: persisted to and restored from localStorage > restores the saved list on the first render (a page refresh) 29ms
 ✓ src/__tests__/readingList.test.jsx > ReadingListProvider: persisted to and restored from localStorage > survives a refresh: unmount, mount again, the book is still there 110ms
 ✓ src/__tests__/readingList.test.jsx > ReadingListProvider: persisted to and restored from localStorage > starts empty instead of crashing when storage holds corrupt JSON 167ms
 ✓ src/__tests__/readingList.test.jsx > ReadingListProvider: persisted to and restored from localStorage > starts empty instead of crashing when storage holds a value that is not a list 12ms
 ✓ src/__tests__/readingList.test.jsx > ReadingListProvider: persisted to and restored from localStorage > starts empty instead of crashing when storage holds null 8ms
 ✓ src/__tests__/readingList.test.jsx > ReadingListProvider: persisted to and restored from localStorage > CLEAR_LIST empties the saved copy too 62ms
 ✓ src/__tests__/readingList.test.jsx > ReadingListProvider: persisted to and restored from localStorage > useReadingList outside the provider explains the mistake 39ms
 ✓ src/__tests__/auth.test.jsx > Login page (controlled form posting to /auth/login) > the inputs are controlled: they show exactly what is typed 1582ms
 ✓ src/__tests__/readingList.test.jsx > reading list in the whole app > add from the catalog: the Navbar count updates without any props passed down 667ms
 ✓ src/__tests__/readingList.test.jsx > reading list in the whole app > clicking the button again removes the book 242ms
 ✓ src/__tests__/auth.test.jsx > Login page (controlled form posting to /auth/login) > the submit button stays disabled until both fields are filled 715ms
 ✓ src/__tests__/readingList.test.jsx > reading list in the whole app > the list is still there after a page refresh 349ms
 ✓ src/__tests__/catalog.test.jsx > Week 3 catalog still works (regression) > live search, with the genre filter, refetches with query params 1973ms
 ✓ src/__tests__/catalog.test.jsx > Week 3 catalog still works (regression) > empty and error states, and Try again 662ms
 ✓ src/__tests__/auth.test.jsx > Login page (controlled form posting to /auth/login) > posts the form to /auth/login, stores the returned JWT in localStorage and goes home 906ms
 ✓ src/__tests__/readingList.test.jsx > reading list in the whole app > the Reading list page shows the saved books, with Remove and Clear 991ms
 ✓ src/__tests__/readingList.test.jsx > reading list in the whole app > works for guests: no login needed for the reading list 57ms
 ✓ src/__tests__/catalog.test.jsx > Week 3 catalog still works (regression) > error state when the API is unreachable, and Try again recovers 271ms
 ✓ src/__tests__/readingList.test.jsx > reading list in the whole app > the detail page has the button too, and it shares the same list 158ms
 ✓ src/__tests__/catalog.test.jsx > Week 3 catalog still works (regression) > book detail page, and Book not found 177ms
 ✓ src/__tests__/catalog.test.jsx > Week 3 catalog still works (regression) > a card is one link to the detail page, and a book with no copies left says so 105ms
 ✓ src/__tests__/catalog.test.jsx > SearchBar debounce (fake timers) > calls onSearch once, 400ms after the LAST keystroke 51ms
 ✓ src/__tests__/auth.test.jsx > Login page (controlled form posting to /auth/login) > does not reload the page: e.preventDefault() is called 712ms
 ✓ src/__tests__/catalog.test.jsx > SearchBar debounce (fake timers) > typing a word fires ONE search request, not one per letter 634ms
 ✓ src/__tests__/catalog.test.jsx > apiError helper > joins the API validation messages 3ms
 ✓ src/__tests__/auth.test.jsx > Login page (controlled form posting to /auth/login) > wrong password (401): shows a clear message and stores nothing 634ms
 ✓ src/__tests__/auth.test.jsx > Login page (controlled form posting to /auth/login) > API down: says so 531ms
 ✓ src/__tests__/auth.test.jsx > Login page (controlled form posting to /auth/login) > validation errors (400) from the API are shown 208ms
 ✓ src/__tests__/auth.test.jsx > Register page (controlled form posting to /auth/register) > posts only email and password, stores the returned JWT and signs the user in 665ms
 ✓ src/__tests__/auth.test.jsx > Register page (controlled form posting to /auth/register) > mismatched passwords are caught in the browser: no request is sent 632ms
 ✓ src/__tests__/auth.test.jsx > Register page (controlled form posting to /auth/register) > a password under 8 characters is caught in the browser 481ms
 ✓ src/__tests__/auth.test.jsx > Register page (controlled form posting to /auth/register) > email already registered (409): friendly message 638ms
 ✓ src/__tests__/auth.test.jsx > ProtectedRoute (/book-space) > no token: redirects to /login 35ms
 ✓ src/__tests__/auth.test.jsx > ProtectedRoute (/book-space) > with a token: shows the booking form 51ms
 ✓ src/__tests__/auth.test.jsx > ProtectedRoute (/book-space) > after logging in, sends the user back to the page they wanted 435ms
 ✓ src/__tests__/auth.test.jsx > ProtectedRoute (/book-space) > an expired token counts as logged out, and is removed 30ms
 ✓ src/__tests__/auth.test.jsx > ProtectedRoute (/book-space) > a malformed token counts as logged out 41ms
 ✓ src/__tests__/auth.test.jsx > ProtectedRoute (/book-space) > a signed-in user visiting /login is sent away from it 72ms
 ✓ src/__tests__/auth.test.jsx > Navbar > logged out: shows Log in and Sign up 147ms
 ✓ src/__tests__/auth.test.jsx > Navbar > logged in: shows the role and Log out, which clears the token and goes home 173ms
 ✓ src/__tests__/auth.test.jsx > Navbar > stays signed in after a refresh 129ms
 ✓ src/__tests__/auth.test.jsx > Navbar > logging out of a protected page sends the user back to login when they return 178ms
 ✓ src/__tests__/spaceBooking.test.jsx > Space booking form > has a study space dropdown with a hardcoded list, plus date, start and end time inputs 395ms
 ✓ src/__tests__/spaceBooking.test.jsx > Space booking form > is a controlled form: the dropdown shows the chosen space 192ms
 ✓ src/__tests__/spaceBooking.test.jsx > Space booking form > the date picker will not offer days in the past 249ms
 ✓ src/__tests__/spaceBooking.test.jsx > Space booking form > an empty form shows an error for every field and does not submit 216ms
 ✓ src/__tests__/spaceBooking.test.jsx > Space booking form > end time must be after the start time 854ms
 ✓ src/__tests__/spaceBooking.test.jsx > Space booking form > a date in the past is rejected 1289ms
 ✓ src/__tests__/spaceBooking.test.jsx > Space booking form > a valid form shows the request back to the user, and can be reset 1218ms
 ✓ src/__tests__/spaceBooking.test.jsx > Space booking form > typing an end time equal to the start time is also rejected 1048ms

 Test Files  4 passed (4)
      Tests  61 passed (61)
   Start at  16:27:39
   Duration  90.37s (import 33%, environment 26%, transform 21%, tests 10%, setup 9%)

Environment  jsdom was created 4 times · 60.04s total, 26% of tracked time
             create it once per worker with pool: 'vmThreads' (keeps per-file isolation) or isolate: false (shares it across files)
             learn more: https://vitest.dev/guide/improving-performance#test-environments

```

### API test results (Newman, run against the live API)

```text
newman

Library Management System API

□ Auth
└ Register patron
  POST http://127.0.0.1:3000/auth/register [409 Conflict, 347B, 1390ms]
  √  201 with an access_token (or 409 if already registered)

└ Login librarian
  POST http://127.0.0.1:3000/auth/login [200 OK, 451B, 501ms]
  √  Status is 200
  √  Response has access_token

└ Login patron
  POST http://127.0.0.1:3000/auth/login [200 OK, 447B, 348ms]
  √  Status is 200

└ Register - invalid body (400)
  POST http://127.0.0.1:3000/auth/register [400 Bad Request, 410B, 10ms]
  √  Status is 400

└ Login - wrong password (401)
  POST http://127.0.0.1:3000/auth/login [401 Unauthorized, 350B, 539ms]
  √  Status is 401

□ Genres
└ List genres
  GET http://127.0.0.1:3000/genres [200 OK, 447B, 266ms]
  √  Status is 200

└ Get genre by id
  GET http://127.0.0.1:3000/genres/1 [200 OK, 330B, 644ms]
  √  Status is 200

└ Create genre (librarian)
  POST http://127.0.0.1:3000/genres [201 Created, 313B, 1464ms]
  √  Status is 201

└ Update genre (librarian)
  PATCH http://127.0.0.1:3000/genres/14 [200 OK, 318B, 1449ms]
  √  Status is 200

└ Delete genre (librarian)
  DELETE http://127.0.0.1:3000/genres/14 [200 OK, 318B, 1396ms]
  √  Status is 200

└ Delete genre in use (409)
  DELETE http://127.0.0.1:3000/genres/1 [409 Conflict, 350B, 695ms]
  √  Status is 409

└ Create genre - no token (401)
  POST http://127.0.0.1:3000/genres [401 Unauthorized, 320B, 8ms]
  √  Status is 401

└ Create genre - patron token (403)
  POST http://127.0.0.1:3000/genres [403 Forbidden, 343B, 11ms]
  √  Status is 403

□ Books
└ List books (paginated)
  GET http://127.0.0.1:3000/books?page=1&limit=10 [200 OK, 3.58kB, 1212ms]
  √  Status is 200 and body is an array
  √  limit is respected

└ Filter by genre
  GET http://127.0.0.1:3000/books?genreId=1 [200 OK, 1.59kB, 1065ms]
  √  Status is 200
  √  Every book belongs to genre 1

└ Search title or author
  GET http://127.0.0.1:3000/books?search=clean [200 OK, 581B, 807ms]
  √  Status is 200

└ Get book by id
  GET http://127.0.0.1:3000/books/1 [200 OK, 612B, 712ms]
  √  Status is 200

└ Create book (librarian)
  POST http://127.0.0.1:3000/books [201 Created, 566B, 1907ms]
  √  Status is 201
  √  availableCopies equals totalCopies

└ Update book (librarian)
  PATCH http://127.0.0.1:3000/books/27 [200 OK, 561B, 2.4s]
  √  Status is 200

└ Delete book (librarian)
  DELETE http://127.0.0.1:3000/books/27 [200 OK, 509B, 1253ms]
  √  Status is 200

└ Create book - no token (401)
  POST http://127.0.0.1:3000/books [401 Unauthorized, 320B, 5ms]
  √  Status is 401

└ Create book - patron token (403)
  POST http://127.0.0.1:3000/books [403 Forbidden, 343B, 10ms]
  √  Status is 403

└ Create book - missing title (400)
  POST http://127.0.0.1:3000/books [400 Bad Request, 382B, 8ms]
  √  Status is 400

└ Create book - missing description (400)
  POST http://127.0.0.1:3000/books [400 Bad Request, 394B, 6ms]
  √  Status is 400

└ Get missing book (404)
  GET http://127.0.0.1:3000/books/999999 [404 Not Found, 346B, 229ms]
  √  Status is 404

□ Borrow requests
└ Stock before (book 1)
  GET http://127.0.0.1:3000/books/1 [200 OK, 612B, 712ms]
  √  Status is 200

└ Create borrow request (patron)
  POST http://127.0.0.1:3000/borrow-requests [201 Created, 475B, 1291ms]
  √  Status is 201
  √  Starts as REQUESTED with no fine and no dates
  √  Keeps a snapshot of the title and author

└ Duplicate open request (409)
  POST http://127.0.0.1:3000/borrow-requests [409 Conflict, 369B, 540ms]
  √  Status is 409

└ Borrow request - no token (401)
  POST http://127.0.0.1:3000/borrow-requests [401 Unauthorized, 320B, 5ms]
  √  Status is 401

└ Borrow request - unknown book (404)
  POST http://127.0.0.1:3000/borrow-requests [404 Not Found, 346B, 313ms]
  √  Status is 404

└ Borrow request - invalid body (400)
  POST http://127.0.0.1:3000/borrow-requests [400 Bad Request, 397B, 15ms]
  √  Status is 400

└ My borrow requests (patron)
  GET http://127.0.0.1:3000/borrow-requests/mine [200 OK, 3.62kB, 576ms]
  √  Status is 200
  √  Contains the request just made

└ Patron cannot list all requests (403)
  GET http://127.0.0.1:3000/admin/borrow-requests [403 Forbidden, 343B, 10ms]
  √  Status is 403

└ Admin: list REQUESTED (librarian)
  GET http://127.0.0.1:3000/admin/borrow-requests?status=REQUESTED [200 OK, 518B, 1024ms]
  √  Status is 200
  √  Includes the new request, with the patron email and no password

└ Admin: bad status filter (400)
  GET http://127.0.0.1:3000/admin/borrow-requests?status=NOPE [400 Bad Request, 372B, 6ms]
  √  Status is 400

└ Approve (librarian)
  PATCH http://127.0.0.1:3000/admin/borrow-requests/15 [200 OK, 469B, 3.2s]
  √  Status is 200
  √  Now APPROVED

└ Stock is one lower while a copy is set aside
  GET http://127.0.0.1:3000/books/1 [200 OK, 612B, 703ms]
  √  availableCopies dropped by one

└ Invalid move APPROVED to RETURNED (409)
  PATCH http://127.0.0.1:3000/admin/borrow-requests/15 [409 Conflict, 380B, 196ms]
  √  Status is 409

└ Patron cannot update a request (403)
  PATCH http://127.0.0.1:3000/admin/borrow-requests/15 [403 Forbidden, 343B, 5ms]
  √  Status is 403

└ Hand over with a due date in the past (BORROWED)
  PATCH http://127.0.0.1:3000/admin/borrow-requests/15 [200 OK, 491B, 1359ms]
  √  Status is 200
  √  BORROWED with the due date set

└ Return it: a fineAmount sent by the client is ignored
  PATCH http://127.0.0.1:3000/admin/borrow-requests/15 [200 OK, 514B, 2.7s]
  √  Status is 200
  √  RETURNED, with a return date
  √  The SERVER charged 5 days x 10 = 50, not the 0 the client sent

└ Stock is back to what it was
  GET http://127.0.0.1:3000/books/1 [200 OK, 612B, 417ms]
  √  availableCopies restored

└ A returned request cannot change again (409)
  PATCH http://127.0.0.1:3000/admin/borrow-requests/15 [409 Conflict, 380B, 234ms]
  √  Status is 409

└ Update an unknown request (404)
  PATCH http://127.0.0.1:3000/admin/borrow-requests/999999 [404 Not Found, 356B, 252ms]
  √  Status is 404

└ Update with an invalid status (400)
  PATCH http://127.0.0.1:3000/admin/borrow-requests/15 [400 Bad Request, 435B, 7ms]
  √  Status is 400

└ Request the book again after returning it (201)
  POST http://127.0.0.1:3000/borrow-requests [201 Created, 475B, 693ms]
  √  Status is 201

└ Patron cancels their own request
  PATCH http://127.0.0.1:3000/borrow-requests/16/cancel [200 OK, 470B, 1459ms]
  √  Status is 200
  √  CANCELLED

└ Cancel it again (409)
  PATCH http://127.0.0.1:3000/borrow-requests/16/cancel [409 Conflict, 387B, 303ms]
  √  Status is 409

└ A book with borrow history cannot be deleted (409)
  DELETE http://127.0.0.1:3000/books/1 [409 Conflict, 378B, 1078ms]
  √  Status is 409

□ Spaces and bookings
└ List spaces (public)
  GET http://127.0.0.1:3000/spaces [200 OK, 441B, 437ms]
  √  Status is 200
  √  A list of spaces with a name and capacity

└ Book a space (patron)
  POST http://127.0.0.1:3000/bookings [201 Created, 469B, 3.9s]
  √  Status is 201
  √  CONFIRMED, with the space included

└ Overlapping booking: starts inside (409)
  POST http://127.0.0.1:3000/bookings [409 Conflict, 365B, 1089ms]
  √  Status is 409 Conflict
  √  Says the space is already booked

└ Overlapping booking: ends inside (409)
  POST http://127.0.0.1:3000/bookings [409 Conflict, 365B, 985ms]
  √  Status is 409

└ Overlapping booking: wraps around it (409)
  POST http://127.0.0.1:3000/bookings [409 Conflict, 365B, 1133ms]
  √  Status is 409

└ Back-to-back booking is allowed (201)
  POST http://127.0.0.1:3000/bookings [201 Created, 469B, 2.8s]
  √  Status is 201

└ Booking: end before start (400)
  POST http://127.0.0.1:3000/bookings [400 Bad Request, 370B, 8ms]
  √  Status is 400

└ Booking: date in the past (400)
  POST http://127.0.0.1:3000/bookings [400 Bad Request, 359B, 10ms]
  √  Status is 400

└ Booking: not a real date (400)
  POST http://127.0.0.1:3000/bookings [400 Bad Request, 361B, 9ms]
  √  Status is 400

└ Booking: bad time format (400)
  POST http://127.0.0.1:3000/bookings [400 Bad Request, 374B, 5ms]
  √  Status is 400

└ Booking: unknown space (404)
  POST http://127.0.0.1:3000/bookings [404 Not Found, 347B, 195ms]
  √  Status is 404

└ Booking: no token (401)
  POST http://127.0.0.1:3000/bookings [401 Unauthorized, 320B, 7ms]
  √  Status is 401

└ My bookings (patron)
  GET http://127.0.0.1:3000/bookings/mine [200 OK, 4.79kB, 691ms]
  √  Status is 200
  √  Contains the booking just made

└ Patron cannot view all bookings (403)
  GET http://127.0.0.1:3000/admin/bookings [403 Forbidden, 343B, 6ms]
  √  Status is 403

└ Admin: bookings on that day (librarian)
  GET http://127.0.0.1:3000/admin/bookings?date=2027-08-01 [200 OK, 756B, 1271ms]
  √  Status is 200
  √  Both of today's test bookings, with the patron email and the space name

└ Admin: bad date filter (400)
  GET http://127.0.0.1:3000/admin/bookings?date=tomorrow [400 Bad Request, 362B, 6ms]
  √  Status is 400

└ Cancel a booking (patron)
  PATCH http://127.0.0.1:3000/bookings/22/cancel [200 OK, 464B, 2.5s]
  √  Status is 200
  √  CANCELLED

└ Cancel it again (409)
  PATCH http://127.0.0.1:3000/bookings/22/cancel [409 Conflict, 356B, 269ms]
  √  Status is 409

└ The slot is free again after cancelling (201)
  POST http://127.0.0.1:3000/bookings [201 Created, 469B, 2.4s]
  √  Status is 201

└ A librarian can cancel any booking
  PATCH http://127.0.0.1:3000/bookings/23/cancel [200 OK, 464B, 2.3s]
  √  Status is 200
  √  CANCELLED

└ Clean up: cancel the last test booking
  PATCH http://127.0.0.1:3000/bookings/24/cancel [200 OK, 464B, 1204ms]
  √  Status is 200

└ Cancel an unknown booking (404)
  PATCH http://127.0.0.1:3000/bookings/999999/cancel [404 Not Found, 349B, 249ms]
  √  Status is 404

┌─────────────────────────┬───────────────────┬───────────────────┐
│                         │          executed │            failed │
├─────────────────────────┼───────────────────┼───────────────────┤
│              iterations │                 1 │                 0 │
├─────────────────────────┼───────────────────┼───────────────────┤
│                requests │                71 │                 0 │
├─────────────────────────┼───────────────────┼───────────────────┤
│            test-scripts │                71 │                 0 │
├─────────────────────────┼───────────────────┼───────────────────┤
│      prerequest-scripts │                 2 │                 0 │
├─────────────────────────┼───────────────────┼───────────────────┤
│              assertions │                91 │                 0 │
├─────────────────────────┴───────────────────┴───────────────────┤
│ total run duration: 1m 3.5s                                     │
├─────────────────────────────────────────────────────────────────┤
│ total data received: 22.29kB (approx)                           │
├─────────────────────────────────────────────────────────────────┤
│ average response time: 805ms [min: 5ms, max: 3.9s, s.d.: 887ms] │
└─────────────────────────────────────────────────────────────────┘
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

