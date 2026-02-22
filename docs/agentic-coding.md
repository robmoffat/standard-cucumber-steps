# BDD and SCS for AI Agentic Coding

TLDR; AI coding agents — tools like Claude Code, Copilot Workspace, Devin, and similar systems — are increasingly used to generate code autonomously. BDD with Standard Cucumber Steps is a particularly good fit for this style of development as it simplifies the review process and reduces the scope for agent hallucination.

---

## The core problem with AI-generated code

AI agents are good at generating plausible-looking code. The hard part is knowing whether it is correct. Without a clear, executable specification, the human has to read and reason about the code themself — which defeats much of the purpose.  

The usual escape hatches (unit tests, type checking, linting) help, but they have a gap: they verify *how* the code works, not *what* it is supposed to do. An AI can write a comprehensive unit test suite that perfectly describes wrong behaviour.  So, the human operator is still required to understand the code in the tests - also a lot of work.

BDD closes this gap by separating the specification from the implementation. Scenarios are written / approved in plain English. The AI then writes code to make them pass.  However if the AI is both writing the code and the mapping between the specification and test steps, there is an opportunity for "gaming" the tests - writing a mapping that helps the tests to pass.

## An Example:  The Unhappy Path

This is an extreme and overly-simplified example but it should illustrate the point.  The human prompts the following:

> Write an API for a bank account, allowing the money in the account to be increased and decreased.  Write scenarios to test the account, using BDD.

### A Feature File

The agent proposes this:

```gherkin
Scenario: Withdrawing more than the balance throws an error
  Given a new bank account with a balance of 0 dollars
  When I call the api to increase the balance by 50 dollars
  And I call the api to decrease the balance by 20 dollars
  Then the account balance will be 30 dollars
```

This looks like a good test, but it can be gamed by writing the following code:

```typescript
// Step definitions written by the agent
Given('a new bank account with a balance of 0 dollars', function (this: World) {
  this.account = new BankAccount();
});

When('I call the api to increase the balance by 50 dollars', function (this: World) {
  this.account.add50Dollars();
});

When('I call the api to decrease the balance by 20 dollars', function (this: World) {
  this.account.remove20Dollars();
});


Then('the account balance will be 30 dollars', function (this: World) {
  expect(this.account.getBalance()).toBe(30);
});
```

```typescript
// Methods added to BankAccount by the agent
class BankAccount {
  add50Dollars()    { this.balance += 50; }
  remove20Dollars() { this.balance -= 20; }
  getBalance()     { return this.balance; }
}
```

This is an extreme example, but it shows clearly how we could go off the tracks very easily.  Further, adding extra tests might just mean the agent adds new methods such as `add30Dollars`, `remove40Dollars` etc.








When tasked to build something, as well as drafting code, the agent can propose a feature file that captures its understanding of the requirement:

```gherkin
Scenario: Withdrawing more than the balance throws an error
  Given "account" is set up as a new bank account
  When I call "{account}" with "deposit" with parameter "50"
  And I call "{account}" with "withdraw" with parameter "100"
  Then "{result}" is an error
```

This proposal is a contract offer. The agent is saying: "Here is what I think you want. If this scenario passes, do we agree the feature is complete?"

For the human reviewer, this is far easier to evaluate than implementation code. The scenario is plain English. It describes behaviour, not mechanics. A quick read reveals whether the agent has understood the intent — or whether it has missed an edge case, misunderstood a term, or gone off in the wrong direction entirely.

The advantage here is the tight loop — propose spec, get approval, implement, verify.  However the disadvantage (normally) with cucumber is that there is an extra level of abstraction into which the agent can introduce errors - the glue code of the step definitions which tie together human readable steps with code that is executed.

---

## SCS removes the glue-code burden

Without SCS, an agent generating tests must also generate step definitions. This is boilerplate that varies slightly per project, is easy to get subtly wrong, and adds noise to code review.

With SCS, the agent writes only one thing per language: the `@Before` hook that wires up the domain object. Everything else — method invocation, assertion, async handling, array matching — is already implemented and tested.

This means the agent's output is minimal and reviewable:

```typescript
// Everything the agent needs to write for the bank account scenarios
Given('"account" is set up as a new bank account', function (this: PropsWorld) {
  this.props['account'] = new BankAccount();
});
```
---

## A concrete example: bank account

To make the difference tangible, consider a simple bank account scenario. A human writes the requirement:

> A customer deposits £40 and then withdraws £20. The balance should be £20.

