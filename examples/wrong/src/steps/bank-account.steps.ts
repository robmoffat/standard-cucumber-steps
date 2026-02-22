import { Given, When, Then, setWorldConstructor } from '@cucumber/cucumber';
import { expect } from 'expect';
import { BankAccount } from '../bank-account';

interface BankWorld {
  account: BankAccount;
}

// Each scenario line gets its own bespoke step definition and a matching
// helper method on the domain class — hardcoded to the specific values in
// the first scenario only. Adding the second scenario requires four new steps.

Given('a bank account with £40', function (this: BankWorld) {
  this.account = new BankAccount();
  this.account.add40Pounds();
});

When('£20 is removed', function (this: BankWorld) {
  this.account.remove20Pounds();
});

Then('the balance is £20', function (this: BankWorld) {
  expect(this.account.getBalance()).toBe(20);
});

// The second scenario ("a bank account with £100" / "£30 is removed" / "the balance is £70")
// has no matching steps — they would need to be added here as separate definitions,
// each with a new hardcoded method on BankAccount.
