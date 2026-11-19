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
