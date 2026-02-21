Feature: Go-specific tests for struct field access

  Scenario: Access struct field via dot notation
    Given "calculator" is "{testCalculator}"
    When I refer to "{testCalculator.Value}" as "calcValue"
    Then "{calcValue}" is "42"

  Scenario: Access struct field with capitalized name
    Given "calculator" is "{testCalculator}"
    When I refer to "{testCalculator.value}" as "calcValue"
    Then "{calcValue}" is "42"

  Scenario: Interpolate multiple variables in string
    Given "first" is "Hello"
    And "second" is "World"
    And "greeting" is "{first} {second}!"
    Then "{greeting}" contains "Hello"
    And "{greeting}" contains "World"

  Scenario: Call method that returns an error
    Given "calculator" is "{testCalculator}"
    When I call "{calculator}" with "FailingMethod"
    Then "{result}" is an error

  Scenario: Nil value is falsy
    Given "val" is "{nil}"
    Then "{val}" is false

  Scenario: Nil check via null literal
    Given "val" is "{null}"
    Then "{val}" is null

  Scenario: Object field is not empty
    Given "obj" is "{sampleObject}"
    Then "{obj}" is not null

  Scenario: Array length check with non-zero
    Given "arr" is "{sampleArray}"
    Then "{arr}" is an array of objects with length "2"

  Scenario: Empty array length is zero
    Given "arr" is "{sampleEmptyArray}"
    Then "{arr}" is an array of objects with length "0"
