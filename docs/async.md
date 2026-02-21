# Async Steps

Steps for working with asynchronous operations and background jobs.

These steps allow you to start async work, wait for completion, and assert results — all within a single Cucumber scenario.

## Language Mapping

This library uses **language-agnostic terminology** in Gherkin that maps to each language's native async mechanism:

| Gherkin Concept | TypeScript | C# | Java | Go |
|-----------------|------------|-----|------|-----|
| "async function" | `Promise` / `async function` | `Task<T>` / `Func<Task<T>>` | `CompletableFuture<T>` / `Supplier` | `func()` with goroutine |
| "job" | `Promise` stored in `Map` | `Task` stored in dictionary | `CompletableFuture` in `HashMap` | `AsyncTask` with channels |
| "wait for" | `await` | `await` | `.get()` | channel receive / `WaitForTask` |
| timeout | `Promise.race` with `setTimeout` | `.WaitAsync(TimeSpan)` | `.get(timeout, TimeUnit)` | `time.After` with `select` |

---

## `"{fn}" is an async function returning "{value}"`

Creates a function that returns an async result. Use this for setup.

```gherkin
Given "myVar" is "async-result"
And "fn" is an async function returning "{myVar}"
When I wait for "{fn}"
Then "{result}" is "async-result"
```

---

## `I wait for "{fn}"` — call and await immediately

Call `{fn}` and wait for the result. The result is stored in `result`.

```gherkin
Given "handler" is a invocation counter into "count"
When I wait for "{handler}"
Then "{count}" is "1"
```

---

## `I wait for "{fn}" within "X" ms` — with timeout

Same as above but with a configurable timeout in milliseconds.

```gherkin
Given "myVar" is "timed-result"
And "fn" is an async function returning "{myVar}"
When I wait for "{fn}" within "10000" ms
Then "{result}" is "timed-result"
```

---

## `I wait for "{fn}" using argument "{p1}"`

```gherkin
When I wait for "{processor}" using argument "{inputData}"
Then "{result}" is not an error
```

---

## `I wait for "{fn}" using arguments "{p1}" and "{p2}"`

---

## `I wait for "{fn}" using arguments "{p1}", "{p2}", and "{p3}"`

---

## `I wait for "{fn}" using arguments "{p1}", "{p2}", "{p3}", and "{p4}"`

---

## `I start "{fn}" as "jobName"` — start a background job

Starts `{fn}` asynchronously in the background and registers it under `jobName`. The scenario continues without blocking.

```gherkin
When I start "{handler}" as "myJob"
And I wait for job "myJob"
Then "{count}" is "1"
```

---

## `I start "{fn}" using argument "{p1}" as "jobName"`

---

## `I start "{fn}" using arguments "{p1}" and "{p2}" as "jobName"`

---

## `I start "{fn}" using arguments "{p1}", "{p2}", and "{p3}" as "jobName"`

---

## `I start "{fn}" using arguments "{p1}", "{p2}", "{p3}", and "{p4}" as "jobName"`

---

## `I wait for job "jobName"` — wait for a named job (30s timeout)

Waits for the previously started job to finish. Stores the result in both `result` and `jobName`.

```gherkin
When I start "{handler}" as "myJob"
And I wait for job "myJob"
Then "{count}" is "1"
```

---

## `I wait for job "jobName" within "X" ms` — custom timeout

```gherkin
When I start "{handler}" as "timedJob"
And I wait for job "timedJob" within "5000" ms
Then "{count}" is "1"
```

---

## Full example

```gherkin
Scenario: Await an async function
  Given "myVar" is "async-result"
  And "fn" is an async function returning "{myVar}"
  When I wait for "{fn}"
  Then "{result}" is "async-result"

Scenario: Await with timeout
  Given "myVar" is "timed-result"
  And "fn" is an async function returning "{myVar}"
  When I wait for "{fn}" within "10000" ms
  Then "{result}" is "timed-result"

Scenario: Run in background and wait later
  Given "handler" is a invocation counter into "count"
  When I start "{handler}" as "myJob"
  And I wait for job "myJob"
  Then "{count}" is "1"

Scenario: Background job with timeout
  Given "handler" is a invocation counter into "count"
  When I start "{handler}" as "timedJob"
  And I wait for job "timedJob" within "5000" ms
  Then "{count}" is "1"
```
