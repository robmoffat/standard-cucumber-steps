# BDD and SCS for AI Agentic Coding

TLDR; AI coding agents — tools like Claude Code, Copilot Workspace, Devin, and similar systems — are increasingly used to generate, refactor, and port code autonomously. BDD with Standard Cucumber Steps is a particularly good fit for this style of development.

---

## The core problem with AI-generated code

AI agents are good at generating plausible-looking code. The hard part is knowing whether it is correct. Without a clear, executable specification, the human has to read and reason about the output themselves — which defeats much of the purpose.  

The usual escape hatches (unit tests, type checking, linting) help, but they have a gap: they verify *how* the code works, not *what* it is supposed to do. An AI can write a comprehensive unit test suite that perfectly describes wrong behaviour.  So, the human operator is still required to understand the code in the tests - also a lot of work.

BDD closes this gap by separating the specification from the implementation. Feature files are written in plain English by a human (or approved by one), and they describe the intended behaviour directly. The AI's job is to make those scenarios pass — not to decide what the scenarios should be.

---

## Feature files as agent proposals

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
