import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createInMemoryPrisma } from '../../test/support/in-memory-prisma';
import type { Row } from '../../test/support/in-memory-prisma';
import type { PrismaService } from '../prisma/prisma.service';
import { BookingsService } from './bookings.service';

const TODAY = '2026-11-17';

function setup() {
  const db = createInMemoryPrisma();
  const ann = db.user.insert({ email: 'ann@library.test', password: 'x' });
  const bob = db.user.insert({ email: 'bob@library.test', password: 'x' });
  const lib = db.user.insert({ email: 'lib@library.test', password: 'x', role: 'LIBRARIAN' });
  const roomA = db.space.insert({ name: 'Room A', capacity: 4 });
  const roomB = db.space.insert({ name: 'Room B', capacity: 6 });
  const service = new BookingsService(db as unknown as PrismaService);
  const slot = (over: Partial<{ spaceId: number; date: string; startTime: string; endTime: string }> = {}) => ({
    spaceId: roomA.id,
    date: '2026-11-20',
    startTime: '10:00',
    endTime: '12:00',
    ...over,
  });
  const patron = (u: Row) => ({ userId: u.id as number, role: u.role as string });
  return { db, service, ann, bob, lib, roomA, roomB, slot, patron };
}

beforeEach(() => {
  jest.useFakeTimers({
    now: new Date(`${TODAY}T09:00:00.000Z`),
    doNotFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'setImmediate', 'clearImmediate', 'nextTick', 'queueMicrotask', 'performance', 'hrtime'],
  });
});
afterEach(() => jest.useRealTimers());

