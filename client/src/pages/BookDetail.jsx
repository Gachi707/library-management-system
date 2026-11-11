import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import BookCover from '../components/BookCover.jsx';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function BackLink() {
  return (
    <Link to="/" className="text-sm font-medium text-indigo-700 hover:underline">
      &larr; Back to catalog
    </Link>
  );
}

function BookDetail() {
  const { id } = useParams(); // the :id segment from the URL
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); // '', 'notfound' or 'network'

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setBook(null);

    axios
      .get(`${API}/books/${id}`, { signal: controller.signal })
      .then((res) => setBook(res.data))
      .catch((err) => {
        if (axios.isCancel(err)) return;
        const status = err.response?.status;
        setError(status === 404 || status === 400 ? 'notfound' : 'network');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <div role="status" aria-live="polite">
        <span className="sr-only">Loading book...</span>
        <div className="h-96 animate-pulse rounded-xl bg-slate-200" />
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="font-medium">
          {error === 'notfound'
            ? 'Book not found'
            : 'Could not reach the library server. Is the API running?'}
        </p>
        <div className="mt-4">
          <BackLink />
        </div>
      </div>
    );
  }

  const inStock = book.availableCopies > 0;

  return (
    <article>
      <BackLink />
      <div className="mt-4 grid gap-8 md:grid-cols-3">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <BookCover book={book} className="h-72" />
        </div>

        <div className="md:col-span-2">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            {book.genre?.name ?? 'Uncategorised'}
          </span>
          <h1 className="mt-3 text-3xl font-bold">{book.title}</h1>
          <p className="mt-1 text-lg text-slate-600">by {book.author}</p>

          <p
            className={`mt-4 inline-block rounded-lg px-3 py-1 text-sm font-medium ${
              inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {inStock
              ? `${book.availableCopies} of ${book.totalCopies} copies available`
              : 'All copies are currently borrowed'}
          </p>

          <h2 className="mt-6 font-semibold">About this book</h2>
          <p className="mt-1 text-slate-700">{book.description}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-slate-500">ISBN</dt>
              <dd className="font-medium">{book.isbn}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Total copies</dt>
              <dd className="font-medium">{book.totalCopies}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Available now</dt>
              <dd className="font-medium">{book.availableCopies}</dd>
            </div>
          </dl>
        </div>
      </div>
    </article>
  );
}

export default BookDetail;
