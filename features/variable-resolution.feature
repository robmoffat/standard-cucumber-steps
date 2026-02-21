Feature: Variable resolution edge cases

  Scenario: Resolve boolean literal true
    Given "val" is "{true}"
    Then "{val}" is true

  Scenario: Resolve boolean literal false
    Given "val" is "{false}"
    Then "{val}" is false

  Scenario: Resolve null literal
    Given "val" is "{null}"
    Then "{val}" is null

  Scenario: Resolve numeric literal zero
    Given "val" is "{0}"
    Then "{val}" is false

  Scenario: Resolve negative number
    Given "val" is "{-5}"
    Then "{val}" should be less than "{0}"

  Scenario: Simple variable lookup
    Given "myValue" is "test-value"
    When I refer to "{myValue}" as "copied"
    Then "{copied}" is "test-value"

  Scenario: Variable resolution with PascalCase fallback
    Given "myvar" is "lowercase-value"
    When I refer to "{myvar}" as "result"
    Then "{result}" is "lowercase-value"
