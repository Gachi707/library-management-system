/* A tiny in-memory stand-in for PrismaService, used by the unit tests so they run with no database.
 *
 * It evaluates the same `where` clauses the services build (equals, in, lt, gt, OR ...), so a test
 * fails if a query is wrong. It refuses any operator it does not understand, so a test can never pass
 * just because the fake quietly ignored part of a query. Transactions roll back when they throw.
 */
import { Prisma } from '@prisma/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;

const knownError = (code: string, message: string) =>
  new Prisma.PrismaClientKnownRequestError(message, { code, clientVersion: 'test' });

const asComparable = (v: unknown) => (v instanceof Date ? v.getTime() : v);

export function matches(row: Row, where: Row = {}): boolean {
  return Object.entries(where).every(([key, condition]) => {
    if (key === 'AND') return (condition as Row[]).every((w) => matches(row, w));
    if (key === 'OR') return (condition as Row[]).some((w) => matches(row, w));

    const value = asComparable(row[key]) as never;
    if (condition !== null && typeof condition === 'object' && !(condition instanceof Date)) {
      return Object.entries(condition as Row).every(([op, raw]) => {
        const expected = asComparable(raw) as never;
        switch (op) {
          case 'equals':
            return value === expected;
          case 'not':
            return value !== expected;
          case 'in':
            return (raw as unknown[]).map(asComparable).includes(value);
          case 'notIn':
            return !(raw as unknown[]).map(asComparable).includes(value);
          case 'lt':
            return value < expected;
          case 'lte':
            return value <= expected;
          case 'gt':
            return value > expected;
          case 'gte':
            return value >= expected;
          case 'contains':
            return String(value).toLowerCase().includes(String(raw).toLowerCase());
          case 'mode':
            return true; // only ever used with contains, which is compared case-insensitively above
          default:
            throw new Error(`in-memory Prisma: unsupported operator "${op}" on "${key}"`);
        }
      });
    }
    return value === asComparable(condition);
  });
}

function sortRows(rows: Row[], orderBy?: Row | Row[]): Row[] {
  const rules = (Array.isArray(orderBy) ? orderBy : orderBy ? [orderBy] : []).flatMap((r) => Object.entries(r));
  if (rules.length === 0) return rows;
  return [...rows].sort((a, b) => {
    for (const [field, direction] of rules) {
      const x = asComparable(a[field]) as never;
      const y = asComparable(b[field]) as never;
      if (x === y) continue;
      return (x < y ? -1 : 1) * (direction === 'desc' ? -1 : 1);
    }
    return 0;
  });
}

type Resolver = (row: Row, arg: unknown) => unknown;

export class Table {
  rows: Row[] = [];
  nextId = 1;

  constructor(
    private defaults: () => Row = () => ({}),
    private unique: string[] = [],
    private relations: Record<string, Resolver> = {},
  ) {}

  /** Test helper: put a row in directly (no query involved) and get it back */
  insert(data: Row): Row {
    const row = { id: this.nextId++, ...this.defaults(), ...data };
    this.assertUnique(row);
    this.rows.push(row);
    return row;
  }

  private assertUnique(candidate: Row, ignoreId?: number) {
    for (const field of this.unique) {
      if (this.rows.some((r) => r.id !== ignoreId && r[field] === candidate[field])) {
        throw knownError('P2002', `Unique constraint failed on the fields: (${field})`);
      }
    }
  }

  private applyInclude(row: Row, include?: Row): Row {
    const copy = structuredClone(row);
    for (const [key, arg] of Object.entries(include ?? {})) {
      if (arg === false) continue;
      const resolve = this.relations[key];
      if (!resolve) throw new Error(`in-memory Prisma: unsupported include "${key}"`);
      let value = resolve(row, arg) as Row | null;
      const select = (arg as Row | undefined)?.select;
      if (value && select && key !== '_count') {
        value = Object.fromEntries(Object.keys(select).map((k) => [k, (value as Row)[k]]));
      }
      copy[key] = value === null ? null : structuredClone(value);
    }
    return copy;
  }

  private find(where?: Row) {
    return this.rows.find((r) => matches(r, where));
  }

