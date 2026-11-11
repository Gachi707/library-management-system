import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import BookCard from './BookCard.jsx';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const GRID = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
const SKELETON_IDS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

// Skeleton loading UI (stretch task): grey placeholder cards while the books load
function SkeletonGrid() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading books...</span>
      <div className={GRID}>
        {SKELETON_IDS.map((id) => (
          <div key={`skeleton-${id}`} className="h-64 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}

function BookGrid({ genreId = '', search = '', sortBy = 'title' }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0); // bump this to try the request again

  // Refetch whenever the genre filter or the search text changes
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    axios
      .get(`${API}/books`, {
        // axios leaves out params that are undefined, so empty filters are not sent
        params: { genreId: genreId || undefined, search: search || undefined, limit: 100 },
        signal: controller.signal,
      })
      .then((res) => setBooks(res.data))
      .catch((err) => {
        if (axios.isCancel(err)) return; // a newer request replaced this one
        setBooks([]);
        setError(
          err.response
            ? 'The server could not load the books. Please try again.'
            : 'Could not reach the library server. Is the API running?',
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    // Cleanup: cancel the old request so a slow, outdated response can never overwrite a newer one
    return () => controller.abort();
  }, [genreId, search, attempt]);

  // Sorting is done in the browser, so changing it needs no new request (stretch task)
  const sorted = useMemo(
    () => [...books].sort((a, b) => String(a[sortBy] ?? '').localeCompare(String(b[sortBy] ?? ''))),
    [books, sortBy],
  );

  if (loading) return <SkeletonGrid />;

  if (error) {
    return (
      <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
        <p className="font-medium text-rose-800">{error}</p>
        <button
          type="button"
          onClick={() => setAttempt((n) => n + 1)}
          className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
        >
          Try again
        </button>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="font-medium">No books found</p>
        <p className="mt-1 text-sm text-slate-600">Try a different search or choose another genre.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-600" aria-live="polite">
        Showing {books.length} {books.length === 1 ? 'book' : 'books'}
      </p>
      <div className={GRID}>
        {sorted.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}

export default BookGrid;
