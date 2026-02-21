Feature: Value assertions
  # Equality assertions

  Scenario: Assert a field equals a string
    Given "handler" is a invocation counter into "count"
    When I call "{handler}"
    Then "{count}" is "1"

  Scenario: Assert result is undefined when never set
    Then "{result}" is undefined
  # Null assertions

  Scenario: Assert is null
    Given "nullValue" is "{null}"
    Then "{nullValue}" is null

  Scenario: Assert not null after calling counter
    Given "handler" is a invocation counter into "count"
    When I call "{handler}"
    Then "{count}" is not null
  # Truthy/falsy assertions - booleans

  Scenario: Boolean true is truthy
    Given "val" is "{true}"
    Then "{val}" is true

  Scenario: Boolean false is falsy
    Given "val" is "{false}"
    Then "{val}" is false
  # Truthy/falsy assertions - numbers

  Scenario: Zero is falsy
    Given "val" is "{0}"
    Then "{val}" is false

  Scenario: Positive number is truthy
    Given "val" is "{42}"
    Then "{val}" is true

  Scenario: Negative number is truthy
    Given "val" is "{-1}"
    Then "{val}" is true

  Scenario: Floating point positive is truthy
    Given "val" is "{3.14}"
    Then "{val}" is true
  # Truthy/falsy assertions - strings

  Scenario: Non-empty string is truthy
    Given "val" is "hello"
    Then "{val}" is true

  Scenario: Empty string is falsy
    Given "val" is ""
    Then "{val}" is false
  # Truthy/falsy assertions - null

  Scenario: Null is falsy
    Given "val" is "{null}"
    Then "{val}" is false
  # Truthy/falsy assertions - objects and arrays

  Scenario: Object is truthy
    Given "val" is "{sampleObject}"
    Then "{val}" is true

  Scenario: Array is truthy
    Given "val" is "{sampleArray}"
    Then "{val}" is true

  Scenario: Empty array is truthy (as an object)
    Given "val" is "{sampleEmptyArray}"
    Then "{val}" is true
  # Empty assertions

  Scenario: Empty string is empty
    Given "val" is ""
    Then "{val}" is empty

  Scenario: Empty array is empty
    Given "val" is "{sampleEmptyArray}"
    Then "{val}" is empty
  # Contains assertions

  Scenario: Assert contains substring
    Given "greeting" is "hello world"
    Then "{greeting}" contains "world"

  Scenario: Assert string contains one of
    Given "status" is "status_active"
    Then "{status}" is a string containing one of
      | value   |
      | active  |
      | pending |
      | closed  |
  # Numeric comparison assertions

  Scenario: Assert greater than
    Given "handler" is a invocation counter into "count"
    When I call "{handler}"
    And I call "{handler}"
    Then "{count}" should be greater than "1"

  Scenario: Assert less than
    Given "handler" is a invocation counter into "count"
    When I call "{handler}"
    Then "{count}" should be less than "5"

  Scenario: Compare with variable threshold
    Given "val" is "{5}"
    And "threshold" is "{3}"
    Then "{val}" should be greater than "{threshold}"

  Scenario: Compare less than with variable
    Given "val" is "{2}"
    And "max" is "{10}"
    Then "{val}" should be less than "{max}"
  # Error assertions

  Scenario: Assert not an error after counter call
    Given "handler" is a invocation counter into "count"
    When I call "{handler}"
    Then "{count}" is not an error

  Scenario: Assert calling null as a function gives an error
    Given "fn" is "{null}"
    When I call "{fn}"
    Then "{result}" is an error

  Scenario: Assert is an error with specific message
    Given "errorFn" is "{errorThrowingFn}"
    When I call "{errorFn}"
    Then "{result}" is an error with message "Test error message"
