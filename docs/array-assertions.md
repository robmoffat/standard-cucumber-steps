# Array Assertion Steps

Steps for asserting the contents of arrays/lists stored in props. Data tables specify the expected structure using column headers as field names.

---

## `"{field}" is an array of objects with the following contents`

Assert exact match: the array must contain exactly these objects in this order. Column headers are field names; cell values are expected field values (resolved via `handleResolve`).

```gherkin
Then "{results}" is an array of objects with the following contents
  | name  | status   |
  | Alice | active   |
  | Bob   | inactive |
```

---

## `"{field}" is an array of objects with at least the following contents`

Assert that the array contains all of the listed objects (order-independent; extra items are allowed).

```gherkin
Then "{results}" is an array of objects with at least the following contents
  | name  |
  | Alice |
```

---

## `"{field}" is an array of objects which doesn't contain any of`

Assert that none of the listed objects appear in the array.

```gherkin
Then "{results}" is an array of objects which doesn't contain any of
  | name    |
  | Charlie |
```

---

## `"{field}" is an array of objects with length "{n}"`

Assert the array has exactly `n` elements.

```gherkin
Then "{results}" is an array of objects with length "3"
```

The length value is resolved, so `"{myLen}"` works too.

---

## `"{field}" is an array of strings with the following values`

Assert a string array matches a list of values. Uses a single `value` column.

```gherkin
Then "{tags}" is an array of strings with the following values
  | value  |
  | alpha  |
  | beta   |
  | gamma  |
```

---

## `"{field}" is an object with the following contents`

Assert a single object (not an array) has the specified fields.

```gherkin
Then "{user}" is an object with the following contents
  | name  | role  |
  | Alice | admin |
```

---

## Data table field matching

- Column headers are field names (support dot-notation for nested fields, e.g. `address.city`)
- Cell values are resolved: `{propName}` looks up a prop; bare strings are literal
- Matching is string-based after resolution: `"3"` matches a numeric `3`

---

## Numeric / length assertions using counters

These steps (from `array-assertions.feature`) use the invocation counter to verify numeric comparisons without needing a real array:

```gherkin
Scenario: Counter reflects number of calls
  Given "handler" is a invocation counter into "count"
  When I call "{handler}"
  And I call "{handler}"
  And I call "{handler}"
  Then "{count}" is "3"

Scenario: Greater-than assertion
  Given "handler" is a invocation counter into "count"
  When I call "{handler}"
  And I call "{handler}"
  Then "{count}" should be greater than "1"
```

See [Assertion Steps](assertions.md) for `should be greater than` / `should be less than`.
