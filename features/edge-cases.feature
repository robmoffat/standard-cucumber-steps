Feature: Edge cases and additional coverage

  # Numeric comparisons with variables
  Scenario: Compare with variable threshold
    Given "val" is "{5}"
    And "threshold" is "{3}"
    Then "{val}" should be greater than "{threshold}"

  Scenario: Compare less than with variable
    Given "val" is "{2}"
    And "max" is "{10}"
    Then "{val}" should be less than "{max}"

  # Nested property access
  Scenario: Access nested object property
    Given "obj" is "{sampleObject}"
    When I refer to "{obj}" as "copied"
    Then "{copied}" is not null

  # Empty checks
  Scenario: Empty array check
    Given "arr" is "{sampleEmptyArray}"
    Then "{arr}" is empty

  # Start job with arguments
  Scenario: Start and wait for job with one arg
    Given "fn" is "{singleArgFn}"
    When I start "{fn}" using argument "hello" as "job1"
    And I wait for job "job1"
    Then "{result}" is "hello"

  Scenario: Start and wait for job with two args
    Given "fn" is "{twoArgFn}"
    When I start "{fn}" using arguments "A" and "B" as "job2"
    And I wait for job "job2"
    Then "{result}" is "AB"

  Scenario: Start and wait for job with three args
    Given "fn" is "{threeArgConcatFn}"
    When I start "{fn}" using arguments "X", "Y", and "Z" as "job3"
    And I wait for job "job3"
    Then "{result}" is "XYZ"

  Scenario: Start and wait for job with four args
    Given "fn" is "{fourArgConcatFn}"
    When I start "{fn}" using arguments "1", "2", "3", and "4" as "job4"
    And I wait for job "job4"
    Then "{result}" is "1234"

  # Wait for with timeout scenarios
  Scenario: Wait for async function within timeout
    Given "myVar" is "fast-result"
    And "fastFn" is an async function returning "{myVar}"
    When I wait for "{fastFn}" within "5000" ms
    Then "{result}" is "fast-result"

  # Non-empty string is truthy
  Scenario: Non-empty string is truthy
    Given "val" is "hello"
    Then "{val}" is true

  # Zero is falsy
  Scenario: Zero value is falsy
    Given "val" is "{0}"
    Then "{val}" is false

  # Positive number is truthy
  Scenario: Positive number is truthy
    Given "val" is "{42}"
    Then "{val}" is true
