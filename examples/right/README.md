# Example: Right — Standard Cucumber Steps

This project demonstrates the correct pattern using [Standard Cucumber Steps](../../typescript).  The only custom code is a single three-line setup hook that hands a `BankAccount` instance to the framework. SCS handles method invocation, argument coercion, result capture, and assertion for both scenarios — with no bespoke step definitions at all.

Adding a third scenario with any deposit or withdrawal amount requires zero additional code.

## Run

```bash
npm install
npm test
# HTML report: reports/cucumber-report.html
```
