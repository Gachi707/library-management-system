# Library Catalog: React client

A single-page React app for browsing the library catalogue (Week 3). It is built with Vite, React 19, React Router, axios and Tailwind CSS, and it calls the NestJS API in `../api`.

## Run it

1. Start the API: `cd api && npm run start:dev`
2. In a second terminal: `cd client && npm install && npm run dev`
3. Open http://localhost:5173

The API address comes from `client/.env`, which contains only `VITE_API_URL=http://localhost:3000`. It is committed on purpose because it holds no secret.

## What it does

- Home page: a responsive grid of book cards fetched live from `GET /books`
- Debounced live search by title or author (400 ms after the last keystroke)
- Genre filter (options from `GET /genres`) and a sort control (title or author)
- Book detail page at `/books/:id`, fetched from `GET /books/:id`
- Loading (skeleton), error (with a Try again button) and empty states

## How the components fit together

```text
main.jsx     <BrowserRouter> wraps the whole app once
App.jsx      Routes: "/" -> HomePage, "/books/:id" -> BookDetail, "*" -> NotFound
HomePage     owns the shared state: search, genreId, sortBy ("lifting state up")
 |- SearchBar     debounced input, reports changes with the onSearch callback
 |- GenreFilter   loads GET /genres, reports changes with onChange
 '- BookGrid      GET /books?genreId=...&search=...  (loading, error, empty states)
     '- BookCard   one per book, mapped with key={book.id}, links to /books/:id
BookDetail   useParams() reads :id, then GET /books/:id
```

## Requirement checklist

| Assignment requirement | File |
|---|---|
| `<App />` wrapped in `<BrowserRouter>` | `client/src/main.jsx` |
| Routes for `/` and `/books/:id` | `client/src/App.jsx` |
| Renders BookGrid, SearchBar and a genre filter, and holds the shared filter state | `client/src/pages/HomePage.jsx` |
| Fetches `GET /books` with `genreId`/`search`; loading, error and empty states | `client/src/components/BookGrid.jsx` |
| Renders one book, mapped with a `key` equal to the book's id | `client/src/components/BookCard.jsx` |
| Debounces input (`setTimeout` + cleanup) before calling `onSearch` | `client/src/components/SearchBar.jsx` |
| Reads `id` with `useParams()` and fetches `GET /books/:id` | `client/src/pages/BookDetail.jsx` |
| Defines `VITE_API_URL` pointing at the NestJS backend | `client/.env` |

## Files in this folder

```text
client/README.md
client/.env
client/.gitignore
client/index.html
client/package-lock.json
client/package.json
client/src/App.jsx
client/src/components/BookCard.jsx
client/src/components/BookCover.jsx
client/src/components/BookGrid.jsx
client/src/components/GenreFilter.jsx
client/src/components/SearchBar.jsx
client/src/index.css
client/src/main.jsx
client/src/pages/BookDetail.jsx
client/src/pages/HomePage.jsx
client/src/pages/NotFound.jsx
client/vite.config.js
```

## Source code

_Generated from the real files by `scripts/update-readme.sh`._

