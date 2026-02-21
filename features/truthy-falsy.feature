Feature: Truthy and falsy value checks
  # Boolean values

  Scenario: Boolean true is truthy
    Given "val" is "{true}"
    Then "{val}" is true

  Scenario: Boolean false is falsy
    Given "val" is "{false}"
    Then "{val}" is false
  # Numeric values

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
  # String values

  Scenario: Non-empty string is truthy
    Given "val" is "hello"
    Then "{val}" is true

  Scenario: Empty string is falsy
    Given "val" is ""
    Then "{val}" is false
  # Null values

  Scenario: Null is falsy
    Given "val" is "{null}"
    Then "{val}" is false
  # Objects and arrays are truthy

  Scenario: Object is truthy
    Given "val" is "{sampleObject}"
    Then "{val}" is true

  Scenario: Array is truthy
    Given "val" is "{sampleArray}"
    Then "{val}" is true

  Scenario: Empty array is truthy (as an object)
    Given "val" is "{sampleEmptyArray}"
    Then "{val}" is true
  # Empty checks

  Scenario: Empty string is empty
    Given "val" is ""
    Then "{val}" is empty

  Scenario: Empty array is empty
    Given "val" is "{sampleEmptyArray}"
    Then "{val}" is empty
