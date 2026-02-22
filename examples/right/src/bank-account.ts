export class BankAccount {
  private balance = 0;

  deposit(amount: number)  { this.balance += amount; }
  withdraw(amount: number) { this.balance -= amount; return this.balance; }
}
