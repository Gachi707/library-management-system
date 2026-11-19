# Library API (NestJS, Prisma, PostgreSQL)

The backend for the library system. Weeks 1 and 2 built the catalog and authentication. Week 5 adds the transactional core: **borrow requests** with a status lifecycle and fines, and **space bookings** that can never overlap.

## Run it

1. `cd api && npm install`
2. Copy `.env.example` to `.env` and set `DATABASE_URL` and `JWT_SECRET`
3. `npx prisma migrate dev` (creates the tables), then `npx prisma db seed` (genres, books, study spaces and a dev librarian)
4. `npm run start:dev`
5. Tests: `npm test` (no database needed)

## Endpoints added in Week 5

| Method and path | Who | What it does |
|---|---|---|
| `POST /borrow-requests` | any logged-in user | Ask to borrow a book: body `{ "bookId": 1 }`. Starts as `REQUESTED` |
| `GET /borrow-requests/mine` | any logged-in user | My requests, newest first |
| `PATCH /borrow-requests/:id/cancel` | the owner | Withdraw a request that has not been collected |
| `GET /admin/borrow-requests?status=` | librarian | Everyone's requests, optionally one status |
| `PATCH /admin/borrow-requests/:id` | librarian | Move a request to its next status: `{ "status": "APPROVED" }` |
| `GET /spaces` | public | The study spaces |
| `POST /bookings` | any logged-in user | Book a space: `{ spaceId, date, startTime, endTime }`. `409` if it overlaps |
| `GET /bookings/mine` | any logged-in user | My bookings |
| `PATCH /bookings/:id/cancel` | the owner, or a librarian | Cancel a booking |
| `GET /admin/bookings?date=` | librarian | Every booking, optionally one day |

## The borrow-request lifecycle

```text
REQUESTED --approve--> APPROVED --hand over--> BORROWED --return--> RETURNED
    |                     |                       |  ^
    '-----cancel/decline--'-> CANCELLED           |  '-- return --- OVERDUE
                                                  '--- past due date ---^
```

- Only the moves drawn above are allowed. Anything else is `409 Conflict`, and nothing changes.
- **Stock:** approving sets one copy aside (`availableCopies - 1`, and refused when none are left). Returning or cancelling an approved request puts it back. The stock change and the status change happen in one database transaction, so they succeed or fail together.
- **Fines:** when a book is returned, `calculateFine(dueDate, returnDate)` charges 10 per day, counting any started day as a full day. The fine is worked out on the server from the stored due date. A `fineAmount` sent by a client is never used.
- **Who is who:** the patron's id always comes from the verified JWT, never from the request body. `status`, dates and fines cannot be set by a patron.
- A patron may have only one open request per book. Each request keeps a snapshot of the book's title and author.

## Space bookings

- Two bookings of the same space on the same day overlap exactly when each one starts before the other ends. The check is a single Prisma query: `startTime < newEnd` and `endTime > newStart`, only counting `CONFIRMED` bookings. A booking that ends at 12:00 does not clash with one that starts at 12:00.
- The check and the insert run in a **Serializable** transaction, so two people booking at the same instant cannot both succeed.
- Cancelled bookings free the slot again. Dates are `YYYY-MM-DD` and times are 24-hour `HH:MM`; the end must be after the start and the date cannot be in the past.

## Design decisions

- `BorrowRequest` keeps `bookTitle` and `bookAuthor`, so history still reads correctly if the catalog entry changes. A book that has borrow requests cannot be deleted (`409`), because the foreign key protects the history.
- Declining a request is a move to `CANCELLED`; there is no separate status for it.
- Librarian routes sit under `/admin/...` and use `JwtAuthGuard` first, then `RolesGuard`.

