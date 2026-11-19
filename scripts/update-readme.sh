#!/usr/bin/env bash
# Rebuilds the GENERATED parts of the documentation from the REAL files, so the docs can never
# drift out of date with the code:
#   1. the "Client" and "Repository Contents" sections of the root README.md (between the markers)
#   2. client/README.md  (documents the React client and embeds its source code)
#   3. api/README.md     (documents the API, the borrow-request and booking rules, and embeds the Week 5 code)
# Everything you wrote yourself in README.md (intro, setup, API notes, Schema Decisions) is left alone.
# Run from anywhere:  bash scripts/update-readme.sh
set -euo pipefail
cd "$(dirname "$0")/.."

REPO_URL="https://github.com/Gachi707/library-management-system/blob/main"
START='<!-- REQUIRED-FILES:START -->'
END='<!-- REQUIRED-FILES:END -->'
LIST=scripts/readme-files.txt
RESULTS=docs/newman-results.txt
CLIENT_RESULTS=docs/client-test-results.txt
API_RESULTS=docs/api-test-results.txt

files() {
  while IFS= read -r pattern || [ -n "$pattern" ]; do
    pattern="${pattern%$'\r'}"
    case "$pattern" in ''|\#*) continue ;; esac
    compgen -G "$pattern" || true
  done < "$LIST" | awk '!seen[$0]++'
}

# True only if the Newman summary shows 0 failures for requests, assertions and test-scripts
results_ok() {
  [ -f "$RESULTS" ] || return 1
  sed 's/│/|/g' "$RESULTS" | awk -F'|' '
    $2 ~ /^ *(requests|assertions|test-scripts) *$/ { seen++; f = $4; gsub(/ /, "", f); if (f != "0") bad = 1 }
    END { exit (seen >= 3 && !bad) ? 0 : 1 }'
}

# True only if the Vitest summary line says tests passed and none failed
client_tests_ok() {
  [ -f "$CLIENT_RESULTS" ] || return 1
  local line
  line=$(grep -E '^ *Tests ' "$CLIENT_RESULTS" | head -1 || true)
  [ -n "$line" ] && grep -q 'passed' <<<"$line" && ! grep -q 'failed' <<<"$line"
}

# True only if the Jest summary line says tests passed and none failed
api_tests_ok() {
  [ -f "$API_RESULTS" ] || return 1
  local line
  line=$(grep -E '^ *Tests:' "$API_RESULTS" | head -1 || true)
  [ -n "$line" ] && grep -q 'passed' <<<"$line" && ! grep -q 'failed' <<<"$line"
}

lang() {
  case "$1" in
    *.ts) echo ts ;;
    *.jsx) echo jsx ;;
    *.js) echo js ;;
    *.html) echo html ;;
    *.css) echo css ;;
    *.prisma) echo prisma ;;
    *.sql) echo sql ;;
    *.json) echo json ;;
    *.md) echo markdown ;;
    *) echo text ;;
  esac
}

# Client files to embed in client/README.md: the assignments' required files first, then the rest
# (the automated tests are listed in the file tree but not embedded)
client_files() {
  local priority="client/src/context/ReadingListContext.jsx client/src/App.jsx client/src/pages/LoginPage.jsx client/src/pages/RegisterPage.jsx client/src/components/ProtectedRoute.jsx client/src/pages/SpaceBookingPage.jsx client/src/components/Navbar.jsx client/src/main.jsx client/src/pages/HomePage.jsx client/src/components/BookGrid.jsx client/src/components/BookCard.jsx client/src/components/SearchBar.jsx client/src/pages/BookDetail.jsx client/.env"
  local f
  for f in $priority; do [ -f "$f" ] && echo "$f"; done
  git ls-files --cached --others --exclude-standard client \
    | grep -E '^client/(src/.*|index\.html|vite\.config\.js|package\.json)$' \
    | grep -vE '^client/src/(__tests__|test)/' | sort \
    | while IFS= read -r f; do
        case " $priority " in *" $f "*) ;; *) echo "$f" ;; esac
      done
}

