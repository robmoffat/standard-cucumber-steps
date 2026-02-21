# Variable Steps

Steps for storing values in the scenario's shared property bag (`props`) and referencing them in other steps.

## How prop references work

Any step argument wrapped in `{...}` is resolved as a prop lookup. A bare string is treated as a literal value or a prop key (depending on the step).

| Syntax | Meaning |
|--------|---------|
| `"greeting"` | The literal string `greeting`, or the prop **key** `greeting` (in setter steps) |
| `"{greeting}"` | The **value** stored in prop `greeting` |
| `"{null}"` | The literal value `null` |
| `"{true}"` / `"{false}"` | Boolean literals |
| `"{42}"` | Numeric literal |

---

## `"field" is "value"` — set a prop

Store a value in props under the given key.

```gherkin
Given "greeting" is "hello world"
Given "count" is "{null}"
Given "flag" is "{true}"
Given "pi" is "{3.14}"
```

The right-hand side is resolved: `{null}`, `{true}`, `{false}`, and `{number}` produce their typed values; `{varName}` copies from another prop; a bare string is stored as-is.

---

## `"{field}" is "value"` — assert a prop equals a value

When the left-hand side is wrapped in `{...}`, the step asserts rather than sets.

```gherkin
Then "{greeting}" is "hello world"
Then "{count}" is "3"
```

Both sides are resolved before comparison; the check is string-equality of the resolved values.

---

## `I refer to "{from}" as "to"` — alias a prop

Copy the value of one prop into another key.

```gherkin
When I refer to "{count}" as "total"
Then "{total}" is "3"
```

Useful for giving a clearer name to a result before asserting.

---

## `"{field}" is null`

Assert the prop is `null` (or `nil` in Go).

```gherkin
Given "myNull" is "{null}"
Then "{myNull}" is null
```

---

## `"{field}" is not null`

Assert the prop has a non-null value.

```gherkin
Then "{result}" is not null
```

---

## `"{field}" is true` / `"{field}" is false`

Assert the prop is truthy or falsy. Works for booleans, numbers (`0` is falsy), and strings (empty string is falsy).

```gherkin
Given "myFlag" is "{true}"
Then "{myFlag}" is true

Given "count" is "{0}"
Then "{count}" is false
```

---

## `"{field}" is undefined`

Assert the prop was never set (or was explicitly set to `null`/`nil`).

```gherkin
Then "{result}" is undefined
```

---

## `"{field}" is empty`

Assert the prop is an empty array or empty string.

```gherkin
Then "{items}" is empty
```

---

## Full example

```gherkin
Scenario: Variable aliasing
  Given "handler" is a invocation counter into "count"
  When I call "{handler}"
  And I call "{handler}"
  And I refer to "{count}" as "total"
  Then "{total}" is "2"
  Then "{total}" is not null
  Then "{total}" is true
```
