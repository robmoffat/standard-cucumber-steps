Feature: Assertion steps

  Scenario: Assert a field equals a string
    Given "handler" is a invocation counter into "count"
    When I call "{handler}"
    Then "{count}" is "1"

  Scenario: Assert result is undefined when never set
    Then "{result}" is undefined

  Scenario: Assert not null after calling counter
    Given "handler" is a invocation counter into "count"
    When I call "{handler}"
    Then "{count}" is not null

  Scenario: Assert true after one call
    Given "handler" is a invocation counter into "count"
    When I call "{handler}"
    Then "{count}" is true

  Scenario: Assert false with zero count
    Given "handler" is a invocation counter into "count"
    Then "{count}" is false

  Scenario: Assert not an error after counter call
    Given "handler" is a invocation counter into "count"
    When I call "{handler}"
    Then "{count}" is not an error

  Scenario: Assert calling null as a function gives an error
    Given "fn" is "{null}"
    When I call "{fn}"
    Then "{result}" is an error

  Scenario: Assert contains substring
    Given "greeting" is "hello world"
    Then "{greeting}" contains "world"

  Scenario: Assert string contains one of
    Given "status" is "status_active"
    Then "{status}" is a string containing one of
      | value   |
      | active  |
      | pending |
      | closed  |

  Scenario: Assert greater than
    Given "handler" is a invocation counter into "count"
    When I call "{handler}"
    And I call "{handler}"
    Then "{count}" should be greater than "1"

  Scenario: Assert less than
    Given "handler" is a invocation counter into "count"
    When I call "{handler}"
    Then "{count}" should be less than "5"

  Scenario: Assert is an error with specific message
    Given "errorFn" is "{errorThrowingFn}"
    When I call "{errorFn}"
    Then "{result}" is an error with message "Test error message"

  Scenario: Assert is null
    Given "nullValue" is "{null}"
    Then "{nullValue}" is null

  Scenario: Assert empty string is falsy
    Given "emptyStr" is ""
    Then "{emptyStr}" is false

  Scenario: Assert numeric zero is falsy
    Given "zero" is "{0}"
    Then "{zero}" is false

  Scenario: Assert non-zero number is truthy
    Given "num" is "{42}"
    Then "{num}" is true
