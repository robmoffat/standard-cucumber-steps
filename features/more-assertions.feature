Feature: Additional assertion coverage
  # Array length assertions

  Scenario: Array has specific length
    Given "arr" is "{sampleArray}"
    Then "{arr}" is an array of objects with length "2"

  Scenario: Empty array has length zero
    Given "arr" is "{sampleEmptyArray}"
    Then "{arr}" is an array of objects with length "0"
  # Array content matching at least

  Scenario: Array contains at least specified rows
    Given "testArray" is "{sampleArray}"
    Then "{testArray}" is an array of objects with at least the following contents
      | name  |
      | Alice |
  # String array assertions  

  Scenario: String array with expected values
    Given "arr" is "{sampleStringArray}"
    Then "{arr}" is an array of strings with the following values
      | value |
      | one   |
      | two   |
      | three |
  # Object content matching

  Scenario: Object has expected properties
    Given "obj" is "{sampleObject}"
    Then "{obj}" is an object with the following contents
      | name | age |
      | John |  30 |
  # More numeric comparisons

  Scenario: Greater than comparison with various values
    Given "val" is "{5}"
    Then "{val}" should be greater than "{4}"
    And "{val}" should be greater than "{0}"

  Scenario: Less than comparison with boundaries
    Given "val" is "{3}"
    Then "{val}" should be less than "{100}"
    And "{val}" should be less than "{4}"
  # Error checks

  Scenario: Error with specific message
    Given "errorFn" is "{errorThrowingFn}"
    When I call "{errorFn}"
    Then "{result}" is an error with message "Test error message"
