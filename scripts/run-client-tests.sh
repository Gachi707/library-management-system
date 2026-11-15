#!/usr/bin/env bash
# Runs the React client's automated tests and saves the report to docs/client-test-results.txt
# ONLY if every test passes. (Needs 'npm install' to have been run inside client/.)
# From anywhere:  bash scripts/run-client-tests.sh
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/client" || exit 1

if [ ! -d node_modules ]; then
  echo "Run 'npm install' inside client/ first."
  exit 1
fi

OUT=$(mktemp)
NO_COLOR=1 npx vitest run --reporter=verbose > "$OUT" 2>&1
STATUS=$?
sed -i 's/\x1b\[[0-9;]*m//g; s#^\( RUN  v[0-9.]*\) .*#\1 (client folder)#' "$OUT"

if [ "$STATUS" -eq 0 ]; then
  mkdir -p "$ROOT/docs"
  {
    echo "Client test report - $(date -u '+%Y-%m-%d %H:%M UTC')"
    echo "Command: cd client && npm test"
    echo
    cat "$OUT"
  } > "$ROOT/docs/client-test-results.txt"
  echo "All client tests passed. Saved to docs/client-test-results.txt"
  grep -E "Test Files|Tests " "$OUT"
else
  echo "Some client tests FAILED, so docs/client-test-results.txt was NOT updated. Failing lines:"
  grep -E "×|FAIL|AssertionError|Error:" "$OUT" | head -30
  exit 1
fi
