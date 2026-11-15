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
<!-- REQUIRED-FILES:START -->
## Client (Weeks 3 and 4)

A React app built with Vite, React Router, axios and Tailwind CSS. The full documentation, the requirement checklists and the complete source code are in [`client/README.md`](client/README.md).

1. `cd client && npm install`
2. `client/.env` points at the API (`VITE_API_URL=http://localhost:3000`)
3. Start the API (`cd api && npm run start:dev`), then in a second terminal run `cd client && npm run dev`
4. Open http://localhost:5173
5. Automated tests: `cd client && npm test` (the saved report is `docs/client-test-results.txt`)

Features: debounced live search, genre filter and sort, book detail pages, a reading list kept in a React Context and saved in `localStorage`, register and login with the JWT kept in `localStorage`, a protected `/book-space` route with a controlled booking form, and loading, error and empty states.

| Week 4 requirement | File |
|---|---|
| Reducer (`ADD_BOOK`, `REMOVE_BOOK`, `CLEAR_LIST`) persisted to and restored from `localStorage` | `client/src/context/ReadingListContext.jsx` |
| Wraps its routes in `<ReadingListProvider>` | `client/src/App.jsx` |
| Controlled login form, posts to `/auth/login`, stores the JWT | `client/src/pages/LoginPage.jsx` |
| Controlled registration form, posts to `/auth/register` | `client/src/pages/RegisterPage.jsx` |
| Redirects to `/login` when there is no token, otherwise renders its children | `client/src/components/ProtectedRoute.jsx` |
| Controlled booking form: space dropdown, date, start time, end time | `client/src/pages/SpaceBookingPage.jsx` |
| Displays the reading list count from `ReadingListContext` | `client/src/components/Navbar.jsx` |

