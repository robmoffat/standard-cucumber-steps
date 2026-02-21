# Assertion Steps

Steps for checking values, strings, errors, and numeric comparisons.

---

## `"{field}" is "expected"` — equality

Assert that a prop's string representation equals the expected value.

```gherkin
Then "{count}" is "3"
Then "{status}" is "COMPLETE"
Then "{pi}" is "3.14"
```

Both sides are resolved via `handleResolve`, so you can compare props to literals or props to other props.

---

## `"{field}" contains "substring"` — substring check

Assert that the string value of a prop contains a given substring.

```gherkin
Given "greeting" is "hello world"
Then "{greeting}" contains "world"
```

---

## `"{field}" is a string containing one of` — one-of check

Assert that the string value contains at least one of the values listed in a data table.

```gherkin
Given "status" is "COMPLETED_WITH_ERRORS"
Then "{status}" is a string containing one of
  | value     |
  | COMPLETED |
  | PENDING   |
  | FAILED    |
```

Passes if any row value appears as a substring of the field.

---

## `"{field}" should be greater than "threshold"` — numeric comparison

```gherkin
Given "handler" is a invocation counter into "count"
When I call "{handler}"
And I call "{handler}"
Then "{count}" should be greater than "1"
```

Both sides are converted to numbers before comparing.

---

## `"{field}" should be less than "threshold"` — numeric comparison

```gherkin
When I call "{handler}"
Then "{count}" should be less than "5"
```

---

## `"{field}" is an error` — error assertion

Assert that the prop holds an error/exception object (typically the result of a failed call).

```gherkin
Given "fn" is "{null}"
When I call "{fn}"
Then "{result}" is an error
```

---

## `"{field}" is an error with message "msg"` — error message check

Assert the error has a specific message.

```gherkin
Then "{result}" is an error with message "cannot call null"
```

---

## `"{field}" is not an error` — negative error assertion

Assert that the prop does not hold an error.

```gherkin
When I call "{handler}"
Then "{result}" is not an error
```

---

## `"{field}" is null` / `"{field}" is not null`

See [Variable Steps](variables.md).

---

## `"{field}" is true` / `"{field}" is false` / `"{field}" is undefined` / `"{field}" is empty`

See [Variable Steps](variables.md).

---

## Full example

```gherkin
Scenario: Comprehensive assertion demo
  Given "handler" is a invocation counter into "count"
  When I call "{handler}"
  And I call "{handler}"
  Then "{count}" is "2"
  Then "{count}" should be greater than "1"
  Then "{count}" should be less than "5"
  Then "{count}" is not null
  Then "{count}" is not an error
  Then "{count}" is true

Scenario: String assertions
  Given "message" is "order status: COMPLETED_WITH_ERRORS"
  Then "{message}" contains "COMPLETED"
  Then "{message}" is a string containing one of
    | value     |
    | COMPLETED |
    | CANCELLED |
```
