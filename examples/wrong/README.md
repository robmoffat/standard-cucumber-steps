# Example: Wrong — hardcoded step definitions

This project demonstrates the anti-pattern that emerges when an AI agent (or a developer) writes bespoke Cucumber step definitions for each scenario line.

The feature file contains two scenarios with different deposit and withdrawal amounts. The agent wrote step definitions that match only the first scenario's exact values (`£40`, `£20`), adding corresponding helper methods (`add40Pounds`, `remove20Pounds`) directly to the domain class.

## Run

```bash
npm install
npm test
# HTML report: reports/cucumber-report.html
```
