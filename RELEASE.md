# Release Process

This document describes how to release Standard Cucumber Steps to npm, Maven Central, NuGet, and Go modules.

## Prerequisites

### One-time Setup

#### npm (TypeScript)

1. Create an npm account at https://www.npmjs.com/
2. Generate a **Granular Access Token** at https://www.npmjs.com/settings/~/tokens
   - Click "Generate New Token" → "Granular Access Token"
   - Set expiration (up to 365 days, or no expiration)
   - Under "Packages and scopes", select "Read and write"
   - For first publish: select "All packages" (you can't scope to a package that doesn't exist yet)
   - After first publish: you can create a new token scoped to just `@robmoffat/standard-cucumber-steps`
3. Add the token as `NPM_TOKEN` in GitHub Secrets
4. Set a calendar reminder to rotate the token before expiration

#### Maven Central (Java)

Maven Central requires more setup than other registries:

1. **Create a Sonatype account**
   - Register at https://central.sonatype.org/
   - Create a new project ticket to claim the `io.github.robmoffat` namespace
   - Verify ownership by creating a temporary GitHub repo named after your ticket (e.g., `OSSRH-12345`)

2. **Generate a GPG key**
   ```bash
   gpg --gen-key
   ```
   Follow the prompts (use RSA, 4096 bits recommended).

3. **Publish your GPG key to a keyserver**
   ```bash
   # List your keys to find the key ID
   gpg --list-keys --keyid-format SHORT
   
   # Publish to keyserver (required for Maven Central verification)
   gpg --keyserver keyserver.ubuntu.com --send-keys YOUR_KEY_ID
   ```

4. **Export the private key for GitHub Actions**
   ```bash
   gpg --armor --export-secret-keys YOUR_KEY_ID
   ```
   Copy the entire output (including `-----BEGIN PGP PRIVATE KEY BLOCK-----`).

5. **Add secrets to GitHub**:
   - `OSSRH_USERNAME` — Your Sonatype JIRA username
   - `OSSRH_TOKEN` — Your Sonatype JIRA password (or a generated token)
   - `GPG_PRIVATE_KEY` — The exported private key from step 4
   - `GPG_PASSPHRASE` — The passphrase you set when generating the key

#### NuGet (C#)

1. Create a NuGet account at https://www.nuget.org/
2. Generate an API key at https://www.nuget.org/account/apikeys
   - Scope it to push new packages and package versions
   - Set appropriate expiration
3. Add the key as `NUGET_API_KEY` in GitHub Secrets

#### Go

No registry setup required. Go modules are served directly from GitHub via `proxy.golang.org`. Just ensure your repository is public.

---

## GitHub Secrets Summary

Configure these in **Settings → Secrets and variables → Actions**:

| Secret | Registry | Description |
|--------|----------|-------------|
| `NPM_TOKEN` | npm | Automation token from npmjs.com |
| `OSSRH_USERNAME` | Maven Central | Sonatype JIRA username |
| `OSSRH_TOKEN` | Maven Central | Sonatype JIRA password/token |
| `GPG_PRIVATE_KEY` | Maven Central | Armored GPG private key |
| `GPG_PASSPHRASE` | Maven Central | GPG key passphrase |
| `NUGET_API_KEY` | NuGet | API key from nuget.org |

---

## Releasing

### 1. Set the version

Update the version number in all language manifests at once:

```bash
scripts/set-version.sh 0.2.0
```

This updates `typescript/package.json`, `java/pom.xml`, and `csharp/src/StandardCucumberSteps.csproj`. Go has no version file — its version is determined by the git tag alone.

Review the diff, then commit:

```bash
git diff
git add typescript/package.json java/pom.xml csharp/src/StandardCucumberSteps.csproj
git commit -m "chore: bump version to 0.2.0"
git push origin main
```

### 2. Verify all versions match

Before tagging, confirm there are no mismatches:

```bash
scripts/check-version.sh 0.2.0
```

This prints a pass/fail for each manifest and exits non-zero if anything is wrong.

### 3. Push the release tags

Once the check passes, create and push the tags. TypeScript, Java, and C# share a tag; Go uses a separate namespace (required because its module is in a subdirectory):

```bash
# TypeScript, Java, C#
git tag v0.2.0
git push origin v0.2.0

# Go
git tag go/v0.2.0
git push origin go/v0.2.0
```

This triggers three workflows in parallel for the shared tag:
- `release-typescript.yml` → publishes `@robmoffat/standard-cucumber-steps` to npm
- `release-java.yml` → publishes `io.github.robmoffat:standard-cucumber-steps` to Maven Central
- `release-csharp.yml` → publishes `StandardCucumberSteps` to NuGet

And one workflow for the Go tag:
- `release-go.yml` → runs tests, creates a GitHub Release, and the Go module proxy picks up the new version

### Verifying Releases

After pushing tags, check the Actions tab for workflow status. Once complete:

- **npm**: https://www.npmjs.com/package/@robmoffat/standard-cucumber-steps
- **Maven Central**: https://central.sonatype.com/artifact/io.github.robmoffat/standard-cucumber-steps (may take 10-30 minutes to sync)
- **NuGet**: https://www.nuget.org/packages/StandardCucumberSteps
- **Go**: https://pkg.go.dev/github.com/robmoffat/standard-cucumber-steps/go

---

## Version Numbering

We use [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes to step definitions or API
- **MINOR** (1.0.0 → 1.1.0): New step definitions or features, backwards compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, documentation updates

All four language implementations should stay in sync on major/minor versions.

---

## Troubleshooting

### npm: "You must be logged in to publish packages"
- Verify `NPM_TOKEN` is set correctly in GitHub Secrets
- Ensure the token hasn't expired
- Check the token has publish permissions

### Maven Central: "Could not find artifact"
- New namespaces can take 10-30 minutes to sync to Maven Central
- Check https://s01.oss.sonatype.org/ for staging repository status

### Maven Central: GPG signing failed
- Ensure `GPG_PRIVATE_KEY` includes the full armored key (with headers)
- Verify `GPG_PASSPHRASE` matches the key
- Confirm the public key was published to a keyserver

### NuGet: "API key is invalid"
- Check the key hasn't expired
- Verify the key has push permissions for this package ID

### Go: Module not appearing on pkg.go.dev
- Ensure the tag follows the `go/vX.Y.Z` format
- Request indexing manually: `GOPROXY=proxy.golang.org go get github.com/robmoffat/standard-cucumber-steps/go@vX.Y.Z`

---

## Local Testing

Before releasing, you can test the release process locally:

```bash
# TypeScript
cd typescript
npm run build
npm pack  # Creates a .tgz you can inspect

# Java
cd java
mvn clean verify -P release  # Requires GPG configured locally

# C#
cd csharp
dotnet pack -c Release

# Go
cd go
go test -v ./...
```
