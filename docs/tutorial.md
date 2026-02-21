# Tutorial: Testing an API with Standard Cucumber Steps

This tutorial walks through using SCS to write Cucumber tests for a small service. You will see how a single set of `.feature` files can drive tests in TypeScript, Java, Go, and C# against the same API contract.

---

## The API we're testing

We have a simple `BankAccount` class with three methods:

```
BankAccount
  deposit(amount: number) → void
  withdraw(amount: number) → void    (throws if insufficient funds)
  getBalance() → number
  getTransactions() → Transaction[]  (each has: type, amount, balance)
```

A typical usage looks like this (TypeScript):

```typescript
const account = new BankAccount();
account.deposit(100);
account.withdraw(30);
console.log(account.getBalance()); // 70
```

We want to verify:
1. Deposits increase the balance correctly
2. Withdrawals decrease the balance correctly
3. Insufficient funds produce an error
4. The transaction history reflects all operations

---

## Writing the feature file

Feature files live in the shared `features/` directory and are written once. They use only SCS steps, except for the `Given` setup step that creates the account object — which is the only language-specific hook you need to write.

```gherkin
Feature: Bank account

  Scenario: Depositing money increases the balance
    Given "account" is set up as a new bank account
    When I call "{account}" with "deposit" with parameter "100"
    And I call "{account}" with "deposit" with parameter "50"
    And I call "{account}" with "getBalance"
    Then "{result}" is "150"

  Scenario: Withdrawing money decreases the balance
    Given "account" is set up as a new bank account
    When I call "{account}" with "deposit" with parameter "200"
    And I call "{account}" with "withdraw" with parameter "75"
    And I call "{account}" with "getBalance"
    Then "{result}" is "125"

  Scenario: Withdrawing more than the balance throws an error
    Given "account" is set up as a new bank account
    When I call "{account}" with "deposit" with parameter "50"
    And I call "{account}" with "withdraw" with parameter "100"
    Then "{result}" is an error

  Scenario: Transaction history records all operations
    Given "account" is set up as a new bank account
    When I call "{account}" with "deposit" with parameter "100"
    And I call "{account}" with "withdraw" with parameter "40"
    And I call "{account}" with "getTransactions"
    Then "{result}" is an array of objects with the following contents
      | type     | amount | balance |
      | deposit  | 100    | 100     |
      | withdraw | 40     | 60      |
```

A few things to notice:

- `{account}` in curly braces is a **prop reference** — it looks up the value stored under the key `account` in the scenario's shared context.
- The `deposit` and `withdraw` method names are plain strings (no braces) — they are passed literally.
- Method results automatically land in `{result}` and can be asserted with any assertion step.
- Data tables match object fields by column name.

---

## What you write once per language

Only one step needs a language-specific implementation: the `Given "account" is set up as a new bank account` setup step. Everything else comes from SCS.

### TypeScript

```typescript
import { Given, Before } from '@cucumber/cucumber';
import { PropsWorld, setupGenericSteps } from '@robmoffat/standard-cucumber-steps';
import { BankAccount } from '../src/BankAccount';

setWorldConstructor(PropsWorld);
setupGenericSteps();

Given('"account" is set up as a new bank account', function (this: PropsWorld) {
  this.props['account'] = new BankAccount();
});
```

### Java

```java
@Given("\"account\" is set up as a new bank account")
public void accountIsSetUpAsANewBankAccount() {
    world.set("account", new BankAccount());
}
```

### Go

```go
func setupAccountSteps(ctx *godog.ScenarioContext, world *generic.PropsWorld) {
    ctx.Step(`^"account" is set up as a new bank account$`, func() error {
        world.Props["account"] = NewBankAccount()
        return nil
    })
}
```

### C#

```csharp
[Given(@"""account"" is set up as a new bank account")]
public void AccountIsSetUpAsANewBankAccount()
{
    _world.Set("account", new BankAccount());
}
```

That's the only glue code needed. The four scenarios in the feature file run as-is in all four languages.

---

## How prop references work

SCS uses a shared dictionary called `props` (or `Props` in C# and Go) to pass values between steps. Any argument wrapped in `{...}` is resolved as a prop lookup at runtime:

| In the feature file | What SCS does |
|---------------------|---------------|
| `"account"` | The literal string `account` (used as a method name or map key) |
| `"{account}"` | Looks up `props["account"]` and passes its value |
| `"{result}"` | Looks up the result stored by the previous call step |
| `"{null}"` | The literal value `null` / `nil` |
| `"{true}"` / `"{false}"` | Boolean literals |
| `"{100}"` | The number `100` |

This means you can chain steps together, storing intermediate values and referring back to them:

```gherkin
Given "initialBalance" is "{500}"
And "account" is set up as a new bank account with balance "{initialBalance}"
When I call "{account}" with "withdraw" with parameter "{initialBalance}"
Then "{result}" is an error
```

---

## Checking results

After any `I call` step, the return value is stored in `result`. Use any assertion step to check it:

```gherkin
# Check the exact value
Then "{result}" is "150"

# Check it's not an error
Then "{result}" is not an error

# Check it's truthy
Then "{result}" is true

# Check an array
Then "{result}" is an array of objects with the following contents
  | type    | amount |
  | deposit | 100    |
```

If the call throws an exception, the error is stored in `result` rather than propagating — so you can assert on failure scenarios without the test crashing:

```gherkin
When I call "{account}" with "withdraw" with parameter "9999"
Then "{result}" is an error
Then "{result}" is an error with message "Insufficient funds"
```

---

## Testing async operations

If your API is asynchronous (returns a promise, `CompletableFuture`, Go channel, or C# `Task`), use the async steps:

```gherkin
Scenario: Async deposit
  Given "account" is set up as a new bank account
  And "depositFn" is set up as an async deposit of "100" into "{account}"
  When the promise "{depositFn}" should resolve
  Then "{result}" is "100"
```

Or using the task pattern for long-running operations:

```gherkin
Scenario: Batch processing
  Given "processor" is set up as a batch processor
  When I start task "batchJob" by calling "{processor}"
  And I wait for task "batchJob" to complete within "5000" ms
  Then "{result}" is not an error
```

---

## Running the tests

Each language runner points at the shared `features/` directory. You only need to write the setup step once per language.

```bash
# TypeScript
cd typescript && npm test

# Java
cd java && mvn test

# Go
cd go && go test ./...

# C#
dotnet test csharp/StandardCucumberSteps.csproj
```

---

## Next steps

- Browse the [Step Reference](../README.md#step-reference) for a full list of available steps
- [Variables](variables.md) — storing and referencing props
- [Assertions](assertions.md) — all assertion steps with examples
- [Method Calls](method-calls.md) — calling functions and methods
- [Async Steps](async.md) — promises, futures, and background tasks
- [Array Assertions](array-assertions.md) — matching arrays against data tables
- [Test Setup](test-setup.md) — built-in test helpers (counters, async functions, delays)
