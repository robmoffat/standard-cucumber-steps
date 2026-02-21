Feature: Test setup steps

  Scenario: Create an invocation counter starts at zero
    Given "handler" is a invocation counter into "count"
    Then "{count}" is "0"

  Scenario: Invoke a counter once
    Given "handler" is a invocation counter into "count"
    When I call "{handler}"
    Then "{count}" is "1"

  Scenario: Invoke a counter multiple times
    Given "handler" is a invocation counter into "count"
    When I call "{handler}"
    And I call "{handler}"
    And I call "{handler}"
    Then "{count}" is "3"

  Scenario: Create a function that returns a value
    Given "myVar" is "hello"
    And "fn" is a function which returns a promise of "{myVar}"
    When the promise "{fn}" should resolve
    Then "{result}" is "hello"

  Scenario: Wait for a period does not advance counter
    Given "handler" is a invocation counter into "count"
    And we wait for a period of "10" ms
    Then "{count}" is "0"
