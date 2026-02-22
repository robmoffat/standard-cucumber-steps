export class BankAccount {
  private balance = 0;

  add40Pounds()    { this.balance += 40; }
  remove20Pounds() { this.balance -= 20; }
  getBalance()     { return this.balance; }
}
