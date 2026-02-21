Feature: Error handling and edge cases

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

  # Basic error assertions
  Scenario: Error with specific message
    Given "errorFn" is "{errorThrowingFn}"
    When I call "{errorFn}"
    Then "{result}" is an error with message "Test error message"

  Scenario: Error message contains substring
    Given "errorFn" is "{errorThrowingFn}"
    When I call "{errorFn}"
    Then "{result}" contains "error"