## Files in this folder

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
api/.env.example
api/.gitattributes
api/.gitignore
api/.oxlintrc.json
api/.prettierrc
api/AGENTS.md
api/README.md
api/jest.config.ts
api/nest-cli.json
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
```

## Automated test results

_Output of `cd api && npm test`, saved by `scripts/run-api-tests.sh`._

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

## Source code

_Generated from the real files by `scripts/update-readme.sh`._

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

### api/src/borrow-requests/borrow-requests.controller.ts

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

### api/src/borrow-requests/borrow-requests.service.ts

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

### api/src/borrow-requests/borrow-requests.module.ts

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

### api/src/borrow-requests/dto/create-borrow-request.dto.ts

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

### api/src/borrow-requests/fine-calculator.ts

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

### api/src/borrow-requests/fine-calculator.spec.ts

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

### api/src/bookings/bookings.controller.ts

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

### api/src/bookings/bookings.service.ts

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

### api/src/bookings/bookings.module.ts

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

### api/src/bookings/dto/create-booking.dto.ts

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

### api/src/auth/current-user.decorator.ts

```ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// What JwtStrategy.validate() puts on req.user
export interface AuthUser {
  userId: number;
  role: string;
}

// Use as @CurrentUser() user: AuthUser. The caller's id always comes from the verified JWT,
// never from the request body, so a patron cannot act as someone else.
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthUser => {
  return ctx.switchToHttp().getRequest().user;
});
```

### api/src/borrow-requests/dto/update-borrow-request.dto.ts

```ts
import { BorrowStatus } from '@prisma/client';
import { IsEnum, IsISO8601, IsOptional } from 'class-validator';

// What a librarian can send. There is deliberately NO fineAmount here: the server works the fine out.
export class UpdateBorrowRequestDto {
  @IsEnum(BorrowStatus)
  status: BorrowStatus;

  // Optional, and only meaningful when marking a request BORROWED (default: 14 days from now)
  @IsOptional()
  @IsISO8601()
  dueDate?: string;
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

    // Ask first, exactly as GenresService does, so the answer never depends on how the database words its refusal
    const history = await this.prisma.borrowRequest.count({ where: { bookId: id } });
    if (history > 0) {
      throw new ConflictException('This book has borrow requests, so it cannot be deleted');
    }

    try {
      return await this.prisma.book.delete({ where: { id } });
    } catch (e) {
      // Backstop for a request that slips in between the check above and the delete
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        (e.code === 'P2003' || e.code === 'P2014')
      ) {
        throw new ConflictException('This book has borrow requests, so it cannot be deleted');
      }
      throw e;
    }
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

// Same order and names as the booking form on the client, so their ids line up (1 to 4)
const spaces = [
  { name: 'Room A', capacity: 4 },
  { name: 'Room B', capacity: 6 },
  { name: 'Quiet Study Pod', capacity: 1 },
  { name: 'Group Study Hall', capacity: 12 },
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

  for (const space of spaces) {
    await prisma.space.upsert({
      where: { name: space.name },
      update: {},
      create: space,
    });
  }

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
  console.log('Seeding complete: 4 genres, 16 books, 4 spaces, 1 librarian');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
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

### api/prisma/migrations/20261119104237_add_transactions/migration.sql

```sql
-- CreateEnum
CREATE TYPE "BorrowStatus" AS ENUM ('REQUESTED', 'APPROVED', 'BORROWED', 'RETURNED', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('CONFIRMED', 'CANCELLED');

-- CreateTable
CREATE TABLE "BorrowRequest" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,
    "bookTitle" TEXT NOT NULL,
    "bookAuthor" TEXT NOT NULL,
    "status" "BorrowStatus" NOT NULL DEFAULT 'REQUESTED',
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "returnDate" TIMESTAMP(3),
    "fineAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "BorrowRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Space" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,

    CONSTRAINT "Space_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "spaceId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BorrowRequest_userId_idx" ON "BorrowRequest"("userId");

-- CreateIndex
CREATE INDEX "BorrowRequest_status_idx" ON "BorrowRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Space_name_key" ON "Space"("name");

-- CreateIndex
CREATE INDEX "Booking_spaceId_date_idx" ON "Booking"("spaceId", "date");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- AddForeignKey
ALTER TABLE "BorrowRequest" ADD CONSTRAINT "BorrowRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BorrowRequest" ADD CONSTRAINT "BorrowRequest_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

