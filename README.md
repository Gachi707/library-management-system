# Library Management System

A full-stack library system built with React, NestJS, PostgreSQL and Prisma.

## Setup (api)

1. `cd api && npm install`
2. Copy `.env.example` to `.env` and set your `DATABASE_URL`
3. `npx prisma migrate dev`
4. `npx prisma db seed`
5. `npm run start:dev`

## Schema Decisions

**Why Book references Genre instead of embedding it.**
Each Book stores a `genreId` foreign key pointing to a row in the Genre
table, rather than a copy of the genre's name inside every book.

- **One source of truth:** the genre name lives in one place. Renaming
  "Science" updates once, not across every science book.
- **No inconsistency:** copies like "Sci-Fi", "SciFi" and "Science Fiction"
  can't drift apart across books.
- **Integrity enforced by the database:** the foreign key stops a book
  from pointing at a genre that doesn't exist.
- **Simple queries:** listing all books in a genre, or listing genres on
  their own, is a straightforward relation query.
- **Ready for later weeks:** `totalCopies` and `availableCopies` are
  already on Book for the borrowing logic.

Users have a `Role` enum (PATRON or LIBRARIAN) so access control can be
added in Week 2.