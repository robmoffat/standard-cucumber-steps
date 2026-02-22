# JSONPath Navigation

SCS resolves any prop reference that contains a dot or bracket as a path into the stored object, not just a flat key lookup. This applies everywhere a `{...}` reference appears: step arguments, assertion values, and DataTable column headers.

---

## How it works

When a `{...}` reference is resolved, SCS first looks up the root key in props. If the reference continues with `.field`, `[index]`, or a combination, the remainder is applied as a path into the resolved object.

| Reference | Meaning |
|-----------|---------|
| `{user}` | The whole object stored under the key `user` |
| `{user.name}` | The `name` property of the `user` object |
| `{user.address.city}` | Nested property access — two levels deep |
| `{items[0]}` | The first element of the `items` array |
| `{items[1].name}` | The `name` property of the second array element |

---

## Dot notation — nested property access

```gherkin
# Given the prop "order" holds { id: "A1", customer: { name: "Alice" } }
Then "{order.customer.name}" is "Alice"
Then "{order.id}" is "A1"
```

Any depth is supported:

```gherkin
# Given "data" holds { a: { b: { c: { d: "found" } } } }
Then "{data.a.b.c.d}" is "found"
```

---

## Bracket notation — array element access

Use `[index]` (zero-based) to pick an element from an array:

```gherkin
# Given "items" holds [{ id: "1", name: "first" }, { id: "2", name: "second" }]
Then "{items[0].name}" is "first"
Then "{items[1].id}" is "2"
```

---

## Both sides of an assertion

Path expressions work on both sides of `"{x}" is "{y}"`:

```gherkin
Given I set "obj1" to "{nestedObject}"
Given I set "obj2" to "{nestedObject}"
Then "{obj1.level1.level2}" is "{obj2.level1.level2}"
```

---

## DataTable column headers

When using array assertion steps, column headers are resolved as paths against each array element. This lets you match against nested fields without flattening the data first:

```gherkin
# "users" holds [{ name: "Alice", address: { city: "New York" } }, ...]
Then "{users}" is an array of objects with the following contents
  | name  | address.city |
  | Alice | New York     |
  | Bob   | Los Angeles  |
```

The column header `address.city` navigates into the nested `address` object for every row. This works with all three array assertion steps:

- `is an array of objects with the following contents`
- `is an array of objects with at least the following contents`
- `is an array of objects which doesn't contain any of`

---

## Setting a prop from a nested value

To extract a nested value and store it under a new key, combine the setter step with a path reference:

```gherkin
Given I set "nested" to "{nestedObject}"
Given I set "city" to "{nested.level1.level2}"
Then "{city}" is "deep-value"
```

---

## Language support

JSONPath navigation is supported in all four language implementations. The underlying library differs per language, but the syntax and behaviour are identical across the shared feature files.

| Language | Library used |
|----------|-------------|
| TypeScript | [`jsonpath-plus`](https://github.com/JSONPath-Plus/JSONPath) |
| Go | [`github.com/PaesslerAG/jsonpath`](https://github.com/PaesslerAG/jsonpath) |
| Java | [Apache Commons JXPath](https://commons.apache.org/proper/commons-jxpath/) |
| C# | [`Newtonsoft.Json` SelectToken](https://www.newtonsoft.com/json/help/html/SelectToken.htm) |
