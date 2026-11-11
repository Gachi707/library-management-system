#!/usr/bin/env bash
# Rebuilds the GENERATED parts of the documentation from the REAL files, so the docs can never
# drift out of date with the code:
#   1. the "Repository Contents" section of the root README.md  (between the REQUIRED-FILES markers)
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

files() {
  while IFS= read -r pattern || [ -n "$pattern" ]; do
    pattern="${pattern%$'\r'}"
    case "$pattern" in ''|\#*) continue ;; esac
    compgen -G "$pattern" || true
  done < "$LIST"
}

# True only if the Newman summary shows 0 failures for requests, assertions and test-scripts
results_ok() {
  [ -f "$RESULTS" ] || return 1
  sed 's/│/|/g' "$RESULTS" | awk -F'|' '
    $2 ~ /^ *(requests|assertions|test-scripts) *$/ { seen++; f = $4; gsub(/ /, "", f); if (f != "0") bad = 1 }
    END { exit (seen >= 3 && !bad) ? 0 : 1 }'
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

# Client files to embed in client/README.md: the assignment's required files first, then the rest
client_files() {
  local priority="client/src/main.jsx client/src/App.jsx client/src/pages/HomePage.jsx client/src/components/BookGrid.jsx client/src/components/BookCard.jsx client/src/components/SearchBar.jsx client/src/pages/BookDetail.jsx client/.env"
  local f
  for f in $priority; do [ -f "$f" ] && echo "$f"; done
  git ls-files --cached --others --exclude-standard client \
    | grep -E '^client/(src/.*|index\.html|vite\.config\.js|package\.json)$' | sort \
    | while IFS= read -r f; do
        case " $priority " in *" $f "*) ;; *) echo "$f" ;; esac
      done
}

write_client_readme() {
  [ -f client/package.json ] || return 0
  {
    cat <<'MD'
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

MD
    echo '```text'
    git ls-files --cached --others --exclude-standard client
    echo '```'
    echo ""
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
