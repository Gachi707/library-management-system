# Library Management System

A full-stack library management system built with React, NestJS, PostgreSQL and Prisma. This repository currently contains the Week 1 backend foundation: the database schema, the Prisma service and seed data.

## Project Structure

```
library-management-system/
├── api/                  # NestJS backend
│   ├── prisma/
│   │   ├── schema.prisma # Data models (User, Genre, Book, Role enum)
│   │   ├── seed.ts       # Sample data: 4 genres, 16 books
│   │   └── migrations/
│   └── src/prisma/       # PrismaService and PrismaModule
└── README.md
```

## Setup (api)

1. `cd api && npm install`
2. Copy `.env.example` to `.env` and set your own `DATABASE_URL`
3. `npx prisma migrate dev`
4. `npx prisma db seed`
5. `npm run start:dev`

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

The User model has a `Role` enum with two values, `PATRON` and `LIBRARIAN`, defaulting to `PATRON`. This prepares the system for role-based access control in Week 2.

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
  console.log('Seeding complete: 4 genres, 16 books');
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

<!-- REQUIRED-FILES:END -->
