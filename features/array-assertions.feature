Feature: Array and object assertion steps
  # Tests for array matching, object matching, and numeric assertions

  Scenario: Counter reflects number of calls
    Given "handler" is a invocation counter into "count"
    When I call "{handler}"
    And I call "{handler}"
    And I call "{handler}"
    Then "{count}" is "3"

  Scenario: Greater-than assertion
    Given "handler" is a invocation counter into "count"
    When I call "{handler}"
    And I call "{handler}"
    Then "{count}" should be greater than "1"

  Scenario: Less-than assertion
    Given "handler" is a invocation counter into "count"
    When I call "{handler}"
    Then "{count}" should be less than "5"

  Scenario: String contains check supports substring matching
    Given "message" is "items: [apple, banana, cherry]"
    Then "{message}" contains "banana"

  Scenario: String contains one of
    Given "status" is "COMPLETED_WITH_ERRORS"
    Then "{status}" is a string containing one of
      | value     |
      | COMPLETED |
      | PENDING   |
      | FAILED    |

  Scenario: Array of objects with exact contents
    Given "arrayMaker" is an async function returning "{sampleArray}"
    When I wait for "{arrayMaker}"
    Then "{result}" is an array of objects with the following contents
      | name  | value |
      | Alice |   100 |
      | Bob   |   200 |

  Scenario: Array of objects with at least contents
    Given "arrayMaker" is an async function returning "{sampleArray}"
    When I wait for "{arrayMaker}"
    Then "{result}" is an array of objects with at least the following contents
      | name  |
      | Alice |

  Scenario: Array of objects which doesn't contain
    Given "arrayMaker" is an async function returning "{sampleArray}"
    When I wait for "{arrayMaker}"
    Then "{result}" is an array of objects which doesn't contain any of
      | name    |
      | Charlie |
      | David   |

  Scenario: Array length assertion
    Given "arrayMaker" is an async function returning "{sampleArray}"
    When I wait for "{arrayMaker}"
    Then "{result}" is an array of objects with length "2"

  Scenario: Array of strings assertion
    Given "arrayMaker" is an async function returning "{sampleStringArray}"
    When I wait for "{arrayMaker}"
    Then "{result}" is an array of strings with the following values
      | value |
      | one   |
      | two   |
      | three |

  Scenario: Object with contents assertion
    Given "objectMaker" is an async function returning "{sampleObject}"
    When I wait for "{objectMaker}"
    Then "{result}" is an object with the following contents
      | name | age |
      | John |  30 |

  Scenario: Empty array assertion
    Given "emptyMaker" is an async function returning "{sampleEmptyArray}"
    When I wait for "{emptyMaker}"
    Then "{result}" is empty