| Week 3 requirement | File |
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
client/src/__tests__/auth.test.jsx
client/src/__tests__/catalog.test.jsx
client/src/__tests__/readingList.test.jsx
client/src/__tests__/spaceBooking.test.jsx
client/src/components/Navbar.jsx
client/src/components/ProtectedRoute.jsx
client/src/components/ReadingListButton.jsx
client/src/context/AuthContext.jsx
client/src/context/ReadingListContext.jsx
client/src/pages/LoginPage.jsx
client/src/pages/ReadingListPage.jsx
client/src/pages/RegisterPage.jsx
client/src/pages/SpaceBookingPage.jsx
client/src/test/helpers.jsx
client/src/test/setup.js
client/src/utils/apiError.js
client/vitest.config.js
docs/client-test-results.txt
scripts/run-client-tests.sh
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
client/README.md
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
| `client/src/context/ReadingListContext.jsx` | [view](https://github.com/Gachi707/library-management-system/blob/main/client/src/context/ReadingListContext.jsx) |
| `client/src/App.jsx` | [view](https://github.com/Gachi707/library-management-system/blob/main/client/src/App.jsx) |
| `client/src/pages/LoginPage.jsx` | [view](https://github.com/Gachi707/library-management-system/blob/main/client/src/pages/LoginPage.jsx) |
| `client/src/pages/RegisterPage.jsx` | [view](https://github.com/Gachi707/library-management-system/blob/main/client/src/pages/RegisterPage.jsx) |
| `client/src/components/ProtectedRoute.jsx` | [view](https://github.com/Gachi707/library-management-system/blob/main/client/src/components/ProtectedRoute.jsx) |
| `client/src/pages/SpaceBookingPage.jsx` | [view](https://github.com/Gachi707/library-management-system/blob/main/client/src/pages/SpaceBookingPage.jsx) |
| `client/src/components/Navbar.jsx` | [view](https://github.com/Gachi707/library-management-system/blob/main/client/src/components/Navbar.jsx) |

### Source code

#### client/src/context/ReadingListContext.jsx

```jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';

export const READING_LIST_KEY = 'readingList';

const ReadingListContext = createContext(null);

// The reducer lists every way the reading list is allowed to change:
// (currentState, action) => newState
export function readingListReducer(state, action) {
  switch (action.type) {
    case 'ADD_BOOK':
      // a book can only be on the list once
      return state.some((b) => b.id === action.payload.id) ? state : [...state, action.payload];
    case 'REMOVE_BOOK':
      return state.filter((b) => b.id !== action.payload);
    case 'CLEAR_LIST':
      return [];
    default:
      return state;
  }
}

// Restore the list saved in localStorage, ignoring anything missing or corrupt
function loadSavedList() {
  try {
    const saved = JSON.parse(localStorage.getItem(READING_LIST_KEY));
    return Array.isArray(saved) ? saved.filter((b) => b && b.id !== undefined) : [];
  } catch {
    return [];
  }
}

// Keep only what the reading list needs to show, not the whole book record
function toListItem(book) {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    genre: book.genre?.name ?? null,
    coverImage: book.coverImage ?? null,
  };
}

export function ReadingListProvider({ children }) {
  // The third argument runs once on the first render: that is how the saved list is restored on refresh
  const [readingList, dispatch] = useReducer(readingListReducer, [], loadSavedList);

  // Persist: save to localStorage every time the list changes
  useEffect(() => {
    try {
      localStorage.setItem(READING_LIST_KEY, JSON.stringify(readingList));
    } catch {
      // storage full or blocked: the list still works in memory for this visit
    }
  }, [readingList]);

  const addBook = useCallback((book) => dispatch({ type: 'ADD_BOOK', payload: toListItem(book) }), []);
  const removeBook = useCallback((id) => dispatch({ type: 'REMOVE_BOOK', payload: id }), []);
  const clearList = useCallback(() => dispatch({ type: 'CLEAR_LIST' }), []);
  const isInList = useCallback((id) => readingList.some((b) => b.id === id), [readingList]);

  const value = useMemo(
    () => ({ readingList, dispatch, addBook, removeBook, clearList, isInList }),
    [readingList, addBook, removeBook, clearList, isInList],
  );

  return <ReadingListContext.Provider value={value}>{children}</ReadingListContext.Provider>;
}

// Any component inside the provider can read the list with this hook, however deeply nested
export function useReadingList() {
  const ctx = useContext(ReadingListContext);
  if (!ctx) throw new Error('useReadingList must be used inside <ReadingListProvider>');
  return ctx;
}
```

#### client/src/App.jsx

```jsx
import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ReadingListProvider } from './context/ReadingListContext.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import BookDetail from './pages/BookDetail.jsx';
import ReadingListPage from './pages/ReadingListPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import SpaceBookingPage from './pages/SpaceBookingPage.jsx';
import NotFound from './pages/NotFound.jsx';

function App() {
  return (
    <AuthProvider>
      {/* Everything inside the provider, however deeply nested, can read the reading list */}
      <ReadingListProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900">
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/books/:id" element={<BookDetail />} />
              <Route path="/reading-list" element={<ReadingListPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/book-space"
                element={
                  <ProtectedRoute>
                    <SpaceBookingPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </ReadingListProvider>
    </AuthProvider>
  );
}

export default App;
```

#### client/src/pages/LoginPage.jsx

```jsx
import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../utils/apiError.js';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();
  // ProtectedRoute remembers where the user was heading; go back there after logging in
  const from = location.state?.from?.pathname ?? '/';

  // Controlled form: one state object holds every field
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // [e.target.name] is a computed key, so one handler updates whichever input changed
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); // without this the browser reloads the page and React state is lost
    setError('');
    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/auth/login`, formData);
      // login() stores the returned JWT in localStorage (see AuthContext.jsx)
      login(res.data.access_token);
    } catch (err) {
      setError(getErrorMessage(err, { 401: 'Incorrect email or password.' }));
    } finally {
      setSubmitting(false);
    }
  };

  // Once the token is saved (or if the user is already signed in), leave this page
  if (isAuthenticated) return <Navigate to={from} replace />;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold">Log in</h1>
      <p className="mt-1 text-slate-600">Welcome back. Log in to book study spaces and request books.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {error && (
          <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !formData.email || !formData.password}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        New here?{' '}
        <Link to="/register" className="font-medium text-indigo-700 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;
```

#### client/src/pages/RegisterPage.jsx

```jsx
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../utils/apiError.js';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function RegisterPage() {
  const { isAuthenticated, login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // The API only needs email and password; the confirmation is checked here in the browser
    if (formData.password.length < 8) {
      setError('Your password must be at least 8 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('The two passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/auth/register`, {
        email: formData.email,
        password: formData.password,
      });
      // The API logs the new user in: the returned JWT is stored in localStorage (see AuthContext.jsx)
      login(res.data.access_token);
    } catch (err) {
      setError(getErrorMessage(err, { 409: 'That email is already registered. Try logging in instead.' }));
    } finally {
      setSubmitting(false);
    }
  };

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold">Create an account</h1>
      <p className="mt-1 text-slate-600">Join to book study spaces and request books.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {error && (
          <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <p className="mt-1 text-xs text-slate-500">At least 8 characters.</p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !formData.email || !formData.password || !formData.confirmPassword}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-indigo-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;
```

#### client/src/components/ProtectedRoute.jsx

```jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Renders no UI of its own: children if there is a token, otherwise a redirect to /login.
// This is a convenience for the user only. The API's JwtAuthGuard is the real security check.
function ProtectedRoute({ children }) {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    // remember where the user was going, so login can send them back there
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;
```

#### client/src/pages/SpaceBookingPage.jsx

```jsx
import { useState } from 'react';

// A small hardcoded list for now. The real spaces, and conflict checking, arrive with the backend next week.
const SPACES = [
  { id: '1', name: 'Room A', seats: 4 },
  { id: '2', name: 'Room B', seats: 6 },
  { id: '3', name: 'Quiet Study Pod', seats: 1 },
  { id: '4', name: 'Group Study Hall', seats: 12 },
];

const EMPTY_FORM = { spaceId: '', date: '', startTime: '', endTime: '' };

// Today's date as YYYY-MM-DD in the user's own time zone (what <input type="date"> uses)
function todayString() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function validate(form) {
  const errors = {};
  if (!form.spaceId) errors.spaceId = 'Choose a study space.';
  if (!form.date) errors.date = 'Choose a date.';
  else if (form.date < todayString()) errors.date = 'The date cannot be in the past.';
  if (!form.startTime) errors.startTime = 'Choose a start time.';
  if (!form.endTime) errors.endTime = 'Choose an end time.';
  else if (form.startTime && form.endTime <= form.startTime) errors.endTime = 'The end time must be after the start time.';
  return errors;
}

function SpaceBookingPage() {
  // Controlled form: one state object holds every field, one handler updates them all
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // Next week this will POST the form to the bookings API with the user's JWT.
    // For now the form is complete and valid, so we just show the request back to the user.
    setSubmitted({ ...form, space: SPACES.find((s) => s.id === form.spaceId) });
  };

  const reset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitted(null);
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-emerald-200 bg-emerald-50 p-6" role="status">
        <h1 className="text-2xl font-bold text-emerald-900">Booking request ready</h1>
        <p className="mt-2 text-emerald-900">
          {submitted.space.name} ({submitted.space.seats} {submitted.space.seats === 1 ? 'seat' : 'seats'}) on{' '}
          {submitted.date}, {submitted.startTime} to {submitted.endTime}.
        </p>
        <p className="mt-2 text-sm text-emerald-800">
          Sending requests to the library arrives next week. Your details are filled in and valid.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Make another request
        </button>
      </div>
    );
  }

  const field = 'mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200';
  const border = (name) => (errors[name] ? 'border-rose-400' : 'border-slate-300');

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold">Book a study space</h1>
      <p className="mt-1 text-slate-600">Pick a space, a day and a time.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="spaceId" className="block text-sm font-medium">
            Study space
          </label>
          <select id="spaceId" name="spaceId" value={form.spaceId} onChange={handleChange} className={`${field} ${border('spaceId')}`}>
            <option value="">Select a study space</option>
            {SPACES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.seats} {s.seats === 1 ? 'seat' : 'seats'})
              </option>
            ))}
          </select>
          {errors.spaceId && <p className="mt-1 text-xs text-rose-700">{errors.spaceId}</p>}
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium">
            Date
          </label>
          <input id="date" name="date" type="date" min={todayString()} value={form.date} onChange={handleChange} className={`${field} ${border('date')}`} />
          {errors.date && <p className="mt-1 text-xs text-rose-700">{errors.date}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium">
              Start time
            </label>
            <input id="startTime" name="startTime" type="time" value={form.startTime} onChange={handleChange} className={`${field} ${border('startTime')}`} />
            {errors.startTime && <p className="mt-1 text-xs text-rose-700">{errors.startTime}</p>}
          </div>
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium">
              End time
            </label>
            <input id="endTime" name="endTime" type="time" value={form.endTime} onChange={handleChange} className={`${field} ${border('endTime')}`} />
            {errors.endTime && <p className="mt-1 text-xs text-rose-700">{errors.endTime}</p>}
          </div>
        </div>

        <button type="submit" className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Request Booking
        </button>
      </form>
    </div>
  );
}

export default SpaceBookingPage;
```

#### client/src/components/Navbar.jsx

```jsx
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useReadingList } from '../context/ReadingListContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-indigo-700'
  }`;

function Navbar() {
  // Read the shared reading list straight from the context: no props passed down
  const { readingList } = useReadingList();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const count = readingList.length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3"
      >
        <Link to="/" className="text-xl font-bold text-indigo-700">
          Library Catalog
        </Link>

        <div className="flex flex-wrap items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            Catalog
          </NavLink>

          <NavLink to="/reading-list" className={linkClass}>
            Reading list
            <span
              data-testid="reading-list-count"
              className={`ml-2 inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                count > 0 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {count}
            </span>
          </NavLink>

          <NavLink to="/book-space" className={linkClass}>
            Book a space
          </NavLink>

          {isAuthenticated ? (
            <>
              <span className="px-2 text-xs text-slate-500">
                {user?.role === 'LIBRARIAN' ? 'Librarian' : 'Signed in'}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:text-rose-700"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Log in
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Sign up
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
```

### Client test results (Vitest)

```text
Client test report - 2026-11-15 13:29 UTC
Command: cd client && npm test


 RUN  v5.1.0 (client folder)

 ✓ src/__tests__/readingList.test.jsx > readingListReducer (ADD_BOOK / REMOVE_BOOK / CLEAR_LIST) > ADD_BOOK adds a book 185ms
 ✓ src/__tests__/readingList.test.jsx > readingListReducer (ADD_BOOK / REMOVE_BOOK / CLEAR_LIST) > ADD_BOOK ignores a book that is already on the list 5ms
 ✓ src/__tests__/readingList.test.jsx > readingListReducer (ADD_BOOK / REMOVE_BOOK / CLEAR_LIST) > REMOVE_BOOK removes by id and leaves the others 2ms
 ✓ src/__tests__/readingList.test.jsx > readingListReducer (ADD_BOOK / REMOVE_BOOK / CLEAR_LIST) > CLEAR_LIST empties the list 1ms
 ✓ src/__tests__/readingList.test.jsx > readingListReducer (ADD_BOOK / REMOVE_BOOK / CLEAR_LIST) > an unknown action leaves the state alone 1ms
 ✓ src/__tests__/readingList.test.jsx > readingListReducer (ADD_BOOK / REMOVE_BOOK / CLEAR_LIST) > never changes the old state (it returns a new array) 1ms
 ✓ src/__tests__/auth.test.jsx > parseToken > reads the role and id from a JWT 312ms
 ✓ src/__tests__/auth.test.jsx > parseToken > returns null for garbage 7ms
 ✓ src/__tests__/catalog.test.jsx > Week 3 catalog still works (regression) > shows a loading skeleton, then the books 636ms
 ✓ src/__tests__/readingList.test.jsx > ReadingListProvider: persisted to and restored from localStorage > saves every change to localStorage 564ms
 ✓ src/__tests__/readingList.test.jsx > ReadingListProvider: persisted to and restored from localStorage > keeps only what the list needs, not the whole book record 143ms
 ✓ src/__tests__/readingList.test.jsx > ReadingListProvider: persisted to and restored from localStorage > restores the saved list on the first render (a page refresh) 29ms
 ✓ src/__tests__/readingList.test.jsx > ReadingListProvider: persisted to and restored from localStorage > survives a refresh: unmount, mount again, the book is still there 110ms
 ✓ src/__tests__/readingList.test.jsx > ReadingListProvider: persisted to and restored from localStorage > starts empty instead of crashing when storage holds corrupt JSON 167ms
 ✓ src/__tests__/readingList.test.jsx > ReadingListProvider: persisted to and restored from localStorage > starts empty instead of crashing when storage holds a value that is not a list 12ms
 ✓ src/__tests__/readingList.test.jsx > ReadingListProvider: persisted to and restored from localStorage > starts empty instead of crashing when storage holds null 8ms
 ✓ src/__tests__/readingList.test.jsx > ReadingListProvider: persisted to and restored from localStorage > CLEAR_LIST empties the saved copy too 62ms
 ✓ src/__tests__/readingList.test.jsx > ReadingListProvider: persisted to and restored from localStorage > useReadingList outside the provider explains the mistake 39ms
 ✓ src/__tests__/auth.test.jsx > Login page (controlled form posting to /auth/login) > the inputs are controlled: they show exactly what is typed 1582ms
 ✓ src/__tests__/readingList.test.jsx > reading list in the whole app > add from the catalog: the Navbar count updates without any props passed down 667ms
 ✓ src/__tests__/readingList.test.jsx > reading list in the whole app > clicking the button again removes the book 242ms
 ✓ src/__tests__/auth.test.jsx > Login page (controlled form posting to /auth/login) > the submit button stays disabled until both fields are filled 715ms
 ✓ src/__tests__/readingList.test.jsx > reading list in the whole app > the list is still there after a page refresh 349ms
 ✓ src/__tests__/catalog.test.jsx > Week 3 catalog still works (regression) > live search, with the genre filter, refetches with query params 1973ms
 ✓ src/__tests__/catalog.test.jsx > Week 3 catalog still works (regression) > empty and error states, and Try again 662ms
 ✓ src/__tests__/auth.test.jsx > Login page (controlled form posting to /auth/login) > posts the form to /auth/login, stores the returned JWT in localStorage and goes home 906ms
 ✓ src/__tests__/readingList.test.jsx > reading list in the whole app > the Reading list page shows the saved books, with Remove and Clear 991ms
 ✓ src/__tests__/readingList.test.jsx > reading list in the whole app > works for guests: no login needed for the reading list 57ms
 ✓ src/__tests__/catalog.test.jsx > Week 3 catalog still works (regression) > error state when the API is unreachable, and Try again recovers 271ms
 ✓ src/__tests__/readingList.test.jsx > reading list in the whole app > the detail page has the button too, and it shares the same list 158ms
 ✓ src/__tests__/catalog.test.jsx > Week 3 catalog still works (regression) > book detail page, and Book not found 177ms
 ✓ src/__tests__/catalog.test.jsx > Week 3 catalog still works (regression) > a card is one link to the detail page, and a book with no copies left says so 105ms
 ✓ src/__tests__/catalog.test.jsx > SearchBar debounce (fake timers) > calls onSearch once, 400ms after the LAST keystroke 51ms
 ✓ src/__tests__/auth.test.jsx > Login page (controlled form posting to /auth/login) > does not reload the page: e.preventDefault() is called 712ms
 ✓ src/__tests__/catalog.test.jsx > SearchBar debounce (fake timers) > typing a word fires ONE search request, not one per letter 634ms
 ✓ src/__tests__/catalog.test.jsx > apiError helper > joins the API validation messages 3ms
 ✓ src/__tests__/auth.test.jsx > Login page (controlled form posting to /auth/login) > wrong password (401): shows a clear message and stores nothing 634ms
 ✓ src/__tests__/auth.test.jsx > Login page (controlled form posting to /auth/login) > API down: says so 531ms
 ✓ src/__tests__/auth.test.jsx > Login page (controlled form posting to /auth/login) > validation errors (400) from the API are shown 208ms
 ✓ src/__tests__/auth.test.jsx > Register page (controlled form posting to /auth/register) > posts only email and password, stores the returned JWT and signs the user in 665ms
 ✓ src/__tests__/auth.test.jsx > Register page (controlled form posting to /auth/register) > mismatched passwords are caught in the browser: no request is sent 632ms
 ✓ src/__tests__/auth.test.jsx > Register page (controlled form posting to /auth/register) > a password under 8 characters is caught in the browser 481ms
 ✓ src/__tests__/auth.test.jsx > Register page (controlled form posting to /auth/register) > email already registered (409): friendly message 638ms
 ✓ src/__tests__/auth.test.jsx > ProtectedRoute (/book-space) > no token: redirects to /login 35ms
 ✓ src/__tests__/auth.test.jsx > ProtectedRoute (/book-space) > with a token: shows the booking form 51ms
 ✓ src/__tests__/auth.test.jsx > ProtectedRoute (/book-space) > after logging in, sends the user back to the page they wanted 435ms
 ✓ src/__tests__/auth.test.jsx > ProtectedRoute (/book-space) > an expired token counts as logged out, and is removed 30ms
 ✓ src/__tests__/auth.test.jsx > ProtectedRoute (/book-space) > a malformed token counts as logged out 41ms
 ✓ src/__tests__/auth.test.jsx > ProtectedRoute (/book-space) > a signed-in user visiting /login is sent away from it 72ms
 ✓ src/__tests__/auth.test.jsx > Navbar > logged out: shows Log in and Sign up 147ms
 ✓ src/__tests__/auth.test.jsx > Navbar > logged in: shows the role and Log out, which clears the token and goes home 173ms
 ✓ src/__tests__/auth.test.jsx > Navbar > stays signed in after a refresh 129ms
 ✓ src/__tests__/auth.test.jsx > Navbar > logging out of a protected page sends the user back to login when they return 178ms
 ✓ src/__tests__/spaceBooking.test.jsx > Space booking form > has a study space dropdown with a hardcoded list, plus date, start and end time inputs 395ms
 ✓ src/__tests__/spaceBooking.test.jsx > Space booking form > is a controlled form: the dropdown shows the chosen space 192ms
 ✓ src/__tests__/spaceBooking.test.jsx > Space booking form > the date picker will not offer days in the past 249ms
 ✓ src/__tests__/spaceBooking.test.jsx > Space booking form > an empty form shows an error for every field and does not submit 216ms
 ✓ src/__tests__/spaceBooking.test.jsx > Space booking form > end time must be after the start time 854ms
 ✓ src/__tests__/spaceBooking.test.jsx > Space booking form > a date in the past is rejected 1289ms
 ✓ src/__tests__/spaceBooking.test.jsx > Space booking form > a valid form shows the request back to the user, and can be reset 1218ms
 ✓ src/__tests__/spaceBooking.test.jsx > Space booking form > typing an end time equal to the start time is also rejected 1048ms

 Test Files  4 passed (4)
      Tests  61 passed (61)
   Start at  16:27:39
   Duration  90.37s (import 33%, environment 26%, transform 21%, tests 10%, setup 9%)

Environment  jsdom was created 4 times · 60.04s total, 26% of tracked time
             create it once per worker with pool: 'vmThreads' (keeps per-file isolation) or isolate: false (shares it across files)
             learn more: https://vitest.dev/guide/improving-performance#test-environments

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

