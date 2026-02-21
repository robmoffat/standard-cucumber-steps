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

## `I call "{fn}" with parameter "{p1}"` — one argument

```gherkin
When I call "{myFunction}" with parameter "hello"
Then "{result}" is "HELLO"
```

---

## `I call "{fn}" with parameters "{p1}" and "{p2}"` — two arguments

```gherkin
When I call "{add}" with parameters "{x}" and "{y}"
Then "{result}" is "7"
```

---

## `I call "{fn}" with parameters "{p1}" and "{p2}" and "{p3}"` — three arguments

```gherkin
When I call "{format}" with parameters "{template}" and "{name}" and "{value}"
```

---

## `I call "{obj}" with "{method}"` — call an object method

Resolves `{obj}` to an object in props, then calls the named method on it.

```gherkin
When I call "{myService}" with "fetchData"
Then "{result}" is not an error
```

---

## `I call "{obj}" with "{method}" with parameter "{p1}"` — method with one argument

```gherkin
When I call "{calculator}" with "add" with parameter "5"
```

---

## `I call "{obj}" with "{method}" with parameters "{p1}" and "{p2}"` — method with two arguments

```gherkin
When I call "{calculator}" with "multiply" with parameters "3" and "4"
Then "{result}" is "12"
```

---

## `I call "{obj}" with "{method}" with parameters "{p1}" and "{p2}" and "{p3}"` — method with three arguments

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
  And "fn" is a function which returns a promise of "{myVar}"
  When the promise "{fn}" should resolve
  Then "{result}" is "hello"
```
