# Library Catalog: React client

A single-page React app for the library (Weeks 3 and 4). It is built with Vite, React 19, React Router, axios and Tailwind CSS, and it calls the NestJS API in `../api`.

## Run it

1. Start the API: `cd api && npm run start:dev`
2. In a second terminal: `cd client && npm install && npm run dev`
3. Open http://localhost:5173
4. Run the automated tests with `cd client && npm test`

The API address comes from `client/.env`, which contains only `VITE_API_URL=http://localhost:3000`. It is committed on purpose because it holds no secret.

## What it does

- **Catalog (Week 3):** a responsive grid of books fetched live from `GET /books`, with debounced search, a genre filter, a sort control, loading, error and empty states, and a detail page at `/books/:id`
- **Reading list (Week 4):** add and remove books from any card or detail page; the Navbar shows the count. The list lives in a React Context with a reducer (`ADD_BOOK`, `REMOVE_BOOK`, `CLEAR_LIST`) and is saved in `localStorage`, so it survives a refresh
- **Accounts (Week 4):** controlled register and login forms that call `POST /auth/register` and `POST /auth/login`, keep the returned JWT in `localStorage`, and show clear errors
- **Protected route (Week 4):** `/book-space` redirects to `/login` when there is no token, then sends the user back after login. It holds a controlled booking form (space dropdown, date, start and end time) ready for the backend next week

## How the components fit together

```text
main.jsx      <BrowserRouter> wraps the whole app once
App.jsx       <AuthProvider> and <ReadingListProvider> wrap the Navbar and every route
 |- Navbar            reading-list count (ReadingListContext), Log in / Log out (AuthContext)
 '- Routes
     "/"              HomePage: owns search, genreId, sortBy ("lifting state up")
      |                 |- SearchBar (debounced), GenreFilter, BookGrid
      |                 '- BookCard (key={book.id}) -> ReadingListButton
     "/books/:id"     BookDetail: useParams() reads :id, GET /books/:id, ReadingListButton
     "/reading-list"  ReadingListPage: the saved books, Remove, Clear list
     "/login"         LoginPage: controlled form -> POST /auth/login -> JWT in localStorage
     "/register"      RegisterPage: controlled form -> POST /auth/register -> JWT in localStorage
     "/book-space"    <ProtectedRoute> -> SpaceBookingPage (controlled form)

ReadingListContext.jsx   useReducer + localStorage key "readingList"
AuthContext.jsx          token, login(), logout() + localStorage key "token"
```

## Week 4 requirement checklist

| Assignment requirement | File |
|---|---|
| Context with a reducer handling `ADD_BOOK`, `REMOVE_BOOK` and `CLEAR_LIST`, persisted to and restored from `localStorage` | `client/src/context/ReadingListContext.jsx` |
| Wraps its routes in `<ReadingListProvider>` | `client/src/App.jsx` |
| Controlled login form posting to `/auth/login` and storing the returned JWT | `client/src/pages/LoginPage.jsx` |
| Controlled registration form posting to `/auth/register` | `client/src/pages/RegisterPage.jsx` |
| Redirects to `/login` when there is no token, otherwise renders its children | `client/src/components/ProtectedRoute.jsx` |
| Controlled booking form: space dropdown, date, start time, end time | `client/src/pages/SpaceBookingPage.jsx` |
| Displays the reading list count from `ReadingListContext` | `client/src/components/Navbar.jsx` |

