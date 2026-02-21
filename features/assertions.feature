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
    Given I set "nullValue" to "{null}"
    Then "{nullValue}" is null

  Scenario: Assert not null after calling counter
    Given "handler" is a invocation counter into "count"
    When I call "{handler}"
    Then "{count}" is not null
  # Truthy/falsy assertions - booleans

  Scenario: Boolean true is truthy
    Given I set "val" to "{true}"
    Then "{val}" is true

  Scenario: Boolean false is falsy
    Given I set "val" to "{false}"
    Then "{val}" is false
  # Truthy/falsy assertions - numbers

  Scenario: Zero is falsy
    Given I set "val" to "{0}"
    Then "{val}" is false

  Scenario: Positive number is truthy
    Given I set "val" to "{42}"
    Then "{val}" is true

  Scenario: Negative number is truthy
    Given I set "val" to "{-1}"
    Then "{val}" is true

  Scenario: Floating point positive is truthy
    Given I set "val" to "{3.14}"
    Then "{val}" is true
  # Truthy/falsy assertions - strings

  Scenario: Non-empty string is truthy
    Given I set "val" to "hello"
    Then "{val}" is true

  Scenario: Empty string is falsy
    Given I set "val" to ""
    Then "{val}" is false
  # Truthy/falsy assertions - null

  Scenario: Null is falsy
    Given I set "val" to "{null}"
    Then "{val}" is false
  # Truthy/falsy assertions - objects and arrays

  Scenario: Object is truthy
    Given I set "val" to "{sampleObject}"
    Then "{val}" is true

  Scenario: Array is truthy
    Given I set "val" to "{sampleArray}"
    Then "{val}" is true

  Scenario: Empty array is truthy (as an object)
    Given I set "val" to "{sampleEmptyArray}"
    Then "{val}" is true
  # Empty assertions

  Scenario: Empty string is empty
    Given I set "val" to ""
    Then "{val}" is empty

  Scenario: Empty array is empty
    Given I set "val" to "{sampleEmptyArray}"
    Then "{val}" is empty
  # Contains assertions

  Scenario: Assert contains substring
    Given I set "greeting" to "hello world"
    Then "{greeting}" contains "world"

  Scenario: Assert string contains one of
    Given I set "status" to "status_active"
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
    Given I set "val" to "{5}"
    And I set "threshold" to "{3}"
    Then "{val}" should be greater than "{threshold}"

  Scenario: Compare less than with variable
    Given I set "val" to "{2}"
    And I set "max" to "{10}"
    Then "{val}" should be less than "{max}"
  # Error assertions

  Scenario: Assert not an error after counter call
    Given "handler" is a invocation counter into "count"
    When I call "{handler}"
    Then "{count}" is not an error

  Scenario: Assert calling null as a function gives an error
    Given I set "fn" to "{null}"
    When I call "{fn}"
    Then "{result}" is an error

  Scenario: Assert is an error with specific message
    Given I set "errorFn" to "{errorThrowingFn}"
    When I call "{errorFn}"
    Then "{result}" is an error with message "Test error message"
