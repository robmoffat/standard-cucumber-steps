Feature: Array and object assertions
  # Array of objects - exact match

  Scenario: Array of objects with exact contents
    Given "arrayMaker" is an async function returning "{sampleArray}"
    When I wait for "{arrayMaker}"
    Then "{result}" is an array of objects with the following contents
      | name  | value |
      | Alice |   100 |
      | Bob   |   200 |
  # Array of objects - partial match

  Scenario: Array of objects with at least contents
    Given "arrayMaker" is an async function returning "{sampleArray}"
    When I wait for "{arrayMaker}"
    Then "{result}" is an array of objects with at least the following contents
      | name  |
      | Alice |

  Scenario: Array contains at least specified rows
    Given "testArray" is "{sampleArray}"
    Then "{testArray}" is an array of objects with at least the following contents
      | name  |
      | Alice |
  # Array of objects - exclusion match

  Scenario: Array of objects which doesn't contain
    Given "arrayMaker" is an async function returning "{sampleArray}"
    When I wait for "{arrayMaker}"
    Then "{result}" is an array of objects which doesn't contain any of
      | name    |
      | Charlie |
      | David   |
  # Array length assertions

  Scenario: Array length assertion
    Given "arrayMaker" is an async function returning "{sampleArray}"
    When I wait for "{arrayMaker}"
    Then "{result}" is an array of objects with length "2"

  Scenario: Array has specific length
    Given "arr" is "{sampleArray}"
    Then "{arr}" is an array of objects with length "2"

  Scenario: Empty array has length zero
    Given "arr" is "{sampleEmptyArray}"
    Then "{arr}" is an array of objects with length "0"
  # Array of strings

  Scenario: Array of strings assertion
    Given "arrayMaker" is an async function returning "{sampleStringArray}"
    When I wait for "{arrayMaker}"
    Then "{result}" is an array of strings with the following values
      | value |
      | one   |
      | two   |
      | three |

  Scenario: String array with expected values
    Given "arr" is "{sampleStringArray}"
    Then "{arr}" is an array of strings with the following values
      | value |
      | one   |
      | two   |
      | three |
  # Object assertions

  Scenario: Object with contents assertion
    Given "objectMaker" is an async function returning "{sampleObject}"
    When I wait for "{objectMaker}"
    Then "{result}" is an object with the following contents
      | name | age |
      | John |  30 |

  Scenario: Object has expected properties
    Given "obj" is "{sampleObject}"
    Then "{obj}" is an object with the following contents
      | name | age |
      | John |  30 |
  # Empty array assertion

  Scenario: Empty array assertion
    Given "emptyMaker" is an async function returning "{sampleEmptyArray}"
    When I wait for "{emptyMaker}"
    Then "{result}" is empty