describe('BookingsService.create', () => {
  it('books a free slot: CONFIRMED, owned by the caller, with the space included', async () => {
    const { service, ann, slot } = setup();
    const booking = await service.create(ann.id, slot());
    expect(booking).toMatchObject({ userId: ann.id, status: 'CONFIRMED', date: '2026-11-20', startTime: '10:00', endTime: '12:00' });
    expect(booking.space.name).toBe('Room A');
  });

  it('runs in a Serializable transaction, so concurrent bookings cannot both pass the check', async () => {
    const { db, service, ann, slot } = setup();
    const spy = jest.spyOn(db, '$transaction');
    await service.create(ann.id, slot());
    expect(spy.mock.calls[0][1]).toEqual({ isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  });

  describe('overlap check (existing booking: Room A, 10:00 to 12:00)', () => {
    it.each([
      ['the exact same slot', '10:00', '12:00', true],
      ['starts inside the existing booking', '11:00', '13:00', true],
      ['ends inside the existing booking', '09:00', '10:30', true],
      ['wraps around the existing booking', '09:00', '13:00', true],
      ['sits entirely inside it', '10:30', '11:30', true],
      ['starts the minute before it ends', '11:59', '13:00', true],
      ['ends the minute after it starts', '09:00', '10:01', true],
      ['starts exactly when it ends (back to back)', '12:00', '13:00', false],
      ['ends exactly when it starts (back to back)', '09:00', '10:00', false],
      ['entirely before it', '08:00', '09:00', false],
      ['entirely after it', '14:00', '15:00', false],
    ])('%s -> %s to %s', async (_label, startTime, endTime, shouldClash) => {
      const { service, ann, bob, slot } = setup();
      await service.create(ann.id, slot());
      const attempt = service.create(bob.id, slot({ startTime, endTime }));
      if (shouldClash) {
        await expect(attempt).rejects.toThrow('already booked');
      } else {
        await expect(attempt).resolves.toMatchObject({ status: 'CONFIRMED' });
      }
    });

    it('a different space at the same time is fine', async () => {
      const { service, ann, bob, roomB, slot } = setup();
      await service.create(ann.id, slot());
      await expect(service.create(bob.id, slot({ spaceId: roomB.id }))).resolves.toBeDefined();
    });

    it('the same time on a different day is fine', async () => {
      const { service, ann, bob, slot } = setup();
      await service.create(ann.id, slot());
      await expect(service.create(bob.id, slot({ date: '2026-11-21' }))).resolves.toBeDefined();
    });

    it('a CANCELLED booking no longer blocks the slot', async () => {
      const { db, service, ann, bob, slot } = setup();
      const first = await service.create(ann.id, slot());
      db.booking.rows.find((b) => b.id === first.id)!.status = 'CANCELLED';
      await expect(service.create(bob.id, slot())).resolves.toMatchObject({ status: 'CONFIRMED' });
    });

    it('the conflict is a 409 and nothing extra is saved', async () => {
      const { db, service, ann, bob, slot } = setup();
      await service.create(ann.id, slot());
      await expect(service.create(bob.id, slot())).rejects.toBeInstanceOf(ConflictException);
      expect(db.booking.rows).toHaveLength(1);
    });
  });

  describe('input checks', () => {
    it.each([
      ['the end is before the start', { startTime: '12:00', endTime: '10:00' }],
      ['the end equals the start', { startTime: '10:00', endTime: '10:00' }],
    ])('400 when %s', async (_label, over) => {
      const { service, ann, slot } = setup();
      await expect(service.create(ann.id, slot(over))).rejects.toThrow('end time must be after');
    });

    it('400 for a date in the past', async () => {
      const { service, ann, slot } = setup();
      await expect(service.create(ann.id, slot({ date: '2026-11-16' }))).rejects.toThrow('cannot be in the past');
    });

    it('today is allowed', async () => {
      const { service, ann, slot } = setup();
      await expect(service.create(ann.id, slot({ date: TODAY }))).resolves.toBeDefined();
    });

    it.each(['2026-02-30', '2026-13-01', '2026-00-10', '2026-04-31'])('400 for %s, which is not a real day', async (date) => {
      const { service, ann, slot } = setup();
      await expect(service.create(ann.id, slot({ date }))).rejects.toBeInstanceOf(BadRequestException);
    });

    it('404 for a space that does not exist, and nothing is saved', async () => {
      const { db, service, ann, slot } = setup();
      await expect(service.create(ann.id, slot({ spaceId: 999 }))).rejects.toBeInstanceOf(NotFoundException);
      expect(db.booking.rows).toHaveLength(0);
    });
  });

  it('turns a database serialization failure (two bookings at the same instant) into a friendly 409', async () => {
    const { db, service, ann, slot } = setup();
    const failure = new Prisma.PrismaClientKnownRequestError('write conflict', { code: 'P2034', clientVersion: 'test' });
    jest.spyOn(db, '$transaction').mockRejectedValueOnce(failure);
    await expect(service.create(ann.id, slot())).rejects.toThrow('Please try again');
  });

  it('lets other database errors through untouched', async () => {
    const { db, service, ann, slot } = setup();
    jest.spyOn(db, '$transaction').mockRejectedValueOnce(new Error('connection lost'));
    await expect(service.create(ann.id, slot())).rejects.toThrow('connection lost');
  });
});

describe('BookingsService.cancel', () => {
  it('a patron cancels their own booking, and the slot can be booked again', async () => {
    const { service, ann, bob, slot, patron } = setup();
    const booking = await service.create(ann.id, slot());
    await expect(service.cancel(patron(ann), booking.id)).resolves.toMatchObject({ status: 'CANCELLED' });
    await expect(service.create(bob.id, slot())).resolves.toBeDefined();
  });

  it('a librarian can cancel anyone\'s booking', async () => {
    const { service, ann, lib, slot, patron } = setup();
    const booking = await service.create(ann.id, slot());
    await expect(service.cancel(patron(lib), booking.id)).resolves.toMatchObject({ status: 'CANCELLED' });
  });

  it("another patron cannot cancel it: it looks like it does not exist (404)", async () => {
    const { db, service, ann, bob, slot, patron } = setup();
    const booking = await service.create(ann.id, slot());
    await expect(service.cancel(patron(bob), booking.id)).rejects.toBeInstanceOf(NotFoundException);
    expect(db.booking.rows[0].status).toBe('CONFIRMED');
  });

  it('409 when it is already cancelled', async () => {
    const { service, ann, slot, patron } = setup();
    const booking = await service.create(ann.id, slot());
    await service.cancel(patron(ann), booking.id);
    await expect(service.cancel(patron(ann), booking.id)).rejects.toBeInstanceOf(ConflictException);
  });

  it('404 for a booking that does not exist', async () => {
    const { service, ann, patron } = setup();
    await expect(service.cancel(patron(ann), 999)).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('BookingsService: lists', () => {
  it('findMine returns only the caller\'s bookings, soonest first, with the space', async () => {
    const { service, ann, bob, slot } = setup();
    const later = await service.create(ann.id, slot({ date: '2026-11-25' }));
    const sooner = await service.create(ann.id, slot({ date: '2026-11-20', startTime: '15:00', endTime: '16:00' }));
    await service.create(bob.id, slot({ date: '2026-11-22' }));
    const mine = await service.findMine(ann.id);
    expect(mine.map((b) => b.id)).toEqual([sooner.id, later.id]);
    expect(mine[0].space.name).toBe('Room A');
  });

  it('findAll (librarian) shows everyone\'s bookings with the patron\'s email, and can filter by date', async () => {
    const { service, ann, bob, slot } = setup();
    await service.create(ann.id, slot({ date: '2026-11-20' }));
    await service.create(bob.id, slot({ date: '2026-11-22' }));
    const all = await service.findAll();
    expect(all.map((b) => b.user.email)).toEqual(['ann@library.test', 'bob@library.test']);
    const oneDay = await service.findAll('2026-11-22');
    expect(oneDay).toHaveLength(1);
    expect(oneDay[0].user.email).toBe('bob@library.test');
    expect(Object.keys(oneDay[0].user).sort()).toEqual(['email', 'id']);
  });

  it('findSpaces lists the spaces in id order', async () => {
    const { service, roomA, roomB } = setup();
    expect((await service.findSpaces()).map((s) => s.id)).toEqual([roomA.id, roomB.id]);
  });
});
