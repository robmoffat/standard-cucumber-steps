# Async Steps

Steps for working with promises, futures, and background tasks.

These steps allow you to start async work, wait for completion, and assert results — all within a single Cucumber scenario.

---

## `the promise "{fn}" should resolve`

Call `{fn}` (which must be a function returning a promise/future), await it, and store the result in `result`.

```gherkin
Given "myVar" is "async-result"
And "fn" is a function which returns a promise of "{myVar}"
When the promise "{fn}" should resolve
Then "{result}" is "async-result"
```

If the promise rejects/throws, the error is stored in `result` instead.

---

## `the promise "{fn}" should resolve within 10 seconds`

Same as above but with a 10-second timeout.

```gherkin
Given "myVar" is "timed-result"
And "fn" is a function which returns a promise of "{myVar}"
When the promise "{fn}" should resolve within 10 seconds
Then "{result}" is "timed-result"
```

---

## `I wait for "{fn}"` — call and await immediately

Shorthand: call `{fn}` and wait for it in a single step. Equivalent to starting a task and immediately waiting for it.

```gherkin
Given "handler" is a invocation counter into "count"
When I wait for "{handler}"
Then "{count}" is "1"
```

---

## `I wait for "{fn}" with parameter "{p1}"`

```gherkin
When I wait for "{processor}" with parameter "{inputData}"
Then "{result}" is not an error
```

---

## `I wait for "{fn}" with parameters "{p1}" and "{p2}"`

---

## `I start task "name" by calling "{fn}"` — start a background task

Starts `{fn}` asynchronously in the background and registers it under `name`. The scenario continues without blocking.

```gherkin
When I start task "myTask" by calling "{handler}"
And I wait for task "myTask" to complete
Then "{count}" is "1"
```

---

## `I start task "name" by calling "{fn}" with parameter "{p1}"`

---

## `I start task "name" by calling "{fn}" with parameters "{p1}" and "{p2}"`

---

## `I wait for task "name" to complete` — wait for a named task (30s timeout)

Waits for the previously started task to finish. Stores the result in both `result` and `name`.

```gherkin
When I start task "myTask" by calling "{handler}"
And I wait for task "myTask" to complete
Then "{count}" is "1"
```

---

## `I wait for task "name" to complete within "{ms}" ms` — custom timeout

```gherkin
When I start task "timedTask" by calling "{handler}"
And I wait for task "timedTask" to complete within "5000" ms
Then "{count}" is "1"
```

---

## Full example

```gherkin
Scenario: Start a task and wait for it to complete
  Given "handler" is a invocation counter into "count"
  When I start task "myTask" by calling "{handler}"
  And I wait for task "myTask" to complete
  Then "{count}" is "1"

Scenario: Start a task and wait with custom timeout
  Given "handler" is a invocation counter into "count"
  When I start task "timedTask" by calling "{handler}"
  And I wait for task "timedTask" to complete within "5000" ms
  Then "{count}" is "1"

Scenario: Resolve a promise
  Given "myVar" is "async-result"
  And "fn" is a function which returns a promise of "{myVar}"
  When the promise "{fn}" should resolve
  Then "{result}" is "async-result"
```