  async findMany(args: Row = {}) {
    let rows = sortRows(this.rows.filter((r) => matches(r, args.where)), args.orderBy);
    if (args.skip) rows = rows.slice(args.skip);
    if (args.take !== undefined) rows = rows.slice(0, args.take);
    return rows.map((r) => this.applyInclude(r, args.include));
  }
  async findFirst(args: Row = {}) {
    const [first] = await this.findMany({ ...args, take: 1 });
    return first ?? null;
  }
  async findUnique(args: Row) {
    const row = this.find(args.where);
    return row ? this.applyInclude(row, args.include) : null;
  }
  async findUniqueOrThrow(args: Row) {
    const row = await this.findUnique(args);
    if (!row) throw knownError('P2025', 'No record was found');
    return row;
  }
  async count(args: Row = {}) {
    return this.rows.filter((r) => matches(r, args.where)).length;
  }
  async create(args: Row) {
    return this.applyInclude(this.insert(args.data), args.include);
  }

  private applyData(row: Row, data: Row) {
    for (const [field, value] of Object.entries(data)) {
      if (value && typeof value === 'object' && !(value instanceof Date)) {
        const op = value as Row;
        if ('increment' in op) row[field] += op.increment;
        else if ('decrement' in op) row[field] -= op.decrement;
        else throw new Error(`in-memory Prisma: unsupported update operator on "${field}"`);
      } else {
        row[field] = value;
      }
    }
  }
  async update(args: Row) {
    const row = this.find(args.where);
    if (!row) throw knownError('P2025', 'Record to update not found');
    const next = { ...row };
    this.applyData(next, args.data);
    this.assertUnique(next, row.id);
    Object.assign(row, next);
    return this.applyInclude(row, args.include);
  }
  async updateMany(args: Row) {
    const hit = this.rows.filter((r) => matches(r, args.where));
    hit.forEach((r) => this.applyData(r, args.data));
    return { count: hit.length };
  }
  async delete(args: Row) {
    const row = this.find(args.where);
    if (!row) throw knownError('P2025', 'Record to delete does not exist');
    this.beforeDelete?.(row);
    this.rows.splice(this.rows.indexOf(row), 1);
    return structuredClone(row);
  }
  /** Set by the database to model foreign keys that block deletes */
  beforeDelete?: (row: Row) => void;
}

export function createInMemoryPrisma() {
  const user = new Table(() => ({ role: 'PATRON' }), ['email']);
  const genre = new Table(() => ({}), ['name', 'slug'], {
    _count: (row) => ({ books: book.rows.filter((b) => b.genreId === row.id).length }),
  });
  const space = new Table(() => ({}), ['name']);
  const book: Table = new Table(
    () => ({ coverImage: null, totalCopies: 1, availableCopies: 1, createdAt: new Date() }),
    ['isbn'],
    { genre: (row) => genre.rows.find((g) => g.id === row.genreId) ?? null },
  );
  const borrowRequest = new Table(
    () => ({ status: 'REQUESTED', requestDate: new Date(), dueDate: null, returnDate: null, fineAmount: 0 }),
    [],
    {
      user: (row) => user.rows.find((u) => u.id === row.userId) ?? null,
      book: (row) => book.rows.find((b) => b.id === row.bookId) ?? null,
    },
  );
  const booking = new Table(() => ({ status: 'CONFIRMED', createdAt: new Date() }), [], {
    user: (row) => user.rows.find((u) => u.id === row.userId) ?? null,
    space: (row) => space.rows.find((s) => s.id === row.spaceId) ?? null,
  });

  // The database refuses to delete a book that borrow requests still point at
  book.beforeDelete = (row) => {
    if (borrowRequest.rows.some((r) => r.bookId === row.id)) {
      throw knownError('P2003', 'Foreign key constraint failed on the field: `bookId`');
    }
  };

  const tables = { user, genre, space, book, borrowRequest, booking };

  const db = {
    ...tables,
    /** Runs a callback as one unit: if it throws, every change it made is undone */
    async $transaction(arg: ((tx: unknown) => Promise<unknown>) | Promise<unknown>[], _options?: unknown) {
      if (typeof arg !== 'function') return Promise.all(arg);
      const saved = Object.entries(tables).map(([name, t]) => [name, structuredClone(t.rows), t.nextId] as const);
      try {
        return await arg(db);
      } catch (error) {
        for (const [name, rows, nextId] of saved) {
          const t = tables[name as keyof typeof tables];
          t.rows = rows;
          t.nextId = nextId;
        }
        throw error;
      }
    },
  };
  return db;
}

export type InMemoryPrisma = ReturnType<typeof createInMemoryPrisma>;
