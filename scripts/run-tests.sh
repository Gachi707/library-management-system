#!/usr/bin/env bash
# Runs the Postman collection against your running API and saves the results to
# docs/newman-results.txt ONLY if every request and assertion passes.
# Start the API first:  cd api && npm run start:dev   (wait for "successfully started")
# Then, from anywhere:  bash scripts/run-tests.sh
set -uo pipefail
cd "$(dirname "$0")/.."

# Find an address where the REAL API answers: GET /genres must return a JSON array.
# (Something else on port 3000 could answer 200 with a web page, so a bare 200 is not enough.)
find_api() {
  local base out code body
  for base in http://127.0.0.1:3000 http://localhost:3000 "http://[::1]:3000"; do
    out=$(curl -s -g --max-time 8 -w $'\n%{http_code}' "$base/genres" 2>/dev/null) || continue
    code="${out##*$'\n'}"; body="${out%$'\n'*}"
    if [ "$code" = "200" ] && [[ "$body" == \[* ]]; then echo "$base"; return 0; fi
  done
  return 1
}

API=$(find_api) || {
  echo "Your API is not answering. Checked 127.0.0.1, localhost and [::1] on port 3000."
  for base in http://127.0.0.1:3000 http://localhost:3000; do
    out=$(curl -s -g --max-time 5 -w $'\n%{http_code}' "$base/genres" 2>/dev/null)
    echo "  $base/genres -> HTTP ${out##*$'\n'} $(printf '%s' "${out%$'\n'*}" | head -c 60 | tr -d '\r\n')"
  done
  echo ""
  echo "What to check:"
  echo "  1. The API terminal must show 'Nest application successfully started' and no red error."
  echo "     If it crashed with P1001, wake Neon (SQL Editor: SELECT 1;) and start it again."
  echo "  2. If a response above is a web page (HTML) or a 200 that is not a JSON list, a different"
  echo "     program is using port 3000. Find it with:  netstat -ano | findstr :3000"
  echo "docs/newman-results.txt was NOT changed."
  exit 1
}
echo "API found at $API"

OUT=$(mktemp)
npx --yes newman run docs/postman_collection.json --env-var "baseUrl=$API" --color off --reporters cli > "$OUT" 2>&1
STATUS=$?

if [ "$STATUS" -eq 0 ]; then
  cp "$OUT" docs/newman-results.txt
  echo "All requests passed. Saved to docs/newman-results.txt"
  grep -E "│ +(requests|assertions) " "$OUT"
else
  echo "Some requests FAILED, so docs/newman-results.txt was NOT updated."
  echo "---- first lines of the Newman output ----"
  head -45 "$OUT"
  echo "---- summary ----"
  sed -n '/┌/,/└/p' "$OUT" | head -20
  exit 1
fi