### The unhappy path: agent-generated glue code

Left to its own devices, an agent will typically translate each scenario line into a bespoke step definition and introduce matching helper methods on the domain object to make those steps compile:

```gherkin
# Feature file written by the agent
Scenario: Customer deposits and withdraws money
  Given a bank account with £40
  When £20 is removed
  Then the balance is £20
```

```typescript
// Step definitions written by the agent
Given('a bank account with £40', function (this: World) {
  this.account = new BankAccount();
  this.account.add40Pounds();
});

When('£20 is removed', function (this: World) {
  this.account.remove20Pounds();
});

Then('the balance is £20', function (this: World) {
  expect(this.account.getBalance()).toBe(20);
});
```

```typescript
// Methods added to BankAccount by the agent
class BankAccount {
  add40Pounds()    { this.balance += 40; }
  remove20Pounds() { this.balance -= 20; }
  getBalance()     { return this.balance; }
}
```

This passes — but it has created several problems:

- **The steps are not reusable.** `'a bank account with £40'` cannot be used for any other amount. A second scenario (deposit £100, withdraw £30) requires four entirely new step definitions.
- **The glue code is where bugs hide.** If `add40Pounds` rounds to an integer or `remove20Pounds` applies a fee, the scenario still passes but the implementation is wrong. The human reviewer must read the implementation, not just the scenario.
- **The methods are test artefacts, not domain logic.** `add40Pounds()` would never appear in production code. The agent has polluted the domain model with test-specific wiring.
- **Porting is painful.** Rewriting in another language means reproducing all the bespoke step definitions by hand, with no guarantee the behaviour is equivalent.

### The happy path: using SCS

With SCS, the agent writes a scenario using generic, parameterised steps, and the only custom code needed is the single setup hook that hands the domain object to the framework:

```gherkin
# Feature file written by the agent
Scenario: Customer deposits and withdraws money
  Given "account" is set up as a new bank account
  When I call "{account}" with "deposit" with parameter "40"
  And I call "{account}" with "withdraw" with parameter "20"
  Then "{result}" is "20"
```

```typescript
// Everything the agent needs to write
Given('"account" is set up as a new bank account', function (this: PropsWorld) {
  this.props['account'] = new BankAccount();
});
```

The domain class is unchanged and contains only real business logic:

```typescript
class BankAccount {
  private balance = 0;
  deposit(amount: number)  { this.balance += amount; }
  withdraw(amount: number) { this.balance -= amount; return this.balance; }
}
```

The SCS framework handles method invocation, argument coercion, result capture, and assertion. No bespoke step definitions are needed. A second scenario with different amounts requires zero additional code — just a new scenario block. Porting to Java, Go, or C# means the feature file is unchanged; only the one-line setup hook changes language.

---

## Cross-language generation

One of the most valuable AI agentic workflows is porting a library from one language to another. The typical process is:

1. Human writes the feature files describing the intended behaviour
2. Agent generates the implementation in the target language
3. Tests run against the shared feature files
4. Agent iterates until all scenarios pass

Because SCS provides the same step DSL across TypeScript, Java, Go, and C#, the feature files need not change at all between languages. The agent gets a concrete, executable definition of "correct" that is identical in all four targets. This is significantly more reliable than asking an agent to infer the contract from source code alone.

When asking an agent to build APIs for multiple different languages, having a portable set of feature files is a huge boon (as we have discovered on [FDC3](https://github.com/finos/FDC3).)

---

## Living documentation that agents can maintain

When an agent refactors code, the risk is that it changes behaviour without realising it. With BDD, the scenarios are the authoritative record of intended behaviour, and they run on every change. If a refactor breaks a scenario, the agent is immediately told which behaviour changed and can decide whether that was intentional.

This also means agents can keep documentation accurate. If a feature file describes a behaviour that no longer exists, the scenario fails — making stale documentation visible rather than hidden in comments or wikis.

---

## Summary

| Property | Why it matters for AI agents |
|----------|------------------------------|
| Human-readable specifications | Agents understand intent directly; no translation layer |
| Executable scenarios | "Done" is unambiguous — scenarios pass or they do not |
| Minimal glue code (SCS) | Agent output is small, focused, and easy to review |
| Shared feature files across languages | One spec drives port and migration workflows in all target languages |
| Structured failure output | Agents can parse and act on failures programmatically |
| Living documentation | Stale specs fail; agents can keep behaviour and docs in sync |
