Feature: Async steps

  Scenario: Await an async function
    Given "myVar" is "async-result"
    And "fn" is an async function returning "{myVar}"
    When I wait for "{fn}"
    Then "{result}" is "async-result"

  Scenario: Await with timeout
    Given "myVar" is "timed-result"
    And "fn" is an async function returning "{myVar}"
    When I wait for "{fn}" within "10000" ms
    Then "{result}" is "timed-result"

  Scenario: Run in background and wait later
    Given "handler" is a invocation counter into "count"
    When I start "{handler}" as "myJob"
    And I wait for job "myJob"
    Then "{count}" is "1"

  Scenario: Wait for a function directly
    Given "handler" is a invocation counter into "count"
    When I wait for "{handler}"
    Then "{count}" is "1"

  Scenario: Background job with timeout
    Given "handler" is a invocation counter into "count"
    When I start "{handler}" as "timedJob"
    And I wait for job "timedJob" within "5000" ms
    Then "{count}" is "1"
