# Library Management System

A full-stack library management system built with React, NestJS, PostgreSQL and Prisma. This repository currently contains the backend (Weeks 1 and 2): the database schema, the Prisma service, seed data, CRUD APIs for books and genres with validation, JWT authentication and role-based authorization.

## Project Structure

```
library-management-system/
├── api/                      # NestJS backend
│   ├── prisma/               # schema.prisma, seed.ts, migrations/
│   └── src/
│       ├── prisma/           # PrismaService and PrismaModule
│       ├── genres/           # Genre CRUD
│       ├── books/            # Book CRUD, search, filtering, pagination
│       └── auth/             # Register/login, JWT strategy, roles guard
├── docs/
│   └── postman_collection.json
├── scripts/                  # README generator
└── README.md
```

## Setup (api)

1. `cd api && npm install`
2. Copy `.env.example` to `.env` and set your own `DATABASE_URL` and `JWT_SECRET`
3. `npx prisma migrate dev`
4. `npx prisma db seed`
5. `npm run start:dev`

## API (Week 2)

Base URL: `http://localhost:3000`

- Public: `GET /books` (supports `genreId`, `search`, `page`, `limit`), `GET /books/:id`, `GET /genres`, `GET /genres/:id`
- Librarian only: `POST`, `PATCH` and `DELETE` on `/books` and `/genres`
- Auth: `POST /auth/register`, `POST /auth/login` (returns an access_token, sent as `Authorization: Bearer <token>`)

Seeded dev librarian: `librarian@library.test` / `Librarian123!`. Import `docs/postman_collection.json` to try every endpoint.
## Client (Week 3)

A React catalog built with Vite, React Router, axios and Tailwind CSS.

1. `cd client && npm install`
2. `client/.env` points at the API (`VITE_API_URL=http://localhost:3000`)
3. Start the API (`cd api && npm run start:dev`), then in another terminal `cd client && npm run dev`
4. Open http://localhost:5173

Features: debounced live search (title or author), genre filter, sort by title or author, book detail pages at `/books/:id`, and loading, error and empty states.

<!-- REQUIRED-FILES:START -->
## Client (Week 3)

A React catalog built with Vite, React Router, axios and Tailwind CSS. The full documentation and the complete source code are in [`client/README.md`](client/README.md).

1. `cd client && npm install`
2. `client/.env` points at the API (`VITE_API_URL=http://localhost:3000`)
3. Start the API (`cd api && npm run start:dev`), then in a second terminal run `cd client && npm run dev`
4. Open http://localhost:5173

Features: debounced live search (title or author), genre filter, sort by title or author, book detail pages at `/books/:id`, and loading, error and empty states.

| Assignment requirement | File |
|---|---|
| `<App />` wrapped in `<BrowserRouter>` | `client/src/main.jsx` |
| Routes for `/` and `/books/:id` | `client/src/App.jsx` |
| Shared filter state, genre filter, search bar and grid together | `client/src/pages/HomePage.jsx` |
| Fetch `GET /books` with `genreId`/`search`; loading, error and empty states | `client/src/components/BookGrid.jsx` |
| One book, mapped with `key={book.id}` | `client/src/components/BookCard.jsx` |
| Debounced search (`setTimeout` + cleanup) | `client/src/components/SearchBar.jsx` |
| Reads `id` with `useParams()`, fetches `GET /books/:id` | `client/src/pages/BookDetail.jsx` |
| `VITE_API_URL` pointing at the NestJS API | `client/.env` |

## Repository Contents

_Generated from the real files by `scripts/update-readme.sh`._

### Every file in the repository

```text
README.md
api/.env.example
api/.gitattributes
api/.gitignore
api/.oxlintrc.json
api/.prettierrc
api/AGENTS.md
api/README.md
api/jest.config.ts
api/nest-cli.json
api/package-lock.json
api/package.json
api/prisma/migrations/20261108133914_init/migration.sql
api/prisma/migrations/migration_lock.toml
api/prisma/schema.prisma
api/prisma/seed.ts
api/src/app.controller.spec.ts
api/src/app.controller.ts
api/src/app.module.ts
api/src/app.service.ts
api/src/auth/auth.controller.ts
api/src/auth/auth.module.ts
api/src/auth/auth.service.ts
api/src/auth/dto/login.dto.ts
api/src/auth/dto/register.dto.ts
api/src/auth/jwt-auth.guard.ts
api/src/auth/jwt.strategy.ts
api/src/auth/roles.decorator.ts
api/src/auth/roles.guard.ts
api/src/books/books.controller.ts
api/src/books/books.module.ts
api/src/books/books.service.ts
api/src/books/dto/create-book.dto.ts
api/src/books/dto/update-book.dto.ts
api/src/genres/dto/create-genre.dto.ts
api/src/genres/dto/update-genre.dto.ts
api/src/genres/genres.controller.ts
api/src/genres/genres.module.ts
api/src/genres/genres.service.ts
api/src/main.ts
api/src/prisma/prisma.module.ts
api/src/prisma/prisma.service.spec.ts
api/src/prisma/prisma.service.ts
api/test/app.e2e-spec.ts
api/test/jest-e2e.json
api/tsconfig.build.json
api/tsconfig.json
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
docs/newman-results.txt
docs/postman_collection.json
scripts/readme-files.txt
scripts/run-tests.sh
scripts/update-readme.sh
scripts/verify-submission.sh
```

