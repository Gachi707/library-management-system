#!/usr/bin/env bash
# Rebuilds the generated "Repository Contents" section of README.md from the REAL files,
# so the README can never drift out of date with the code. Everything you wrote yourself
# (intro, setup, API notes, Schema Decisions) is left exactly as it is.
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
    *.prisma) echo prisma ;;
    *.sql) echo sql ;;
    *.json) echo json ;;
    *.md) echo markdown ;;
    *) echo text ;;
  esac
}

BLOCK=$(mktemp); CLEAN=$(mktemp); STRIPPED=$(mktemp)

{
  echo "$START"
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
  if results_ok; then
    echo "### API test results (Newman, run against the live API)"
    echo ""
    echo '```text'
    tr -d '\r' < "$RESULTS"
    echo '```'
    echo ""
  fi
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

rm -f "$BLOCK" "$CLEAN" "$STRIPPED"
echo "README.md updated from $(files | wc -l | tr -d ' ') required file(s)"
if [ -f "$RESULTS" ] && ! results_ok; then
  echo "WARNING: $RESULTS shows failed requests, so it was NOT put in the README."
  echo "         Run: bash scripts/run-tests.sh   (with the API running) and then this script again."
fi