# API files to embed in api/README.md: the Week 5 files (plus the pieces they rely on)
api_files() {
  local f
  {
    files | grep '^api/' || true
    for f in api/src/auth/current-user.decorator.ts api/src/borrow-requests/dto/update-borrow-request.dto.ts api/src/books/books.service.ts api/prisma/seed.ts; do
      [ -f "$f" ] && echo "$f"
    done
    compgen -G 'api/prisma/migrations/*/migration.sql' || true
  } | awk '!seen[$0]++'
}

write_api_readme() {
  [ -d api/src/borrow-requests ] || return 0
  {
    cat <<'MD'
# Library API (NestJS, Prisma, PostgreSQL)

The backend for the library system. Weeks 1 and 2 built the catalog and authentication. Week 5 adds the transactional core: **borrow requests** with a status lifecycle and fines, and **space bookings** that can never overlap.

## Run it

1. `cd api && npm install`
2. Copy `.env.example` to `.env` and set `DATABASE_URL` and `JWT_SECRET`
3. `npx prisma migrate dev` (creates the tables), then `npx prisma db seed` (genres, books, study spaces and a dev librarian)
4. `npm run start:dev`
5. Tests: `npm test` (no database needed)

## Endpoints added in Week 5

| Method and path | Who | What it does |
|---|---|---|
| `POST /borrow-requests` | any logged-in user | Ask to borrow a book: body `{ "bookId": 1 }`. Starts as `REQUESTED` |
| `GET /borrow-requests/mine` | any logged-in user | My requests, newest first |
| `PATCH /borrow-requests/:id/cancel` | the owner | Withdraw a request that has not been collected |
| `GET /admin/borrow-requests?status=` | librarian | Everyone's requests, optionally one status |
| `PATCH /admin/borrow-requests/:id` | librarian | Move a request to its next status: `{ "status": "APPROVED" }` |
| `GET /spaces` | public | The study spaces |
| `POST /bookings` | any logged-in user | Book a space: `{ spaceId, date, startTime, endTime }`. `409` if it overlaps |
| `GET /bookings/mine` | any logged-in user | My bookings |
| `PATCH /bookings/:id/cancel` | the owner, or a librarian | Cancel a booking |
| `GET /admin/bookings?date=` | librarian | Every booking, optionally one day |

## The borrow-request lifecycle

```text
REQUESTED --approve--> APPROVED --hand over--> BORROWED --return--> RETURNED
    |                     |                       |  ^
    '-----cancel/decline--'-> CANCELLED           |  '-- return --- OVERDUE
                                                  '--- past due date ---^
```

- Only the moves drawn above are allowed. Anything else is `409 Conflict`, and nothing changes.
- **Stock:** approving sets one copy aside (`availableCopies - 1`, and refused when none are left). Returning or cancelling an approved request puts it back. The stock change and the status change happen in one database transaction, so they succeed or fail together.
- **Fines:** when a book is returned, `calculateFine(dueDate, returnDate)` charges 10 per day, counting any started day as a full day. The fine is worked out on the server from the stored due date. A `fineAmount` sent by a client is never used.
- **Who is who:** the patron's id always comes from the verified JWT, never from the request body. `status`, dates and fines cannot be set by a patron.
- A patron may have only one open request per book. Each request keeps a snapshot of the book's title and author.

## Space bookings

- Two bookings of the same space on the same day overlap exactly when each one starts before the other ends. The check is a single Prisma query: `startTime < newEnd` and `endTime > newStart`, only counting `CONFIRMED` bookings. A booking that ends at 12:00 does not clash with one that starts at 12:00.
- The check and the insert run in a **Serializable** transaction, so two people booking at the same instant cannot both succeed.
- Cancelled bookings free the slot again. Dates are `YYYY-MM-DD` and times are 24-hour `HH:MM`; the end must be after the start and the date cannot be in the past.

## Design decisions

- `BorrowRequest` keeps `bookTitle` and `bookAuthor`, so history still reads correctly if the catalog entry changes. A book that has borrow requests cannot be deleted (`409`), because the foreign key protects the history.
- Declining a request is a move to `CANCELLED`; there is no separate status for it.
- Librarian routes sit under `/admin/...` and use `JwtAuthGuard` first, then `RolesGuard`.

## Files in this folder

MD
    echo '```text'
    git ls-files --cached --others --exclude-standard api | grep -vE '^api/package-lock.json$'
    echo '```'
    echo ""
    if api_tests_ok; then
      echo "## Automated test results"
      echo ""
      echo "_Output of \`cd api && npm test\`, saved by \`scripts/run-api-tests.sh\`._"
      echo ""
      echo '```text'
      tr -d '\r' < "$API_RESULTS"
      echo '```'
      echo ""
    fi
    echo "## Source code"
    echo ""
    echo "_Generated from the real files by \`scripts/update-readme.sh\`._"
    echo ""
    api_files | while IFS= read -r f; do
      echo "### $f"
      echo ""
      echo '```'"$(lang "$f")"
      tr -d '\r' < "$f"
      echo '```'
      echo ""
    done
  } > api/README.md
}

