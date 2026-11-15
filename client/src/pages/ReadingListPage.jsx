import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReadingList } from '../context/ReadingListContext.jsx';

function ReadingListPage() {
  const { readingList, removeBook, clearList } = useReadingList();
  const [confirming, setConfirming] = useState(false);

  if (readingList.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <h1 className="text-2xl font-bold">Your reading list is empty</h1>
        <p className="mt-2 text-slate-600">Add books from the catalog to keep track of what you want to read.</p>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-indigo-700 hover:underline">
          &larr; Browse the catalog
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Your reading list</h1>
          <p className="mt-1 text-sm text-slate-600">
            {readingList.length} {readingList.length === 1 ? 'book' : 'books'}, saved in this browser
          </p>
        </div>

        {confirming ? (
          <div role="alertdialog" aria-label="Confirm clearing the list" className="flex items-center gap-2 text-sm">
            <span>Remove all {readingList.length} books?</span>
            <button
              type="button"
              onClick={() => {
                clearList();
                setConfirming(false);
              }}
              className="rounded-lg bg-rose-600 px-3 py-2 font-medium text-white hover:bg-rose-700"
            >
              Yes, clear it
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-lg border border-slate-300 px-3 py-2 font-medium hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100"
          >
            Clear list
          </button>
        )}
      </div>

      <ul className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {readingList.map((book) => (
          <li key={book.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <Link to={`/books/${book.id}`} className="font-semibold text-indigo-700 hover:underline">
                {book.title}
              </Link>
              <p className="text-sm text-slate-600">
                by {book.author}
                {book.genre ? ` \u00b7 ${book.genre}` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeBook(book.id)}
              aria-label={`Remove ${book.title} from reading list`}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-rose-50 hover:text-rose-700"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ReadingListPage;
