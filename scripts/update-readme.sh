#!/usr/bin/env bash
# Rebuilds the "Required Files" section of README.md from the REAL files listed in
# scripts/readme-files.txt, so the README can never drift out of date with the code.
# Run from anywhere:  bash scripts/update-readme.sh
set -euo pipefail
cd "$(dirname "$0")/.."

REPO_URL="https://github.com/Gachi707/library-management-system/blob/main"
START='<!-- REQUIRED-FILES:START -->'
END='<!-- REQUIRED-FILES:END -->'
LIST=scripts/readme-files.txt

files() {
  while IFS= read -r pattern || [ -n "$pattern" ]; do
    pattern="${pattern%$'\r'}"
    case "$pattern" in ''|\#*) continue ;; esac
    compgen -G "$pattern" || true
  done < "$LIST"
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

GEN=$(mktemp)
CLEAN=$(mktemp)

{
  echo "## Required Files"
  echo ""
  echo "_Generated from the real files by \`scripts/update-readme.sh\`._"
  echo ""
  echo "| File | Link |"
  echo "|---|---|"
  files | while IFS= read -r f; do
    echo "| \`$f\` | [view]($REPO_URL/$f) |"
  done
  echo ""
  files | while IFS= read -r f; do
    echo "### $f"
    echo ""
    echo '```'"$(lang "$f")"
    tr -d '\r' < "$f"
    echo '```'
    echo ""
  done
} > "$GEN"

tr -d '\r' < README.md > "$CLEAN"

if grep -qF "$START" "$CLEAN"; then
  # Later runs: replace what is between the markers
  awk -v s="$START" -v e="$END" -v g="$GEN" '
    $0 == s { print; while ((getline l < g) > 0) print l; skip = 1; next }
    $0 == e { skip = 0 }
    !skip { print }
  ' "$CLEAN" > README.md
else
  # First run: drop any old hand-pasted deliverables section, then add the markers
  awk '/^## (Week 1 Deliverables|Required Files)/ { exit } { print }' "$CLEAN" > README.md
  { echo ""; echo "$START"; cat "$GEN"; echo "$END"; } >> README.md
fi

rm -f "$GEN" "$CLEAN"
echo "README.md updated from $(files | wc -l | tr -d ' ') file(s)"
