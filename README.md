# Cucumber Testing Steps

[![FINOS - Graduated](https://cdn.jsdelivr.net/gh/finos/contrib-toolbox@master/images/badge-graduated.svg)](https://community.finos.org/docs/governance/lifecycle-stages/graduated)
[![npm](https://img.shields.io/npm/v/%40finos%2Fcucumber-testing-steps?label=npm)](https://www.npmjs.com/package/@finos/cucumber-testing-steps)
[![Maven Central](https://img.shields.io/maven-central/v/org.finos/cucumber-testing-steps?label=maven)](https://central.sonatype.com/artifact/org.finos/cucumber-testing-steps)
[![NuGet](https://img.shields.io/nuget/v/Finos.CucumberTestingSteps?label=nuget)](https://www.nuget.org/packages/Finos.CucumberTestingSteps)
[![Go](https://img.shields.io/github/v/tag/finos/cucumber-testing-steps?filter=go%2F*&label=go)](https://pkg.go.dev/github.com/finos/cucumber-testing-steps/go)

TLDR: Reusable Cucumber step definitions for TypeScript, Java, Go, and C# — a single canonical DSL for BDD testing across languages.  An excellent fit for hands-off, agentic code development.

## What this is

The downside of BDD / Cucumber is having to maintain the step code - code that links step text (Given... When... Then...) to executable code in the tests themselves.

Cucumber Testing Steps (CTS) is a library of pre-built Cucumber step definitions, available for TypeScript, Java, Go, and C#. Instead of writing `Given`, `When`, and `Then` glue code yourself, you import CTS and immediately get a rich vocabulary for calling functions, inspecting results, and asserting on data — all driven by a shared scenario language.

## Why this is useful

Cucumber is a good fit for some testing problems and a poor fit for others. Before reaching for it, it is worth understanding the trade-offs:

| | | |
|---|---|---|
| Pro | **Readable by non-engineers** | Scenarios written in plain English can be reviewed and authored by product managers, QA analysts, and domain experts without reading code |
| Pro | **Living documentation** | Feature files stay in sync with the implementation by definition — if a scenario fails, the documentation is wrong |
| Pro | **Language-agnostic contracts** | The same `.feature` file can drive tests in TypeScript, Java, Go, and C# simultaneously, making it ideal for cross-language SDKs and generated code |
| Pro | **Encourages separation of concerns** | The glue layer (step definitions) is forced to stay thin; business logic cannot hide inside tests |
| Pro | **Reporting is excellent** | Step definitions pass and fail cleanly and you can see exactly how far a test has got without debugging it |
| Con | **Higher maintenance overhead** | Each scenario needs corresponding step definitions; large test suites can become hard to manage without discipline. This usually puts developers off using Cucumber as you feel you are writing everything twice. |

CTS addresses the maintenance cost directly: writing step definitions is repetitive boilerplate that every project reimplements. CTS does it once, correctly, across four languages.

This is especially valuable when:

- **Testing a cross-language API or SDK** — write the scenarios once, run them in each language's test suite to verify consistent behaviour.
- **Migrating between languages** — the same feature files document the expected contract before, during, and after a migration.
- **Adopting BDD on an existing codebase** — wire up your service with a few lines in a `@Before` hook and the step library covers the rest.
- **Writing tests for generated code** — code generators that target multiple languages can share a single golden test suite.
- **Working with agentic AI coding** - Feature files are an unusually clear form of instruction both for an AI coding agent and a human reviewer.   See [BDD and CTS for AI agentic coding](docs/agentic-coding.md) for a full discussion.

---

## Quick example

Let's say you have this interface (TypeScript):

```typescript
interface BankAccount {

  deposit(amt: number)

  getBalance(): number

}
```

We can write this feature file to test the implementation:

```gherkin
Scenario: Depositing money increases the balance
  Given "account" is set up as a bank account with balance "0"
  When I call "{account}" with "deposit" using argument "100"
  And I call "{account}" with "deposit" using argument "50"
  And I call "{account}" with "getBalance"
  Then "{result}" is "150"
```

The `Given` step is the only language-specific glue you need to write — it puts your object into the shared `props` store. Every other step comes from CTS.

See the [tutorial](docs/tutorial.md) for a full walkthrough.

## Quick Start

### TypeScript

#### Cucumber-js

Install CTS and the runner you use (each runner ships its own `Given` / `When` / `Then`; you must pass **that** module into `setupGenericSteps`).

```bash
npm install @finos/cucumber-testing-steps
npm install @cucumber/cucumber
```

Point `cucumber-js` at a support file that registers steps once at load time.

```typescript
// mysteps.steps.ts
import { Before, Given, Then, When, World, setWorldConstructor } from '@cucumber/cucumber';
import {
  setupGenericSteps,
  cucumberWrapStep,
  type PropsWorldLike,
} from '@finos/cucumber-testing-steps';

export class MyWorld extends World implements PropsWorldLike {
  props: Record<string, unknown> = {};
}

setWorldConstructor(MyWorld);

// this registers the generic steps with cucumber
setupGenericSteps({ Given, When, Then, wrapStep: cucumberWrapStep });

// your app-specific steps go here
Before(function (this: MyWorld) ...
```

#### QuickPickle (Vitest)

- npm install `quickpickle` and `vitest`. 
- Add the [quickpickle plugin](https://github.com/dnotes/quickpickle) to `vitest.config.ts`
- include your `.feature` files in `test.include`, and load your step file via `test.setupFiles`

Write a steps file in the following way to add the generic steps:

```typescript
// my quickpickle steps
import { Before, Given, Then, When, QuickPickleWorld, setWorldConstructor } from 'quickpickle';
import {
  setupGenericSteps,
  quickpickleWrapStep,
  type PropsWorldLike,
} from '@finos/cucumber-testing-steps';

export class MyWorld extends QuickPickleWorld implements PropsWorldLike {
  props: Record<string, unknown> = {};

  log(message: string): void {
    console.log(message);
  }
}

setWorldConstructor(MyWorld);

setupGenericSteps({ Given, When, Then, wrapStep: quickpickleWrapStep });

Before(async (world: MyWorld) => {
  // Optional: same hooks as above
});

### Java (Maven)

```xml
<dependency>
  <groupId>org.finos</groupId>
  <artifactId>cucumber-testing-steps</artifactId>
  <version>0.1.0</version>
</dependency>
```

### Go

```bash
go get github.com/finos/cucumber-testing-steps/go
```

```go
import generic "github.com/finos/cucumber-testing-steps/go"

world := generic.NewPropsWorld()
world.RegisterSteps(ctx)
```

### C# (NuGet)

```bash
dotnet add package Finos.CucumberTestingSteps
```

---

## See it in action

The same feature files run across all supported languages, producing consistent test results:

### TypeScript

![TypeScript test output](docs/images/typescript-example.png)

### Java

![Java test output](docs/images/java-example.png)

### Go

![Go test output](docs/images/go-example.png)

### Bank account examples

The `examples/` directory contains two small runnable TypeScript projects that illustrate the difference between the anti-pattern and the correct approach:

| Example | Description |
|---------|-------------|
| [`examples/wrong`](examples/wrong) | Agent-generated bespoke step definitions — hardcoded to specific values, breaks on the second scenario |
| [`examples/right`](examples/right) | CTS-based — a single setup hook, both scenarios pass with zero additional glue code |

---

## Step Reference

Full documentation with examples for each step group:

- [Variables](docs/variables.md) — storing and referencing props, boolean/null/numeric literals
- [JSONPath](docs/jsonpath.md) — navigating nested objects and arrays inside `{...}` references
- [Assertions](docs/assertions.md) — equality, contains, numeric comparisons, error assertions
- [Method Calls](docs/method-calls.md) — calling functions and object methods
- [Async Steps](docs/async.md) — async functions and background jobs
- [Array Assertions](docs/array-assertions.md) — matching arrays and objects against data tables (including numeric loose equality)
- [Test Setup](docs/test-setup.md) — invocation counters, async functions, delays

### [Variables](docs/variables.md)

| Step | Description |
|------|-------------|
| `Given "key" is "value"` | Store a string (or resolved literal) in props |
| `Then "{key}" is "value"` | Assert prop equals value |
| `When I refer to "{from}" as "to"` | Alias (copy) one prop to another |
| `{varName}` | Prop lookup in any step argument |
| `{null}` `{true}` `{false}` `{42}` | Literal values |

### [JSONPath](docs/jsonpath.md)

Any `{...}` reference containing a dot or bracket is resolved as a path into the stored object. This applies in step arguments and DataTable column headers.

| Syntax | Meaning |
|--------|---------|
| `{obj.field}` | Property of a stored object |
| `{obj.a.b.c}` | Nested property access |
| `{arr[0]}` | First element of a stored array |
| `{arr[1].name}` | Property of an array element |
| `address.city` *(DataTable header)* | Match a nested field in each array row |

### [Assertions](docs/assertions.md)

| Step | Description |
|------|-------------|
| `Then "{x}" is "value"` | String equality |
| `Then "{x}" is null` | Assert null/nil |
| `Then "{x}" is not null` | Assert not null |
| `Then "{x}" is true` | Assert truthy |
| `Then "{x}" is false` | Assert falsy |
| `Then "{x}" is undefined` | Assert undefined/nil |
| `Then "{x}" is empty` | Assert empty array or string |
| `Then "{x}" is an error` | Assert is an error/exception |
| `Then "{x}" is an error with message "msg"` | Assert error message |
| `Then "{x}" is not an error` | Assert not an error |
| `Then "{x}" contains "substring"` | Assert string contains |
| `Then "{x}" is a string containing one of` | Assert contains one of *(+DataTable)* |
| `Then "{x}" should be greater than "y"` | Numeric greater-than |
| `Then "{x}" should be less than "y"` | Numeric less-than |

### [Method Calls](docs/method-calls.md)

| Step | Description |
|------|-------------|
| `When I call "{fn}"` | Call a no-arg function |
| `When I call "{fn}" using argument "{p1}"` | Call with one argument |
| `When I call "{fn}" using arguments "{p1}" and "{p2}"` | Call with two arguments |
| `When I call "{fn}" using arguments "{p1}", "{p2}", and "{p3}"` | Call with three arguments |
| `When I call "{fn}" using arguments "{p1}", "{p2}", "{p3}", and "{p4}"` | Call with four arguments |
| `When I call "{obj}" with "{method}"` | Call a method on an object |
| `When I call "{obj}" with "{method}" using argument "{p1}"` | Call method with one argument |
| `When I call "{obj}" with "{method}" using arguments "{p1}" and "{p2}"` | Call method with two arguments |
| `When I call "{obj}" with "{method}" using arguments "{p1}", "{p2}", and "{p3}"` | Call method with three arguments |
| `When I call "{obj}" with "{method}" using arguments "{p1}", "{p2}", "{p3}", and "{p4}"` | Call method with four arguments |
| `When I call "{obj}" with "{method}" as "jobName"` | Start method call as background job |
| `When I call "{obj}" with "{method}" using argument "{p1}" as "jobName"` | Start method job with one arg |
| `When I call "{obj}" with "{method}" using arguments "{p1}" and "{p2}" as "jobName"` | Start method job with two args |
| `When I call "{obj}" with "{method}" using arguments "{p1}", "{p2}", and "{p3}" as "jobName"` | Start method job with three args |
| `When I call "{obj}" with "{method}" using arguments "{p1}", "{p2}", "{p3}", and "{p4}" as "jobName"` | Start method job with four args |

### [Async Steps](docs/async.md)

| Step | Description |
|------|-------------|
| `When I wait for "{fn}"` | Call and await in one step |
| `When I wait for "{fn}" within "{ms}" ms` | Call and await with timeout |
| `When I wait for "{fn}" using argument "{p1}"` | Call with arg and await |
| `When I wait for "{fn}" using arguments "{p1}" and "{p2}"` | Call with two args and await |
| `When I wait for "{fn}" using arguments "{p1}", "{p2}", and "{p3}"` | Call with three args and await |
| `When I wait for "{fn}" using arguments "{p1}", "{p2}", "{p3}", and "{p4}"` | Call with four args and await |
| `When I start "{fn}" as "jobName"` | Start async job in background |
| `When I start "{fn}" using argument "{p1}" as "jobName"` | Start job with one arg |
| `When I start "{fn}" using arguments "{p1}" and "{p2}" as "jobName"` | Start job with two args |
| `When I start "{fn}" using arguments "{p1}", "{p2}", and "{p3}" as "jobName"` | Start job with three args |
| `When I start "{fn}" using arguments "{p1}", "{p2}", "{p3}", and "{p4}" as "jobName"` | Start job with four args |
| `When I wait for job "jobName"` | Wait for named job (30s timeout) |
| `When I wait for job "jobName" within "{ms}" ms` | Wait with custom timeout |

### [Array Assertions](docs/array-assertions.md)

| Step | Description |
|------|-------------|
| `Then "{x}" is an array of objects with the following contents` | Exact ordered match *(+DataTable)* |
| `Then "{x}" is an array of objects with at least the following contents` | Subset match *(+DataTable)* |
| `Then "{x}" is an array of objects which doesn't contain any of` | Negative match *(+DataTable)* |
| `Then "{x}" is an array of objects with length "{n}"` | Length assertion |
| `Then "{x}" is an array of strings with the following values` | String array match *(+DataTable)* |
| `Then "{x}" is an object with the following contents` | Single object field match *(+DataTable)* |

### [Test Setup](docs/test-setup.md)

| Step | Description |
|------|-------------|
| `Given "handler" is a invocation counter into "count"` | Create a counting callable |
| `Given "fn" is an async function returning "{value}"` | Create an async function |
| `Given "fn" is an async function returning "{value}" after "{ms}" ms` | Create an async function with delay |
| `Given we wait for a period of "{ms}" ms` | Sleep/delay |

---

## Shared Feature Files

The `features/` directory contains `.feature` files that exercise every canonical step. Each language implementation points its test runner at this shared directory, so the same scenarios validate all four implementations.

---

## Used by

CTS was extracted from three [FINOS](https://www.finos.org/) open-source projects.  Factoring it out into a shared library means each project gets consistent behaviour.

| Project | Language | Description |
|---------|----------|-------------|
| [FDC3](https://github.com/finos/FDC3) | TypeScript | The FDC3 desktop interoperability standard; CTS drives its conformance test suite |
| [FDC3-java-api](https://github.com/finos/fdc3-java-api) | Java | Java implementation of the FDC3 API; uses CTS to verify the Java bindings against the same feature files |
| [ccc-cfi-compliance](https://github.com/finos-labs/ccc-cfi-compliance) | Go | FINOS Common Cloud Controls compliance testing; uses CTS as the generic step layer for cross-language contract verification |

Each of these projects wires up its own domain objects in a single `@Before` hook and then delegates all step execution to CTS.

## Contributing

For questions, bugs, or feature requests please open an [issue](https://github.com/finos/cucumber-testing-steps/issues).

To contribute:

1. Read [CONTRIBUTING.md](CONTRIBUTING.md) and the [FINOS Code of Conduct](CODE_OF_CONDUCT.md)
2. Fork the repository and open a pull request
3. See [MAINTAINERS.md](MAINTAINERS.md) for the current maintainer roster

Security issues should be reported privately — see [SECURITY.md](SECURITY.md).

## License

Copyright 2026 Rob Moffat

Distributed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).

SPDX-License-Identifier: [Apache-2.0](https://spdx.org/licenses/Apache-2.0)
