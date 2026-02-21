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

  Scenario: Call a function that returns a value
    Given "myVar" is "hello"
    And "fn" is an async function returning "{myVar}"
    When I wait for "{fn}"
    Then "{result}" is "hello"

  Scenario: Call a function and await with timeout
    Given "myVar" is "world"
    And "fn" is an async function returning "{myVar}"
    When I wait for "{fn}" within "10000" ms
    Then "{result}" is "world"

  Scenario: Refer to a result by alias
    Given "handler" is a invocation counter into "count"
    When I call "{handler}"
    And I call "{handler}"
    And I call "{handler}"
    And I refer to "{count}" as "total"
    Then "{total}" is "3"
