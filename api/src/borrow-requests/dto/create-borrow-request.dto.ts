import { IsInt, Min } from 'class-validator';

// The patron only says WHICH book. Everything else (who they are, the status, the dates, the fine)
// is set by the server, and whitelist: true strips anything else they send.
export class CreateBorrowRequestDto {
  @IsInt()
  @Min(1)
  bookId: number;
}
