Feature: Variable management
  # Setting and referencing variables

  Scenario: Refer to a value by another name
    Given "handler" is a invocation counter into "count"
    When I call "{handler}"
    And I refer to "{count}" as "myAlias"
    Then "{myAlias}" is "1"

  Scenario: Refer to a string value
    Given "myValue" is "hello world"
    When I refer to "{myValue}" as "copied"
    Then "{copied}" is "hello world"

  Scenario: Simple variable lookup
    Given "myValue" is "test-value"
    When I refer to "{myValue}" as "copied"
    Then "{copied}" is "test-value"
  # Boolean literals

  Scenario: Set and check boolean true literal
    Given "myFlag" is "{true}"
    Then "{myFlag}" is true

  Scenario: Set and check boolean false literal
    Given "myFlag" is "{false}"
    Then "{myFlag}" is false
  # Numeric literals

  Scenario: Set and check a numeric literal
    Given "myNum" is "{1}"
    Then "{myNum}" is "1"

  Scenario: Resolve numeric literal zero
    Given "val" is "{0}"
    Then "{val}" is false

  Scenario: Resolve negative number
    Given "val" is "{-5}"
    Then "{val}" should be less than "{0}"
  # Null literal

  Scenario: Explicitly set null and check
    Given "myNull" is "{null}"
    Then "{myNull}" is null
