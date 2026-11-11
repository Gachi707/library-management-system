#!/usr/bin/env bash
# Checks the repository the way a stranger (or the grader) sees it on GitHub, with no login:
#   1. everything is committed and pushed
#   2. every required file is publicly readable on the main branch and has the key code
#   3. no secrets were pushed
# Run from anywhere:  bash scripts/verify-submission.sh
set -uo pipefail
cd "$(dirname "$0")/.."

REPO="Gachi707/library-management-system"
RAW="${RAW_BASE:-https://raw.githubusercontent.com/$REPO/main}"
FAILS=0
pass() { echo "  PASS  $1"; }
fail() { echo "  FAIL  $1"; FAILS=$((FAILS + 1)); }

echo "1. Is everything pushed?"
git fetch origin main --quiet 2>/dev/null || echo "  (could not reach GitHub; check your internet)"
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main 2>/dev/null || echo none)
BRANCH=$(git rev-parse --abbrev-ref HEAD)
[ "$BRANCH" = "main" ] && pass "on branch main" || fail "on branch '$BRANCH', not main (run: git checkout main)"
if [ -z "$(git status --porcelain)" ]; then pass "nothing left uncommitted"; else fail "uncommitted changes (run: git add . && git commit -m \"...\" && git push)"; fi
if [ "$LOCAL" = "$REMOTE" ]; then pass "your latest commit (${LOCAL:0:7}) is on GitHub"; else fail "your latest commit (${LOCAL:0:7}) is NOT on GitHub yet (run: git push)"; fi

echo ""
echo "2. Required files, read from GitHub with no login"
check_file() {
  local path="$1"; shift
  local out code body pat
  out=$(curl -s -L -w $'\n%{http_code}' "$RAW/$path?cb=$RANDOM$RANDOM")
  code="${out##*$'\n'}"; body="${out%$'\n'*}"
  if [ "$code" != "200" ]; then fail "$path  (HTTP $code)"; return; fi
  for pat in "$@"; do
    if ! grep -qE -- "$pat" <<<"$body"; then fail "$path is on GitHub but is missing: $pat"; return; fi
  done
  pass "$path"
}
check_file api/prisma/schema.prisma 'enum Role' 'PATRON' 'LIBRARIAN' 'model Book' '@relation'
check_file api/prisma/seed.ts 'genre' 'book'
check_file api/src/prisma/prisma.service.ts 'extends PrismaClient' 'OnModuleInit' '\$connect'
check_file api/.env.example 'DATABASE_URL'
check_file api/src/main.ts 'whitelist: true' 'enableCors'
check_file api/src/genres/genres.controller.ts "@Controller\('genres'\)" '@Post' '@Patch' '@Delete' 'RolesGuard'
check_file api/src/genres/genres.service.ts 'findAll' 'findOne' 'create' 'update' 'remove'
check_file api/src/genres/genres.module.ts 'GenresService'
check_file api/src/books/dto/create-book.dto.ts 'IsString' 'IsInt' 'Min\(1\)' 'genreId'
check_file api/src/books/books.controller.ts "@Query\('genreId'\)" "@Query\('search'\)" "@Query\('page'\)" "@Query\('limit'\)" 'UseGuards' 'RolesGuard'
check_file api/src/books/books.service.ts 'skip' 'take' 'contains' 'insensitive'
check_file api/src/auth/auth.controller.ts "register" "login"
check_file api/src/auth/auth.service.ts 'bcrypt' 'access_token'
check_file api/src/auth/auth.module.ts 'JwtModule'
check_file api/src/auth/jwt.strategy.ts 'JWT_SECRET' 'PassportStrategy'
check_file api/src/auth/jwt-auth.guard.ts "AuthGuard\('jwt'\)"
check_file api/src/auth/roles.decorator.ts 'SetMetadata'
check_file api/src/auth/roles.guard.ts 'user.role' 'Reflector'
check_file docs/postman_collection.json '"item"' 'auth/login' '/books'

echo ""
echo "   Week 3 (React client)"
check_file client/src/main.jsx 'BrowserRouter' '<App'
check_file client/src/App.jsx 'Routes' 'path="/"' '/books/:id'
check_file client/src/pages/HomePage.jsx 'BookGrid' 'SearchBar' 'GenreFilter' 'useState'
check_file client/src/components/BookGrid.jsx 'axios' 'VITE_API_URL' 'genreId' 'search' 'Loading' 'No books found'
check_file client/src/components/BookCard.jsx 'book' 'Link'
check_file client/src/components/SearchBar.jsx 'setTimeout' 'clearTimeout' 'onSearch'
check_file client/src/pages/BookDetail.jsx 'useParams' 'axios' '/books/'
check_file client/.env 'VITE_API_URL'
check_file client/README.md 'BrowserRouter' 'useParams' 'setTimeout' 'clearTimeout' 'VITE_API_URL' 'GenreFilter'
check_file README.md '## Client \(Week 3\)' '#### client/src/App.jsx' '#### client/src/components/SearchBar.jsx'
out=$(curl -s -L "$RAW/client/.env?cb=$RANDOM$RANDOM")
if grep -vE '^[[:space:]]*(#.*)?$' <<<"$out" | grep -qvE '^VITE_API_URL='; then
  fail "client/.env contains something besides VITE_API_URL (it is public: never put secrets in it)"
else
  pass "client/.env holds only VITE_API_URL"
fi

out=$(curl -s -L -w $'\n%{http_code}' "$RAW/docs/newman-results.txt?cb=$RANDOM$RANDOM")
code="${out##*$'\n'}"; body="${out%$'\n'*}"
if [ "$code" = "200" ]; then
  if sed 's/│/|/g' <<<"$body" | awk -F'|' '
      $2 ~ /^ *(requests|assertions|test-scripts) *$/ { seen++; f = $4; gsub(/ /, "", f); if (f != "0") bad = 1 }
      END { exit (seen >= 3 && !bad) ? 0 : 1 }'; then
    pass "docs/newman-results.txt on GitHub shows every request passing"
  else
    fail "docs/newman-results.txt on GitHub shows FAILED requests (run: bash scripts/run-tests.sh, then update the README and push)"
  fi
else
  echo "  note  docs/newman-results.txt is not on GitHub (optional, but recommended)"
fi

echo ""
echo "3. Secrets"
code=$(curl -s -o /dev/null -w "%{http_code}" "$RAW/api/.env?cb=$RANDOM$RANDOM")
[ "$code" = "404" ] && pass "api/.env is NOT on GitHub" || fail "api/.env is publicly readable (HTTP $code)!"
HOST_PATTERN='neon''\.tech'   # written in two pieces so this file never matches itself
if git grep -qiE "$HOST_PATTERN" -- . 2>/dev/null; then
  fail "your database host name is inside a tracked file (find it with: git grep -il neon)"
else
  pass "no database connection string in tracked files"
fi

echo ""
if [ "$FAILS" -eq 0 ]; then
  echo "ALL CHECKS PASSED. Safe to submit: https://github.com/$REPO"
else
  echo "$FAILS check(s) failed. Fix them, push, wait a minute, and run this again before submitting."
  echo "(raw.githubusercontent.com can lag a few minutes behind a push.)"
  exit 1
fi
