# Security Policy

This project supports responsible disclosure of security vulnerabilities and adheres to the [FINOS Security Vulnerabilities Responsible Disclosure Policy](https://community.finos.org/docs/governance/software-projects/cve-responsible-disclosure). If you believe you have found a security vulnerability in this project, we encourage and appreciate your report. Please report it privately using one of the methods below — **do not** open a public GitHub Issue or otherwise disclose it publicly.

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.2.x   | :white_check_mark: |
| < 1.2   | :x: |

## Reporting a Vulnerability

- **GitHub private vulnerability reporting (preferred):** Use the ["Report a vulnerability"](../../security/advisories/new) button under this repository's **Security** tab. This opens a private advisory and communication channel with the maintainers.
- **Email:** If you're unable to use GitHub's private reporting, email [security@finos.org](mailto:security@finos.org) with a description of the issue. If maintainers are listed in [MAINTAINERS.md](MAINTAINERS.md), you may also email them and cc [security@finos.org](mailto:security@finos.org).

## Vulnerability Process

1. **Report the vulnerability privately** using one of the methods above.
2. The project team will acknowledge receipt, triage the report, and — if confirmed — work with you to investigate and develop a fix.
3. Once a fix is available, it will be released and the vulnerability will be publicly disclosed in accordance with the [FINOS Security Vulnerabilities Responsible Disclosure Policy](https://community.finos.org/docs/governance/software-projects/cve-responsible-disclosure).

## Automated scanning

This repository runs GitHub Actions for static analysis (CodeQL), Node dependency / license guidance (Sonatype AuditJS), and OpenSSF Scorecard. See [`.github/workflows`](.github/workflows). Results appear in the repository **Security** tab where enabled.

Thank you for helping keep FINOS projects and their users secure.
