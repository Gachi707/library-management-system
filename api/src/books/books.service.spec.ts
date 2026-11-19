import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createInMemoryPrisma } from '../../test/support/in-memory-prisma';
import type { PrismaService } from '../prisma/prisma.service';
import { BooksService } from './books.service';

function setup() {
  const db = createInMemoryPrisma();
  db.genre.insert({ name: 'Technology', slug: 'technology' });
  const book = db.book.insert({ title: 'Clean Code', author: 'Robert C. Martin', isbn: '1', description: 'd', genreId: 1 });
  const service = new BooksService(db as unknown as PrismaService);
  return { db, service, book };
}

describe('BooksService.remove', () => {
  it('deletes a book nobody has borrowed', async () => {
    const { db, service, book } = setup();
    await service.remove(book.id);
    expect(db.book.rows).toHaveLength(0);
  });

  it('refuses with a clear 409 when borrow requests still point at the book', async () => {
    const { db, service, book } = setup();
    db.user.insert({ email: 'ann@library.test', password: 'x' });
    db.borrowRequest.insert({ userId: 1, bookId: book.id, bookTitle: 'Clean Code', bookAuthor: 'R', status: 'RETURNED' });
    await expect(service.remove(book.id)).rejects.toBeInstanceOf(ConflictException);
    await expect(service.remove(book.id)).rejects.toThrow('borrow requests');
    expect(db.book.rows).toHaveLength(1);
  });

  it('checks for borrow history BEFORE trying to delete, so it never depends on the database error code', async () => {
    const { db, service, book } = setup();
    db.user.insert({ email: 'ann@library.test', password: 'x' });
    db.borrowRequest.insert({ userId: 1, bookId: book.id, bookTitle: 'Clean Code', bookAuthor: 'R', status: 'REQUESTED' });
    const deleteSpy = jest.spyOn(db.book, 'delete');
    await expect(service.remove(book.id)).rejects.toBeInstanceOf(ConflictException);
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it.each(['P2003', 'P2014'])('still answers 409 if the database itself refuses the delete with %s (a request slipped in)', async (code) => {
    const { db, service, book } = setup();
    jest.spyOn(db.book, 'delete').mockRejectedValueOnce(new Prisma.PrismaClientKnownRequestError('blocked', { code, clientVersion: 'test' }));
    await expect(service.remove(book.id)).rejects.toBeInstanceOf(ConflictException);
  });

  it('lets any other database error through untouched', async () => {
    const { db, service, book } = setup();
    jest.spyOn(db.book, 'delete').mockRejectedValueOnce(new Error('connection lost'));
    await expect(service.remove(book.id)).rejects.toThrow('connection lost');
  });

  it('404 for a book that does not exist', async () => {
    const { service } = setup();
    await expect(service.remove(999)).rejects.toBeInstanceOf(NotFoundException);
  });
});
