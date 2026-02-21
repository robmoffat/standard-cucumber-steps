# Test Setup Steps

Steps that create test objects (callable functions, counters, delays) in props, for use by other steps in the same scenario. 

These are mainly for writing tests of STS itself, but you may find them handy.

---

## `"handler" is a invocation counter into "count"`

Creates a no-argument callable stored as `handler` in props. Each time it is called, it increments the integer stored as `count` (which starts at `0`).

Useful for verifying that a function was called the expected number of times.

```gherkin
Given "handler" is a invocation counter into "count"
When I call "{handler}"
And I call "{handler}"
Then "{count}" is "2"
```

You can use any prop names — `handler` and `count` are just conventions:

```gherkin
Given "callback" is a invocation counter into "callbackCount"
```

---

## `"fn" is an async function returning "{value}"`

Creates an async function (stored as `fn`) that, when called, resolves to the value of `{value}` at the time the step runs.

```gherkin
Given "myVar" is "hello"
And "fn" is an async function returning "{myVar}"
When I wait for "{fn}"
Then "{result}" is "hello"
```

Used together with [async steps](async.md) to test async completion.

---

## `"fn" is an async function returning "{value}" after "{ms}" ms`

Creates an async function with a built-in delay. When called, it waits for the specified milliseconds before resolving to the value. Useful for testing timeout scenarios.

```gherkin
Scenario: Function completes before timeout
  Given "fn" is an async function returning "success" after "50" ms
  When I wait for "{fn}" within "1000" ms
  Then "{result}" is "success"

Scenario: Function times out
  Given "slowFn" is an async function returning "too late" after "5000" ms
  When I wait for "{slowFn}" within "100" ms
  Then "{result}" is an error
```

---

## `we wait for a period of "{ms}" ms`

Pause the scenario for `ms` milliseconds. Useful for testing timeouts or ensuring async work has time to complete.

```gherkin
Given "handler" is a invocation counter into "count"
And we wait for a period of "10" ms
Then "{count}" is "0"
```

---

## Full example

```gherkin
Scenario: Create an invocation counter starts at zero
  Given "handler" is a invocation counter into "count"
  Then "{count}" is "0"

Scenario: Invoke a counter once
  Given "handler" is a invocation counter into "count"
  When I call "{handler}"
  Then "{count}" is "1"

Scenario: Invoke a counter multiple times
  Given "handler" is a invocation counter into "count"
  When I call "{handler}"
  And I call "{handler}"
  And I call "{handler}"
  Then "{count}" is "3"

Scenario: Wait for a period does not advance counter
  Given "handler" is a invocation counter into "count"
  And we wait for a period of "10" ms
  Then "{count}" is "0"
```
