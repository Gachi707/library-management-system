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
