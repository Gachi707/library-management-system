import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { createInMemoryPrisma } from '../../test/support/in-memory-prisma';
import type { Row } from '../../test/support/in-memory-prisma';
import type { PrismaService } from '../prisma/prisma.service';
import { BorrowRequestsService, LOAN_DAYS } from './borrow-requests.service';

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-11-17T09:00:00.000Z');

function setup(copies = 2) {
  const db = createInMemoryPrisma();
  const ann = db.user.insert({ email: 'ann@library.test', password: 'x' });
  const bob = db.user.insert({ email: 'bob@library.test', password: 'x' });
  const book = db.book.insert({
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '9780132350884',
    description: 'd',
    totalCopies: 2,
    availableCopies: copies,
    genreId: 1,
  });
  const service = new BorrowRequestsService(db as unknown as PrismaService);
  const stock = () => db.book.rows.find((b) => b.id === book.id)!.availableCopies as number;
  const stored = (id: number) => db.borrowRequest.rows.find((r) => r.id === id)!;
  // a request already sitting in some status, as if earlier steps had happened
  const requestIn = (status: string, extra: Row = {}, userId = ann.id) =>
    db.borrowRequest.insert({ userId, bookId: book.id, bookTitle: book.title, bookAuthor: book.author, status, ...extra });
  return { db, service, ann, bob, book, stock, stored, requestIn };
}

beforeEach(() => {
  // Freeze only the clock (Date), so every date in these tests is exact
  jest.useFakeTimers({
    now: NOW,
    doNotFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'setImmediate', 'clearImmediate', 'nextTick', 'queueMicrotask', 'performance', 'hrtime'],
  });
});
afterEach(() => jest.useRealTimers());

describe('BorrowRequestsService.create', () => {
  it('starts as REQUESTED and keeps a snapshot of the book title and author', async () => {
    const { service, ann, book } = setup();
    const request = await service.create(ann.id, { bookId: book.id });
    expect(request).toMatchObject({
      userId: ann.id,
      bookId: book.id,
      bookTitle: 'Clean Code',
      bookAuthor: 'Robert C. Martin',
      status: 'REQUESTED',
      dueDate: null,
      returnDate: null,
      fineAmount: 0,
    });
  });

  it('does not touch the stock: only an approval sets a copy aside', async () => {
    const { service, ann, book, stock } = setup();
    await service.create(ann.id, { bookId: book.id });
    expect(stock()).toBe(2);
  });

  it('404 for a book that does not exist', async () => {
    const { service, ann } = setup();
    await expect(service.create(ann.id, { bookId: 999 })).rejects.toBeInstanceOf(NotFoundException);
  });

  it.each(['REQUESTED', 'APPROVED', 'BORROWED', 'OVERDUE'])(
    '409 when the patron already has an open request that is %s',
    async (status) => {
      const { service, ann, book, requestIn } = setup();
      requestIn(status);
      await expect(service.create(ann.id, { bookId: book.id })).rejects.toBeInstanceOf(ConflictException);
    },
  );

  it.each(['RETURNED', 'CANCELLED'])('can request again once the earlier request is %s', async (status) => {
    const { service, ann, book, requestIn } = setup();
    requestIn(status);
    await expect(service.create(ann.id, { bookId: book.id })).resolves.toMatchObject({ status: 'REQUESTED' });
  });

  it('a different patron can request the same book', async () => {
    const { service, bob, book, requestIn } = setup();
    requestIn('REQUESTED'); // Ann's
    await expect(service.create(bob.id, { bookId: book.id })).resolves.toMatchObject({ userId: bob.id });
  });
});

