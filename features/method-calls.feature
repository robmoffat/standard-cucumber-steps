Feature: Method invocation steps

  Scenario: Call a direct function with no parameters
    Given "handler" is a invocation counter into "count"
    When I call "{handler}"
    Then "{count}" is "1"

  Scenario: Call a function multiple times
    Given "handler" is a invocation counter into "count"
    When I call "{handler}"
    And I call "{handler}"
    Then "{count}" is "2"

  Scenario: Call a function that returns a value via promise resolve
    Given "myVar" is "hello"
    And "fn" is a function which returns a promise of "{myVar}"
    When the promise "{fn}" should resolve
    Then "{result}" is "hello"

  Scenario: Call a function and resolve within 10 seconds
    Given "myVar" is "world"
    And "fn" is a function which returns a promise of "{myVar}"
    When the promise "{fn}" should resolve within 10 seconds
    Then "{result}" is "world"

  Scenario: Refer to a result by alias
    Given "handler" is a invocation counter into "count"
    When I call "{handler}"
    And I call "{handler}"
    And I call "{handler}"
    And I refer to "{count}" as "total"
    Then "{total}" is "3"
