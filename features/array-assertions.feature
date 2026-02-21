Feature: Array and numeric assertion steps

  # Array-specific steps (is an array of objects/strings) require language-specific
  # @Before hooks to create test arrays in props. These scenarios test the numeric
  # and range assertions that support array-length verification.

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
