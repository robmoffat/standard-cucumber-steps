Feature: Bank account

  Scenario: Customer deposits and withdraws money
    Given a bank account with £40
    When £20 is removed
    Then the balance is £20