write_client_readme() {
  [ -f client/package.json ] || return 0
  {
    cat <<'MD'
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

MD
    echo '```text'
    git ls-files --cached --others --exclude-standard client
    echo '```'
    echo ""
    if client_tests_ok; then
      echo "## Automated test results"
      echo ""
      echo "_Output of \`cd client && npm test\`, saved by \`scripts/run-client-tests.sh\`._"
      echo ""
      echo '```text'
      tr -d '\r' < "$CLIENT_RESULTS"
      echo '```'
      echo ""
    fi
    echo "## Source code"
    echo ""
    echo "_Generated from the real files by \`scripts/update-readme.sh\`._"
    echo ""
    client_files | while IFS= read -r f; do
      echo "### $f"
      echo ""
      echo '```'"$(lang "$f")"
      tr -d '\r' < "$f"
      echo '```'
      echo ""
    done
  } > client/README.md
}

BLOCK=$(mktemp); CLEAN=$(mktemp); STRIPPED=$(mktemp)

{
  echo "$START"
  if [ -f client/package.json ]; then
    cat <<'MD'
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

MD
  fi
  if [ -d api/src/borrow-requests ]; then
    cat <<'MD'
## Borrow requests and bookings (Week 5)

The API now handles borrowing and study-space bookings. The full documentation, the lifecycle rules and the complete source are in [`api/README.md`](api/README.md).

1. `cd api && npx prisma migrate dev` creates the new tables, then `npx prisma db seed` adds the study spaces
2. Unit tests (no database needed): `cd api && npm test` (the saved report is `docs/api-test-results.txt`)
3. API checks against the running server: `bash scripts/run-tests.sh` (Postman collection, report in `docs/newman-results.txt`)

- Borrow requests move through `REQUESTED`, `APPROVED`, `BORROWED`, `RETURNED`, `OVERDUE` and `CANCELLED`, and only legal moves are accepted. Approving sets a copy aside and returning frees it, inside one database transaction.
- Fines are worked out on the server by `calculateFine()` from the stored due date, never taken from the client.
- Space bookings are checked for overlaps with one Prisma query (`startTime < newEnd` and `endTime > newStart`) inside a Serializable transaction, so a space can never be double-booked.
- Librarian routes: `GET /admin/borrow-requests`, `PATCH /admin/borrow-requests/:id`, `GET /admin/bookings`.

| Week 5 requirement | File |
|---|---|
| `BorrowRequest`, `Space`, `Booking` models and the `BorrowStatus` and `BookingStatus` enums, migrated | `api/prisma/schema.prisma` |
| `POST /borrow-requests`, and the librarian-only `PATCH` that updates the status | `api/src/borrow-requests/borrow-requests.controller.ts` |
| Request creation, the status lifecycle, stock changes and fines | `api/src/borrow-requests/borrow-requests.service.ts` |
| Validated input for a borrow request | `api/src/borrow-requests/dto/create-borrow-request.dto.ts` |
| `calculateFine` and its passing Jest test | `api/src/borrow-requests/fine-calculator.ts`, `fine-calculator.spec.ts` |
| `POST /bookings` with the overlap check and `409 Conflict` | `api/src/bookings/bookings.controller.ts`, `bookings.service.ts` |
| Validated input for a booking | `api/src/bookings/dto/create-booking.dto.ts` |

MD
  fi
  echo "## Repository Contents"
  echo ""
  echo "_Generated from the real files by \`scripts/update-readme.sh\`._"
  echo ""
  echo "### Every file in the repository"
  echo ""
  echo '```text'
  git ls-files --cached --others --exclude-standard
  echo '```'
  echo ""
  echo "### Required files"
  echo ""
  echo "| File | Link |"
  echo "|---|---|"
  files | while IFS= read -r f; do
    echo "| \`$f\` | [view]($REPO_URL/$f) |"
  done
  echo ""
  echo "### Source code"
  echo ""
  files | while IFS= read -r f; do
    echo "#### $f"
    echo ""
    echo '```'"$(lang "$f")"
    tr -d '\r' < "$f"
    echo '```'
    echo ""
  done
  if api_tests_ok; then
    echo "### API test results (Jest)"
    echo ""
    echo '```text'
    tr -d '\r' < "$API_RESULTS"
    echo '```'
    echo ""
  fi
  if client_tests_ok; then
    echo "### Client test results (Vitest)"
    echo ""
    echo '```text'
    tr -d '\r' < "$CLIENT_RESULTS"
    echo '```'
    echo ""
  fi
  if results_ok; then
    echo "### API test results (Newman, run against the live API)"
    echo ""
    echo '```text'
    tr -d '\r' < "$RESULTS"
    echo '```'
    echo ""
  fi
  echo "$END"
} > "$BLOCK"

