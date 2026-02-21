Feature: Async steps

  Scenario: Resolve a promise
    Given "myVar" is "async-result"
    And "fn" is a function which returns a promise of "{myVar}"
    When the promise "{fn}" should resolve
    Then "{result}" is "async-result"

  Scenario: Resolve a promise within 10 seconds
    Given "myVar" is "timed-result"
    And "fn" is a function which returns a promise of "{myVar}"
    When the promise "{fn}" should resolve within 10 seconds
    Then "{result}" is "timed-result"

  Scenario: Start a task and wait for it to complete
    Given "handler" is a invocation counter into "count"
    When I start task "myTask" by calling "{handler}"
    And I wait for task "myTask" to complete
    Then "{count}" is "1"

  Scenario: Wait for a function directly
    Given "handler" is a invocation counter into "count"
    When I wait for "{handler}"
    Then "{count}" is "1"

  Scenario: Start a task and wait with custom timeout
    Given "handler" is a invocation counter into "count"
    When I start task "timedTask" by calling "{handler}"
    And I wait for task "timedTask" to complete within "5000" ms
    Then "{count}" is "1"