### client/src/main.jsx

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// BrowserRouter wraps the whole app once, so useParams, useNavigate and <Link>
// work anywhere in the component tree.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
```

### client/src/App.jsx

```jsx
import { Link, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import BookDetail from './pages/BookDetail.jsx';
import NotFound from './pages/NotFound.jsx';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-xl font-bold text-indigo-700">
            Library Catalog
          </Link>
          <span className="hidden text-sm text-slate-500 sm:block">
            Browse and search our collection
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
```

### client/src/pages/HomePage.jsx

```jsx
import { useState } from 'react';
import BookGrid from '../components/BookGrid.jsx';
import SearchBar from '../components/SearchBar.jsx';
import GenreFilter from '../components/GenreFilter.jsx';

function HomePage() {
  // The shared filter state lives here, in the lowest common parent of every
  // component that needs it. Children read it through props and report changes
  // upward through callback props ("lifting state up").
  const [search, setSearch] = useState('');
  const [genreId, setGenreId] = useState('');
  const [sortBy, setSortBy] = useState('title');

  return (
    <div>
      <h1 className="text-2xl font-bold">Book catalog</h1>
      <p className="mt-1 text-slate-600">Search by title or author, or filter by genre.</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <SearchBar onSearch={setSearch} />
        <GenreFilter value={genreId} onChange={setGenreId} />
        <div>
          <label htmlFor="sort-by" className="sr-only">
            Sort books
          </label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="title">Sort by title</option>
            <option value="author">Sort by author</option>
          </select>
        </div>
      </div>

      <div className="mt-6">
        <BookGrid genreId={genreId} search={search} sortBy={sortBy} />
      </div>
    </div>
  );
}

export default HomePage;
```

### client/src/components/BookGrid.jsx

```jsx
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
```

### client/src/components/BookCard.jsx

```jsx
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
```

### client/src/components/SearchBar.jsx

```jsx
import { useEffect, useState } from 'react';

function SearchBar({ onSearch, delay = 400 }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    // Debounce: schedule the search after a pause in typing...
    const timer = setTimeout(() => onSearch(query.trim()), delay);
    // ...and cancel the previous timer on every new keystroke (the cleanup runs first)
    return () => clearTimeout(timer);
  }, [query, delay, onSearch]);

  return (
    <div className="flex-1">
      <label htmlFor="book-search" className="sr-only">
        Search books by title or author
      </label>
      <input
        id="book-search"
        type="search"
        placeholder="Search by title or author..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
    </div>
  );
}

export default SearchBar;
```

### client/src/pages/BookDetail.jsx

```jsx
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
```

### client/.env

```text
VITE_API_URL=http://localhost:3000
```

### client/index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Library Catalog</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### client/package.json

```json
{
  "name": "client",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "1.21.1",
    "react": "19.3.1",
    "react-dom": "19.3.1",
    "react-router-dom": "7.18.5"
  },
  "devDependencies": {
    "@tailwindcss/vite": "4.3.5",
    "@vitejs/plugin-react": "6.3.0",
    "tailwindcss": "4.3.5",
    "vite": "8.3.8"
  }
}
```

### client/src/components/BookCover.jsx

```jsx
// Shows the book's cover image, or a coloured placeholder when it has none
function BookCover({ book, className = 'h-40' }) {
  if (book.coverImage) {
    return (
      <img
        src={book.coverImage}
        alt={`Cover of ${book.title}`}
        className={`${className} w-full object-cover`}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className={`${className} flex w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 text-5xl font-bold text-white`}
    >
      {book.title.charAt(0).toUpperCase()}
    </div>
  );
}

export default BookCover;
```

### client/src/components/GenreFilter.jsx

```jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function GenreFilter({ value, onChange }) {
  const [genres, setGenres] = useState([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    axios
      .get(`${API}/genres`, { signal: controller.signal })
      .then((res) => setGenres(res.data))
      .catch((err) => {
        if (!axios.isCancel(err)) setFailed(true);
      });
    return () => controller.abort();
  }, []);

  return (
    <div>
      <label htmlFor="genre-filter" className="sr-only">
        Filter by genre
      </label>
      <select
        id="genre-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
      >
        <option value="">All genres</option>
        {genres.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
      {failed && <p className="mt-1 text-xs text-rose-700">Genres could not be loaded.</p>}
    </div>
  );
}

export default GenreFilter;
```

### client/src/index.css

```css
@import "tailwindcss";
```

### client/src/pages/NotFound.jsx

```jsx
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-slate-600">That page does not exist.</p>
      <Link to="/" className="mt-4 inline-block text-sm font-medium text-indigo-700 hover:underline">
        &larr; Back to catalog
      </Link>
    </div>
  );
}

export default NotFound;
```

### client/vite.config.js

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

