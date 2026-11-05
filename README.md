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