### Required files

| File | Link |
|---|---|
| `client/src/main.jsx` | [view](https://github.com/Gachi707/library-management-system/blob/main/client/src/main.jsx) |
| `client/src/App.jsx` | [view](https://github.com/Gachi707/library-management-system/blob/main/client/src/App.jsx) |
| `client/src/pages/HomePage.jsx` | [view](https://github.com/Gachi707/library-management-system/blob/main/client/src/pages/HomePage.jsx) |
| `client/src/components/BookGrid.jsx` | [view](https://github.com/Gachi707/library-management-system/blob/main/client/src/components/BookGrid.jsx) |
| `client/src/components/BookCard.jsx` | [view](https://github.com/Gachi707/library-management-system/blob/main/client/src/components/BookCard.jsx) |
| `client/src/components/SearchBar.jsx` | [view](https://github.com/Gachi707/library-management-system/blob/main/client/src/components/SearchBar.jsx) |
| `client/src/pages/BookDetail.jsx` | [view](https://github.com/Gachi707/library-management-system/blob/main/client/src/pages/BookDetail.jsx) |
| `client/.env` | [view](https://github.com/Gachi707/library-management-system/blob/main/client/.env) |
| `client/src/components/GenreFilter.jsx` | [view](https://github.com/Gachi707/library-management-system/blob/main/client/src/components/GenreFilter.jsx) |
| `client/src/components/BookCover.jsx` | [view](https://github.com/Gachi707/library-management-system/blob/main/client/src/components/BookCover.jsx) |
| `client/src/pages/NotFound.jsx` | [view](https://github.com/Gachi707/library-management-system/blob/main/client/src/pages/NotFound.jsx) |

### Source code

#### client/src/main.jsx

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

#### client/src/App.jsx

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

#### client/src/pages/HomePage.jsx

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

#### client/src/components/BookGrid.jsx

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

#### client/src/components/BookCard.jsx

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

#### client/src/components/SearchBar.jsx

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

#### client/src/pages/BookDetail.jsx

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

#### client/.env

```text
VITE_API_URL=http://localhost:3000
```

#### client/src/components/GenreFilter.jsx

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

#### client/src/components/BookCover.jsx

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

#### client/src/pages/NotFound.jsx

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

### API test results (Newman, run against the live API)

```text
newman

Library Management System API

□ Auth
└ Register patron
  POST http://127.0.0.1:3000/auth/register [409 Conflict, 347B, 1183ms]
  √  201 with an access_token (or 409 if already registered)

└ Login librarian
  POST http://127.0.0.1:3000/auth/login [200 OK, 451B, 446ms]
  √  Status is 200
  √  Response has access_token

└ Login patron
  POST http://127.0.0.1:3000/auth/login [200 OK, 447B, 362ms]
  √  Status is 200

└ Register - invalid body (400)
  POST http://127.0.0.1:3000/auth/register [400 Bad Request, 410B, 15ms]
  √  Status is 400

└ Login - wrong password (401)
  POST http://127.0.0.1:3000/auth/login [401 Unauthorized, 350B, 367ms]
  √  Status is 401

□ Genres
└ List genres
  GET http://127.0.0.1:3000/genres [200 OK, 447B, 189ms]
  √  Status is 200

└ Get genre by id
  GET http://127.0.0.1:3000/genres/1 [200 OK, 330B, 450ms]
  √  Status is 200

└ Create genre (librarian)
  POST http://127.0.0.1:3000/genres [201 Created, 312B, 425ms]
  √  Status is 201

└ Update genre (librarian)
  PATCH http://127.0.0.1:3000/genres/6 [200 OK, 317B, 613ms]
  √  Status is 200

└ Delete genre (librarian)
  DELETE http://127.0.0.1:3000/genres/6 [200 OK, 317B, 957ms]
  √  Status is 200

└ Delete genre in use (409)
  DELETE http://127.0.0.1:3000/genres/1 [409 Conflict, 350B, 372ms]
  √  Status is 409

└ Create genre - no token (401)
  POST http://127.0.0.1:3000/genres [401 Unauthorized, 320B, 7ms]
  √  Status is 401

└ Create genre - patron token (403)
  POST http://127.0.0.1:3000/genres [403 Forbidden, 343B, 8ms]
  √  Status is 403

□ Books
└ List books (paginated)
  GET http://127.0.0.1:3000/books?page=1&limit=10 [200 OK, 3.58kB, 740ms]
  √  Status is 200 and body is an array
  √  limit is respected

└ Filter by genre
  GET http://127.0.0.1:3000/books?genreId=1 [200 OK, 1.59kB, 732ms]
  √  Status is 200
  √  Every book belongs to genre 1

└ Search title or author
  GET http://127.0.0.1:3000/books?search=clean [200 OK, 581B, 579ms]
  √  Status is 200

└ Get book by id
  GET http://127.0.0.1:3000/books/1 [200 OK, 612B, 554ms]
  √  Status is 200

└ Create book (librarian)
  POST http://127.0.0.1:3000/books [201 Created, 566B, 1306ms]
  √  Status is 201
  √  availableCopies equals totalCopies

└ Update book (librarian)
  PATCH http://127.0.0.1:3000/books/19 [200 OK, 561B, 1460ms]
  √  Status is 200

└ Delete book (librarian)
  DELETE http://127.0.0.1:3000/books/19 [200 OK, 509B, 736ms]
  √  Status is 200

└ Create book - no token (401)
  POST http://127.0.0.1:3000/books [401 Unauthorized, 320B, 8ms]
  √  Status is 401

└ Create book - patron token (403)
  POST http://127.0.0.1:3000/books [403 Forbidden, 343B, 6ms]
  √  Status is 403

└ Create book - missing title (400)
  POST http://127.0.0.1:3000/books [400 Bad Request, 382B, 6ms]
  √  Status is 400

└ Create book - missing description (400)
  POST http://127.0.0.1:3000/books [400 Bad Request, 394B, 5ms]
  √  Status is 400

└ Get missing book (404)
  GET http://127.0.0.1:3000/books/999999 [404 Not Found, 346B, 201ms]
  √  Status is 404

┌─────────────────────────┬────────────────────┬────────────────────┐
│                         │           executed │             failed │
├─────────────────────────┼────────────────────┼────────────────────┤
│              iterations │                  1 │                  0 │
├─────────────────────────┼────────────────────┼────────────────────┤
│                requests │                 25 │                  0 │
├─────────────────────────┼────────────────────┼────────────────────┤
│            test-scripts │                 25 │                  0 │
├─────────────────────────┼────────────────────┼────────────────────┤
│      prerequest-scripts │                  0 │                  0 │
├─────────────────────────┼────────────────────┼────────────────────┤
│              assertions │                 29 │                  0 │
├─────────────────────────┴────────────────────┴────────────────────┤
│ total run duration: 13.7s                                         │
├───────────────────────────────────────────────────────────────────┤
│ total data received: 7.73kB (approx)                              │
├───────────────────────────────────────────────────────────────────┤
│ average response time: 469ms [min: 5ms, max: 1460ms, s.d.: 417ms] │
└───────────────────────────────────────────────────────────────────┘
```

<!-- REQUIRED-FILES:END -->

## Schema Decisions

### Why Book references Genre instead of embedding it

Each Book stores a `genreId` foreign key that points to a row in the Genre table, rather than storing the genre name as text inside every book.

If the genre name were stored directly on each book, renaming a genre such as "Science Fiction" to "Sci-Fi" would mean updating every book that uses the old name. If even one record were missed, the database would hold inconsistent names for the same category. It would also repeat the same genre name across many book records.

Keeping genres in their own table and linking to them through `genreId` means the name is stored once. Renaming a genre is a single update, and every book reflects it automatically. Since `slug` also lives on Genre, it is updated in that same single row.

### What the foreign key protects

Because `genreId` is a foreign key, PostgreSQL will not allow a book to reference a genre that does not exist. For example, if a book is created with `genreId = 15` and no genre with ID 15 exists, the database rejects the operation.

It also protects existing relationships: a genre that is still used by books cannot simply be deleted unless the deletion rules allow it. This keeps the data reliable, since every book is always connected to a valid genre.

### Why `totalCopies` and `availableCopies` are separate

The two fields represent different things:

- `totalCopies` is how many physical copies of a book the library owns.
- `availableCopies` is how many of those copies can currently be borrowed.

For example, if the library owns 10 copies of *Things Fall Apart* and 4 are borrowed, `totalCopies` stays at 10 while `availableCopies` becomes 6.

Keeping both values lets the system track the whole collection without confusing borrowed books with missing stock. It also makes it simple to check that a copy is available before approving a borrow request.

The schema only stores these numbers. It does not stop `availableCopies` from exceeding `totalCopies` or going below zero, so the borrowing logic in a later week will need to keep them consistent.

### Users and roles

The User model has a `Role` enum with two values, `PATRON` and `LIBRARIAN`, defaulting to `PATRON`. The `RolesGuard` uses this role to restrict creating, updating and deleting books and genres to librarians.

