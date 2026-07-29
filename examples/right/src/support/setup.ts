import { Given } from '@cucumber/cucumber';
import { PropsWorld } from '@finos/cucumber-testing-steps';
import { BankAccount } from '../bank-account';

// This is the only custom code needed for the bank account scenarios.
// CTS handles method invocation, argument coercion, result capture, and assertion.
Given('"account" is set up as a new bank account', function (this: PropsWorld) {
  this.props['account'] = new BankAccount();
});
