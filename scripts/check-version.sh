#!/usr/bin/env bash
# Usage: scripts/check-version.sh <version>
# Verifies that all language manifests declare the expected version.
# Run this before pushing release tags to catch mismatches early.
#
# Example: scripts/check-version.sh 0.2.0

set -euo pipefail

VERSION="${1:-}"
if [[ -z "$VERSION" ]]; then
  echo "Usage: $0 <version>"
  echo "Example: $0 0.2.0"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

PASS=true

check() {
  local label="$1"
  local found="$2"
  local expected="$3"
  if [[ "$found" == "$expected" ]]; then
    echo "  ✓  $label: $found"
  else
    echo "  ✗  $label: expected $expected, found '$found'"
    PASS=false
  fi
}

echo "Checking version $VERSION across all manifests..."
echo

# TypeScript
TS_VERSION=$(node -e "process.stdout.write(require('$ROOT/typescript/package.json').version)")
check "typescript/package.json           " "$TS_VERSION" "$VERSION"

# Java — first <version> tag in the pom is the project version; strip -SNAPSHOT if present
JAVA_VERSION=$(sed -n 's/.*<version>\([^<]*\)<\/version>.*/\1/p' "$ROOT/java/pom.xml" | head -1 | sed 's/-SNAPSHOT//')
check "java/pom.xml                      " "$JAVA_VERSION" "$VERSION"

# C#
CSHARP_VERSION=$(sed -n 's/.*<Version>\([^<]*\)<\/Version>.*/\1/p' "$ROOT/csharp/src/StandardCucumberSteps.csproj" | head -1)
check "csharp/src/StandardCucumberSteps.csproj" "$CSHARP_VERSION" "$VERSION"

echo

if [[ "$PASS" == true ]]; then
  echo "All versions match $VERSION. Safe to tag and release:"
  echo
  echo "  # TypeScript, Java, C#:"
  echo "  git tag v$VERSION"
  echo "  git push origin v$VERSION"
  echo
  echo "  # Go:"
  echo "  git tag go/v$VERSION"
  echo "  git push origin go/v$VERSION"
else
  echo "One or more versions do not match. Run 'scripts/set-version.sh $VERSION' to fix them."
  exit 1
fi
