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
