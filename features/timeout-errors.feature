Feature: Timeout and error scenarios

  Scenario: Job that fails
    Given "errorFn" is "{errorThrowingFn}"
    When I start "{errorFn}" as "failingJob"
    And I wait for job "failingJob"
    Then "{result}" is an error

  Scenario: Wait for function that throws error
    Given "errorFn" is "{errorThrowingFn}"
    When I wait for "{errorFn}"
    Then "{result}" is an error

  Scenario: Job timeout
    Given "slowValue" is "slow-result"
    And "slowFn" is an async function returning "{slowValue}" after "5000" ms
    When I start "{slowFn}" as "slowJob"
    And I wait for job "slowJob" within "10" ms
    Then "{result}" is an error

  Scenario: Wait for with timeout error
    Given "slowValue" is "slow-result"
    And "slowFn" is an async function returning "{slowValue}" after "5000" ms
    When I wait for "{slowFn}" within "10" ms
    Then "{result}" is an error
