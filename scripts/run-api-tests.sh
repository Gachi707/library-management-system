#!/usr/bin/env bash
# Runs the API's Jest tests and saves the report to docs/api-test-results.txt
# ONLY if every test passes. (Needs 'npm install' to have been run inside api/.)
# From anywhere:  bash scripts/run-api-tests.sh
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/api" || exit 1

if [ ! -d node_modules ]; then
  echo "Run 'npm install' inside api/ first."
  exit 1
fi

OUT=$(mktemp)
npm test -- --verbose --no-colors > "$OUT" 2>&1
STATUS=$?
sed -i 's/\x1b\[[0-9;]*m//g; /ExperimentalWarning/d; /--trace-warnings/d; /^> /d' "$OUT"
cat -s "$OUT" > "$OUT.tidy" && mv "$OUT.tidy" "$OUT"   # squeeze repeated blank lines

if [ "$STATUS" -eq 0 ]; then
  mkdir -p "$ROOT/docs"
  {
    echo "API test report - $(date -u '+%Y-%m-%d %H:%M UTC')"
    echo "Command: cd api && npm test"
    echo
    cat "$OUT"
  } > "$ROOT/docs/api-test-results.txt"
  echo "All API tests passed. Saved to docs/api-test-results.txt"
  grep -E "Test Suites:|Tests:" "$OUT"
else
  echo "Some API tests FAILED, so docs/api-test-results.txt was NOT updated. Failing lines:"
  grep -E "●|FAIL|Tests:" "$OUT" | head -30
  exit 1
fi
