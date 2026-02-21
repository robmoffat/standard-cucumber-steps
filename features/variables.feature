Feature: Variable reference steps

  Scenario: Refer to a value by another name
    Given "handler" is a invocation counter into "count"
    When I call "{handler}"
    And I refer to "{count}" as "myAlias"
    Then "{myAlias}" is "1"

  Scenario: Set and check a boolean true literal
    Given "myFlag" is "{true}"
    Then "{myFlag}" is true

  Scenario: Set and check a boolean false literal
    Given "myFlag" is "{false}"
    Then "{myFlag}" is false

  Scenario: Set and check a numeric literal
    Given "myNum" is "{1}"
    Then "{myNum}" is "1"

  Scenario: Refer to a string value
    Given "myValue" is "hello world"
    When I refer to "{myValue}" as "copied"
    Then "{copied}" is "hello world"

  Scenario: Explicitly set null and check
    Given "myNull" is "{null}"
    Then "{myNull}" is null
