Feature: Go-specific tests for struct field access

  Scenario: Access struct field via dot notation
    Given I set "calculator" to "{testCalculator}"
    When I refer to "{testCalculator.Value}" as "calcValue"
    Then "{calcValue}" is "42"

  Scenario: Access struct field with capitalized name
    Given I set "calculator" to "{testCalculator}"
    When I refer to "{testCalculator.value}" as "calcValue"
    Then "{calcValue}" is "42"

  Scenario: Interpolate multiple variables in string
    Given I set "first" to "Hello"
    And I set "second" to "World"
    And I set "greeting" to "{first} {second}!"
    Then "{greeting}" contains "Hello"
    And "{greeting}" contains "World"

  Scenario: Call method that returns an error
    Given I set "calculator" to "{testCalculator}"
    When I call "{calculator}" with "FailingMethod"
    Then "{result}" is an error

  Scenario: Nil value is falsy
    Given I set "val" to "{nil}"
    Then "{val}" is false

  Scenario: Nil check via null literal
    Given I set "val" to "{null}"
    Then "{val}" is null

  Scenario: Object field is not empty
    Given I set "obj" to "{sampleObject}"
    Then "{obj}" is not null

  Scenario: Array length check with non-zero
    Given I set "arr" to "{sampleArray}"
    Then "{arr}" is an array of objects with length "2"

  Scenario: Empty array length is zero
    Given I set "arr" to "{sampleEmptyArray}"
    Then "{arr}" is an array of objects with length "0"
