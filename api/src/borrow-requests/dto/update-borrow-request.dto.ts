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
