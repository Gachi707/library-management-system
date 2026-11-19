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
