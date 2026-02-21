# Method Call Steps

Steps for invoking functions and object methods stored in props. Results are stored in the `result` prop.

The called function is always awaited — if it returns a promise/future, the resolved value is stored in `result`. If it throws/panics, the error is stored in `result` (which you can then assert with `"{result}" is an error`).

---

## `I call "{fn}"` — call a function with no arguments

Resolves `{fn}` to a callable stored in props, calls it, and stores the result.

```gherkin
Given "handler" is a invocation counter into "count"
When I call "{handler}"
Then "{count}" is "1"
```

---

## `I call "{fn}" using argument "{p1}"` — one argument

```gherkin
When I call "{myFunction}" using argument "hello"
Then "{result}" is "HELLO"
```

---

## `I call "{fn}" using arguments "{p1}" and "{p2}"` — two arguments

```gherkin
When I call "{add}" using arguments "{x}" and "{y}"
Then "{result}" is "7"
```

---

## `I call "{fn}" using arguments "{p1}", "{p2}", and "{p3}"` — three arguments

```gherkin
When I call "{format}" using arguments "{template}", "{name}", and "{value}"
```

---

## `I call "{fn}" using arguments "{p1}", "{p2}", "{p3}", and "{p4}"` — four arguments

---

## `I call "{obj}" with "{method}"` — call an object method

Resolves `{obj}` to an object in props, then calls the named method on it.

```gherkin
When I call "{myService}" with "fetchData"
Then "{result}" is not an error
```

---

## `I call "{obj}" with "{method}" using argument "{p1}"` — method with one argument

```gherkin
When I call "{calculator}" with "add" using argument "5"
```

---

## `I call "{obj}" with "{method}" using arguments "{p1}" and "{p2}"` — method with two arguments

```gherkin
When I call "{calculator}" with "multiply" using arguments "3" and "4"
Then "{result}" is "12"
```

---

## `I call "{obj}" with "{method}" using arguments "{p1}", "{p2}", and "{p3}"` — method with three arguments

---

## `I call "{obj}" with "{method}" using arguments "{p1}", "{p2}", "{p3}", and "{p4}"` — method with four arguments

---

## `I refer to "{count}" as "alias"` — aliasing a result

After calling, rename the result for clarity.

```gherkin
When I call "{handler}"
And I call "{handler}"
And I call "{handler}"
And I refer to "{count}" as "totalCalls"
Then "{totalCalls}" is "3"
```

---

## Full example

```gherkin
Scenario: Call a function multiple times
  Given "handler" is a invocation counter into "count"
  When I call "{handler}"
  And I call "{handler}"
  Then "{count}" is "2"

Scenario: Call a function that returns a value
  Given "myVar" is "hello"
  And "fn" is an async function returning "{myVar}"
  When I wait for "{fn}"
  Then "{result}" is "hello"
```