describe('BorrowRequestsService.update: the lifecycle, stock and fines', () => {
  it('APPROVED sets a copy aside', async () => {
    const { service, stock, requestIn } = setup();
    const r = requestIn('REQUESTED');
    await expect(service.update(r.id, { status: 'APPROVED' })).resolves.toMatchObject({ status: 'APPROVED' });
    expect(stock()).toBe(1);
  });

  it('cannot approve when no copies are left, and nothing changes', async () => {
    const { service, stock, stored, requestIn } = setup(0);
    const r = requestIn('REQUESTED');
    await expect(service.update(r.id, { status: 'APPROVED' })).rejects.toThrow('No copies');
    expect(stored(r.id).status).toBe('REQUESTED');
    expect(stock()).toBe(0);
  });

  it('two requests, one copy left: the first approval wins, the second is refused', async () => {
    const { service, bob, stock, stored, requestIn } = setup(1);
    const first = requestIn('REQUESTED');
    const second = requestIn('REQUESTED', {}, bob.id);
    await service.update(first.id, { status: 'APPROVED' });
    await expect(service.update(second.id, { status: 'APPROVED' })).rejects.toBeInstanceOf(ConflictException);
    expect(stored(second.id).status).toBe('REQUESTED');
    expect(stock()).toBe(0);
  });

  it('is all-or-nothing: if the status change fails, the stock change is undone', async () => {
    const { db, service, stock, requestIn } = setup();
    const r = requestIn('REQUESTED');
    // someone else changed the request between our read and our write
    jest.spyOn(db.borrowRequest, 'updateMany').mockResolvedValueOnce({ count: 0 });
    await expect(service.update(r.id, { status: 'APPROVED' })).rejects.toThrow('changed by someone else');
    expect(stock()).toBe(2); // the decrement was rolled back
  });

  it(`BORROWED sets the due date ${LOAN_DAYS} days ahead by default`, async () => {
    const { service, requestIn } = setup();
    const r = requestIn('APPROVED');
    const updated = await service.update(r.id, { status: 'BORROWED' });
    expect(updated.dueDate).toEqual(new Date(NOW.getTime() + LOAN_DAYS * DAY));
  });

  it('BORROWED accepts a librarian-chosen due date, and does not change the stock', async () => {
    const { service, stock, requestIn } = setup();
    const r = requestIn('APPROVED');
    const updated = await service.update(r.id, { status: 'BORROWED', dueDate: '2026-12-01T00:00:00.000Z' });
    expect(updated.dueDate).toEqual(new Date('2026-12-01T00:00:00.000Z'));
    expect(stock()).toBe(2);
  });

  it('a due date is refused for any status except BORROWED', async () => {
    const { service, requestIn } = setup();
    const r = requestIn('REQUESTED');
    await expect(service.update(r.id, { status: 'APPROVED', dueDate: '2026-12-01T00:00:00.000Z' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('a due date on the wrong status is a 400 even when the move itself would also be refused', async () => {
    const { service, requestIn } = setup();
    const already = requestIn('APPROVED');
    // APPROVED -> APPROVED is not a legal move, but the malformed input is reported first
    await expect(service.update(already.id, { status: 'APPROVED', dueDate: '2026-12-01T00:00:00.000Z' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('RETURNED on time: no fine, the copy goes back on the shelf', async () => {
    const { service, stock, requestIn } = setup(1);
    const r = requestIn('BORROWED', { dueDate: new Date(NOW.getTime() + 3 * DAY) });
    const updated = await service.update(r.id, { status: 'RETURNED' });
    expect(updated).toMatchObject({ status: 'RETURNED', fineAmount: 0 });
    expect(updated.returnDate).toEqual(NOW);
    expect(stock()).toBe(2);
  });

  it('RETURNED late: the fine is worked out from the stored due date (4.5 days late = 5 days x 10)', async () => {
    const { service, requestIn } = setup(1);
    const r = requestIn('BORROWED', { dueDate: new Date(NOW.getTime() - 4.5 * DAY) });
    await expect(service.update(r.id, { status: 'RETURNED' })).resolves.toMatchObject({ fineAmount: 50 });
  });

  it('ignores a fineAmount sent by the client', async () => {
    const { service, requestIn } = setup(1);
    const late = requestIn('BORROWED', { dueDate: new Date(NOW.getTime() - 4.5 * DAY) });
    const onTime = requestIn('BORROWED', { dueDate: new Date(NOW.getTime() + DAY) });
    const cheat = (id: number, fineAmount: number) =>
      service.update(id, { status: 'RETURNED', fineAmount } as never); // not part of the DTO: a client could still send it
    await expect(cheat(late.id, 0)).resolves.toMatchObject({ fineAmount: 50 });
    await expect(cheat(onTime.id, 9999)).resolves.toMatchObject({ fineAmount: 0 });
  });

  it('OVERDUE is only allowed once the due date has passed', async () => {
    const { service, requestIn } = setup();
    const notYet = requestIn('BORROWED', { dueDate: new Date(NOW.getTime() + DAY) });
    await expect(service.update(notYet.id, { status: 'OVERDUE' })).rejects.toThrow('not past its due date');
    const past = requestIn('BORROWED', { dueDate: new Date(NOW.getTime() - DAY) });
    await expect(service.update(past.id, { status: 'OVERDUE' })).resolves.toMatchObject({ status: 'OVERDUE' });
  });

  it('OVERDUE keeps the copy held, then RETURNED charges the fine and frees it', async () => {
    const { service, stock, requestIn } = setup(1);
    const r = requestIn('BORROWED', { dueDate: new Date(NOW.getTime() - 2.2 * DAY) });
    await service.update(r.id, { status: 'OVERDUE' });
    expect(stock()).toBe(1);
    await expect(service.update(r.id, { status: 'RETURNED' })).resolves.toMatchObject({ fineAmount: 30 });
    expect(stock()).toBe(2);
  });

  it('CANCELLED from APPROVED gives the held copy back; from REQUESTED the stock is untouched', async () => {
    const { service, stock, requestIn } = setup(1);
    const approved = requestIn('APPROVED');
    await service.update(approved.id, { status: 'CANCELLED' });
    expect(stock()).toBe(2);
    const requested = requestIn('REQUESTED');
    await service.update(requested.id, { status: 'CANCELLED' });
    expect(stock()).toBe(2);
  });

  it('runs the whole journey and ends with the stock where it started', async () => {
    const { service, ann, book, stock } = setup();
    const { id } = await service.create(ann.id, { bookId: book.id });
    await service.update(id, { status: 'APPROVED' });
    expect(stock()).toBe(1);
    await service.update(id, { status: 'BORROWED' });
    await service.update(id, { status: 'RETURNED' });
    expect(stock()).toBe(2);
  });

  it.each([
    ['REQUESTED', 'REQUESTED'],
    ['REQUESTED', 'BORROWED'],
    ['REQUESTED', 'RETURNED'],
    ['REQUESTED', 'OVERDUE'],
    ['APPROVED', 'RETURNED'],
    ['APPROVED', 'OVERDUE'],
    ['BORROWED', 'APPROVED'],
    ['BORROWED', 'CANCELLED'],
    ['OVERDUE', 'BORROWED'],
    ['RETURNED', 'BORROWED'],
    ['RETURNED', 'CANCELLED'],
    ['CANCELLED', 'APPROVED'],
  ])('refuses the move %s -> %s and leaves everything unchanged', async (from, to) => {
    const { service, stock, stored, requestIn } = setup();
    const r = requestIn(from, { dueDate: new Date(NOW.getTime() - DAY) });
    await expect(service.update(r.id, { status: to as never })).rejects.toBeInstanceOf(ConflictException);
    expect(stored(r.id).status).toBe(from);
    expect(stock()).toBe(2);
  });

  it('404 for a request that does not exist', async () => {
    const { service } = setup();
    await expect(service.update(999, { status: 'APPROVED' })).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('BorrowRequestsService.cancelOwn (the patron withdraws a request)', () => {
  it('cancels the patron\'s own REQUESTED request', async () => {
    const { service, ann, requestIn } = setup();
    const r = requestIn('REQUESTED');
    await expect(service.cancelOwn(ann.id, r.id)).resolves.toMatchObject({ status: 'CANCELLED' });
  });

  it('cancelling an APPROVED request gives the held copy back', async () => {
    const { service, ann, stock, requestIn } = setup(1);
    const r = requestIn('APPROVED');
    await service.cancelOwn(ann.id, r.id);
    expect(stock()).toBe(2);
  });

  it("someone else's request looks like it does not exist (404)", async () => {
    const { service, bob, stored, requestIn } = setup();
    const r = requestIn('REQUESTED'); // Ann's
    await expect(service.cancelOwn(bob.id, r.id)).rejects.toBeInstanceOf(NotFoundException);
    expect(stored(r.id).status).toBe('REQUESTED');
  });

  it.each(['BORROWED', 'OVERDUE', 'RETURNED', 'CANCELLED'])('cannot cancel a request that is already %s', async (status) => {
    const { service, ann, requestIn } = setup();
    const r = requestIn(status);
    await expect(service.cancelOwn(ann.id, r.id)).rejects.toBeInstanceOf(ConflictException);
  });
});

describe('BorrowRequestsService: lists', () => {
  it('findMine returns only the caller\'s requests, newest first', async () => {
    const { service, ann, requestIn } = setup();
    const old = requestIn('RETURNED', { requestDate: new Date('2026-10-01T00:00:00Z') });
    const recent = requestIn('REQUESTED', { requestDate: new Date('2026-11-10T00:00:00Z') });
    requestIn('REQUESTED', {}, 999); // someone else's
    const mine = await service.findMine(ann.id);
    expect(mine.map((r) => r.id)).toEqual([recent.id, old.id]);
  });

  it('findAll lists everyone\'s requests with the patron\'s email, and can filter by status', async () => {
    const { service, bob, requestIn } = setup();
    requestIn('REQUESTED');
    requestIn('APPROVED', {}, bob.id);
    const all = await service.findAll();
    expect(all).toHaveLength(2);
    expect(all.map((r) => r.user.email).sort()).toEqual(['ann@library.test', 'bob@library.test']);
    const approved = await service.findAll('APPROVED');
    expect(approved).toHaveLength(1);
    expect(approved[0].user.email).toBe('bob@library.test');
  });

  it('findAll never exposes the patron\'s password', async () => {
    const { service, requestIn } = setup();
    requestIn('REQUESTED');
    const [row] = await service.findAll();
    expect(Object.keys(row.user).sort()).toEqual(['email', 'id']);
  });
});