## Week 3 requirement checklist

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
client/.env
client/.gitignore
client/README.md
client/index.html
client/package-lock.json
client/package.json
client/src/App.jsx
client/src/__tests__/auth.test.jsx
client/src/__tests__/catalog.test.jsx
client/src/__tests__/readingList.test.jsx
client/src/__tests__/spaceBooking.test.jsx
client/src/components/BookCard.jsx
client/src/components/BookCover.jsx
client/src/components/BookGrid.jsx
client/src/components/GenreFilter.jsx
client/src/components/Navbar.jsx
client/src/components/ProtectedRoute.jsx
client/src/components/ReadingListButton.jsx
client/src/components/SearchBar.jsx
client/src/context/AuthContext.jsx
client/src/context/ReadingListContext.jsx
client/src/index.css
client/src/main.jsx
client/src/pages/BookDetail.jsx
client/src/pages/HomePage.jsx
client/src/pages/LoginPage.jsx
client/src/pages/NotFound.jsx
client/src/pages/ReadingListPage.jsx
client/src/pages/RegisterPage.jsx
client/src/pages/SpaceBookingPage.jsx
client/src/test/helpers.jsx
client/src/test/setup.js
client/src/utils/apiError.js
client/vite.config.js
client/vitest.config.js
```

## Automated test results

_Output of `cd client && npm test`, saved by `scripts/run-client-tests.sh`._

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

## Source code

_Generated from the real files by `scripts/update-readme.sh`._

### client/src/context/ReadingListContext.jsx

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

### client/src/App.jsx

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

### client/src/pages/LoginPage.jsx

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

### client/src/pages/RegisterPage.jsx

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

### client/src/components/ProtectedRoute.jsx

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

### client/src/pages/SpaceBookingPage.jsx

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

### client/src/components/Navbar.jsx

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
import ReadingListButton from './ReadingListButton.jsx';

function BookCard({ book }) {
  const inStock = book.availableCopies > 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <Link
        to={`/books/${book.id}`}
        className="flex flex-1 flex-col focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
      <div className="px-4 pb-4">
        <ReadingListButton book={book} />
      </div>
    </article>
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
import ReadingListButton from '../components/ReadingListButton.jsx';

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

          <div className="mt-4 max-w-xs">
            <ReadingListButton book={book} />
          </div>

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
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "axios": "1.21.1",
    "react": "19.3.1",
    "react-dom": "19.3.1",
    "react-router-dom": "7.18.5"
  },
  "devDependencies": {
    "@tailwindcss/vite": "4.3.5",
    "@testing-library/jest-dom": "7.0.1",
    "@testing-library/react": "16.3.3",
    "@testing-library/user-event": "14.6.10",
    "@vitejs/plugin-react": "6.3.0",
    "jsdom": "31.0.0",
    "tailwindcss": "4.3.5",
    "vite": "8.3.8",
    "vitest": "5.1.0"
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

### client/src/components/ReadingListButton.jsx

```jsx
import { useReadingList } from '../context/ReadingListContext.jsx';

// Adds a book to the reading list, or removes it if it is already there
function ReadingListButton({ book }) {
  const { addBook, removeBook, isInList } = useReadingList();
  const saved = isInList(book.id);

  return (
    <button
      type="button"
      onClick={() => (saved ? removeBook(book.id) : addBook(book))}
      aria-label={`${saved ? 'Remove from reading list' : 'Add to reading list'}: ${book.title}`}
      className={`w-full rounded-lg border px-3 py-2 text-sm font-medium transition ${
        saved
          ? 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
          : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:text-indigo-700'
      }`}
    >
      {saved ? 'Remove from reading list' : 'Add to reading list'}
    </button>
  );
}

export default ReadingListButton;
```

### client/src/context/AuthContext.jsx

```jsx
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export const TOKEN_KEY = 'token';

const AuthContext = createContext(null);

// A JWT has three base64url parts. The middle one holds { sub, role, exp }.
// This only READS the token for display; the API's JwtAuthGuard is what actually verifies it.
export function parseToken(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function isExpired(payload) {
  return !payload || Boolean(payload.exp && payload.exp * 1000 <= Date.now());
}

// Restore the saved JWT on refresh, dropping it if it is malformed or has expired
function loadSavedToken() {
  try {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (!saved) return null;
    if (isExpired(parseToken(saved))) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return saved;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(loadSavedToken);

  // login() keeps the JWT in localStorage so the user stays signed in after a refresh
  const login = useCallback((newToken) => {
    try {
      localStorage.setItem(TOKEN_KEY, newToken);
    } catch {
      // storage blocked: the user stays signed in for this visit only
    }
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // nothing to remove
    }
    setToken(null);
  }, []);

  const user = useMemo(() => {
    const payload = token ? parseToken(token) : null;
    return payload ? { id: payload.sub, role: payload.role } : null;
  }, [token]);

  const value = useMemo(
    () => ({ token, user, isAuthenticated: Boolean(token), login, logout }),
    [token, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
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

### client/src/pages/ReadingListPage.jsx

```jsx
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
```

### client/src/utils/apiError.js

```js
// Turns an axios error from the Nest API into a message a person can act on
export function getErrorMessage(err, messages = {}) {
  if (!err.response) return 'Could not reach the library server. Is the API running?';

  const { status, data } = err.response;

  // Nest's ValidationPipe answers 400 with { message: ['email must be an email', ...] }
  if (status === 400 && Array.isArray(data?.message)) return data.message.join('. ') + '.';

  return messages[status] ?? data?.message ?? 'Something went wrong. Please try again.';
}
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