tr -d '\r' < README.md > "$CLEAN"

# 1. Remove the previous generated block (only if BOTH markers are present)
if grep -qF "$START" "$CLEAN" && grep -qF "$END" "$CLEAN"; then
  awk -v s="$START" -v e="$END" '
    $0 == s { skip = 1; next }
    skip && $0 == e { skip = 0; next }
    !skip { print }' "$CLEAN" | cat -s > "$STRIPPED"
else
  cat -s "$CLEAN" > "$STRIPPED"
fi

# 1b. The generated block now contains the Client section, so remove an older hand-pasted copy of it
#     (only a section titled exactly "## Client (Week 3)", up to the next "## " heading)
if grep -q '^## Client (Week 3)$' "$STRIPPED"; then
  awk '
    /^## Client \(Week 3\)$/ { skip = 1; next }
    skip && /^## / { skip = 0 }
    !skip { print }' "$STRIPPED" | cat -s > "$CLEAN"
  cp "$CLEAN" "$STRIPPED"
fi

# 2. Put the fresh block right before "## Schema Decisions" (or at the end)
if grep -q '^## Schema Decisions' "$STRIPPED"; then
  awk -v g="$BLOCK" '
    /^## Schema Decisions/ && !done { while ((getline l < g) > 0) print l; print ""; done = 1 }
    { print }' "$STRIPPED" > README.md
else
  { cat "$STRIPPED"; echo ""; cat "$BLOCK"; } > README.md
fi

write_api_readme
write_client_readme

rm -f "$BLOCK" "$CLEAN" "$STRIPPED"
echo "README.md updated from $(files | wc -l | tr -d ' ') required file(s)"
[ -f api/README.md ] && [ -d api/src/borrow-requests ] && echo "api/README.md written with $(api_files | wc -l | tr -d ' ') source file(s)"
[ -f client/README.md ] && echo "client/README.md written with $(client_files | wc -l | tr -d ' ') source file(s)"
if [ -f "$RESULTS" ] && ! results_ok; then
  echo "WARNING: $RESULTS shows failed requests, so it was NOT put in the README."
  echo "         Run: bash scripts/run-tests.sh   (with the API running) and then this script again."
fi
if [ -f "$API_RESULTS" ] && ! api_tests_ok; then
  echo "WARNING: $API_RESULTS shows failed tests, so it was NOT put in the README."
  echo "         Run: bash scripts/run-api-tests.sh   and then this script again."
fi
if [ -f "$CLIENT_RESULTS" ] && ! client_tests_ok; then
  echo "WARNING: $CLIENT_RESULTS shows failed tests, so it was NOT put in the README."
  echo "         Run: bash scripts/run-client-tests.sh   and then this script again."
fi
