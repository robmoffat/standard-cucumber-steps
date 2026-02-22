#!/usr/bin/env bash
# Usage: scripts/set-version.sh <version>
# Updates the version number in all language manifests.
# After running this, commit the changes and then run check-version.sh before tagging.
#
# Example: scripts/set-version.sh 0.2.0

set -euo pipefail

VERSION="${1:-}"
if [[ -z "$VERSION" ]]; then
  echo "Usage: $0 <version>"
  echo "Example: $0 0.2.0"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Setting version to $VERSION in all manifests..."
echo

# TypeScript — npm version handles the JSON edit cleanly
cd "$ROOT/typescript"
npm version "$VERSION" --no-git-tag-version --allow-same-version -q
echo "  ✓  typescript/package.json"

# Java — update the top-level <version> tag (project version, not a dependency)
cd "$ROOT/java"
sed -i.bak "0,/<version>[^<]*<\/version>/s|<version>[^<]*</version>|<version>$VERSION</version>|" pom.xml
rm -f pom.xml.bak
echo "  ✓  java/pom.xml"

# C# — update <Version> in the library project file
cd "$ROOT"
sed -i.bak "s|<Version>[^<]*</Version>|<Version>$VERSION</Version>|" csharp/src/StandardCucumberSteps.csproj
rm -f csharp/src/StandardCucumberSteps.csproj.bak
echo "  ✓  csharp/src/StandardCucumberSteps.csproj"

# Go — no version file; version is determined by the git tag go/vX.Y.Z only.
echo "  -  go/go.mod (no version field; Go version comes from the git tag)"

echo
echo "Done. Review the changes with 'git diff', then commit and run:"
echo
echo "  scripts/check-version.sh $VERSION"
