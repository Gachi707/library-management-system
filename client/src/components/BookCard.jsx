import { Link } from 'react-router-dom';
import BookCover from './BookCover.jsx';

function BookCard({ book }) {
  const inStock = book.availableCopies > 0;

  return (
    <Link
      to={`/books/${book.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <BookCover book={book} />
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-2 font-semibold group-hover:text-indigo-700">{book.title}</h3>
        <p className="text-sm text-slate-600">by {book.author}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-xs">
          <span className="rounded-full bg-indigo-50 px-2 py-1 font-medium text-indigo-700">
            {book.genre?.name ?? 'Uncategorised'}
          </span>
          <span className={inStock ? 'font-medium text-emerald-700' : 'font-medium text-rose-700'}>
            {inStock ? `${book.availableCopies} of ${book.totalCopies} available` : 'All copies borrowed'}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default BookCard;
