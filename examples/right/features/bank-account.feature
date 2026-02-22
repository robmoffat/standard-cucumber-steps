Feature: Bank account

  Scenario: Customer deposits and withdraws money
    Given "account" is set up as a new bank account
    When I call "{account}" with "deposit" using argument "40"
    And I call "{account}" with "withdraw" using argument "20"
    Then "{result}" is "20"

  Scenario: Customer deposits a larger amount and withdraws
    Given "account" is set up as a new bank account
    When I call "{account}" with "deposit" using argument "100"
    And I call "{account}" with "withdraw" using argument "30"
    Then "{result}" is "70"
