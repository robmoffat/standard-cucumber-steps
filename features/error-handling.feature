Feature: Error handling
  # Basic error scenarios

  Scenario: Wait for function that throws error
    Given "errorFn" is "{errorThrowingFn}"
    When I wait for "{errorFn}"
    Then "{result}" is an error

  Scenario: Error with specific message
    Given "errorFn" is "{errorThrowingFn}"
    When I call "{errorFn}"
    Then "{result}" is an error with message "Test error message"

  Scenario: Error message contains substring
    Given "errorFn" is "{errorThrowingFn}"
    When I call "{errorFn}"
    Then "{result}" contains "error"
  # Job errors

  Scenario: Job that fails
    Given "errorFn" is "{errorThrowingFn}"
    When I start "{errorFn}" as "failingJob"
    And I wait for job "failingJob"
    Then "{result}" is an error
  # Timeout errors

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
  # Wait for functions with args that throw

  Scenario: Wait for function with argument that throws error
    Given "errorFn" is "{errorWithArgFn}"
    When I wait for "{errorFn}" using argument "test"
    Then "{result}" is an error

  Scenario: Wait for function with two arguments that throws error
    Given "errorFn" is "{errorWith2ArgsFn}"
    When I wait for "{errorFn}" using arguments "a" and "b"
    Then "{result}" is an error

  Scenario: Wait for function with three arguments that throws error
    Given "errorFn" is "{errorWith3ArgsFn}"
    When I wait for "{errorFn}" using arguments "a", "b", and "c"
    Then "{result}" is an error

  Scenario: Wait for function with four arguments that throws error
    Given "errorFn" is "{errorWith4ArgsFn}"
    When I wait for "{errorFn}" using arguments "a", "b", "c", and "d"
    Then "{result}" is an error
  # Call functions with args that throw

  Scenario: Call function with argument that throws error
    Given "errorFn" is "{errorWithArgFn}"
    When I call "{errorFn}" using argument "test"
    Then "{result}" is an error

  Scenario: Call function with two arguments that throws error
    Given "errorFn" is "{errorWith2ArgsFn}"
    When I call "{errorFn}" using arguments "a" and "b"
    Then "{result}" is an error

  Scenario: Call function with three arguments that throws error
    Given "errorFn" is "{errorWith3ArgsFn}"
    When I call "{errorFn}" using arguments "a", "b", and "c"
    Then "{result}" is an error

  Scenario: Call function with four arguments that throws error
    Given "errorFn" is "{errorWith4ArgsFn}"
    When I call "{errorFn}" using arguments "a", "b", "c", and "d"
    Then "{result}" is an error
