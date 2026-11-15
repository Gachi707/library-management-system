#!/usr/bin/env bash
# Rebuilds the GENERATED parts of the documentation from the REAL files, so the docs can never
# drift out of date with the code:
#   1. the "Client" and "Repository Contents" sections of the root README.md (between the markers)
#   2. client/README.md  (documents the React client and embeds its source code)
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

write_client_readme

rm -f "$BLOCK" "$CLEAN" "$STRIPPED"
echo "README.md updated from $(files | wc -l | tr -d ' ') required file(s)"
[ -f client/README.md ] && echo "client/README.md written with $(client_files | wc -l | tr -d ' ') source file(s)"
if [ -f "$RESULTS" ] && ! results_ok; then
  echo "WARNING: $RESULTS shows failed requests, so it was NOT put in the README."
  echo "         Run: bash scripts/run-tests.sh   (with the API running) and then this script again."
fi
if [ -f "$CLIENT_RESULTS" ] && ! client_tests_ok; then
  echo "WARNING: $CLIENT_RESULTS shows failed tests, so it was NOT put in the README."
  echo "         Run: bash scripts/run-client-tests.sh   and then this script again."
fi
