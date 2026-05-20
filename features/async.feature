Feature: Async operations
  # Basic async function calls

  Scenario: Await an async function
    Given I set "myVar" to "async-result"
    And "fn" is an async function returning "{myVar}"
    When I wait for "{fn}"
    Then "{result}" is "async-result"

  Scenario: Wait for a function directly
    Given "handler" is a invocation counter into "count"
    When I wait for "{handler}"
    Then "{count}" is "1"

  Scenario: Async function returning after delay
    Given I set "delayedValue" to "delayed-result"
    And "delayedFn" is an async function returning "{delayedValue}" after "50" ms
    When I wait for "{delayedFn}"
    Then "{result}" is "delayed-result"
  # Wait for with timeout

  Scenario: Await with timeout
    Given I set "myVar" to "timed-result"
    And "fn" is an async function returning "{myVar}"
    When I wait for "{fn}" within "10000" ms
    Then "{result}" is "timed-result"
  # Wait for with arguments

  Scenario: Wait for function with one argument
    Given I set "echoFn" to "{singleArgFn}"
    When I wait for "{echoFn}" using argument "hello"
    Then "{result}" is "hello"

  Scenario: Wait for function with two arguments
    Given I set "concatFn" to "{twoArgFn}"
    When I wait for "{concatFn}" using arguments "Hello" and "World"
    Then "{result}" is "HelloWorld"

  Scenario: Wait for function with three arguments
    Given I set "threeArgFn" to "{threeArgConcatFn}"
    When I wait for "{threeArgFn}" using arguments "A", "B", and "C"
    Then "{result}" is "ABC"

  Scenario: Wait for function with four arguments
    Given I set "fourArgFn" to "{fourArgConcatFn}"
    When I wait for "{fourArgFn}" using arguments "1", "2", "3", and "4"
    Then "{result}" is "1234"
  # Background jobs

  Scenario: Run in background and wait later
    Given "handler" is a invocation counter into "count"
    When I start "{handler}" as "myJob"
    And I wait for job "myJob"
    Then "{count}" is "1"

  Scenario: Background job with timeout
    Given "handler" is a invocation counter into "count"
    When I start "{handler}" as "timedJob"
    And I wait for job "timedJob" within "5000" ms
    Then "{count}" is "1"
  # Start job with arguments

  Scenario: Start job with one argument
    Given I set "echoFn" to "{singleArgFn}"
    When I start "{echoFn}" using argument "jobArg" as "argJob"
    And I wait for job "argJob"
    Then "{result}" is "jobArg"

  Scenario: Start job with two arguments
    Given I set "concatFn" to "{twoArgFn}"
    When I start "{concatFn}" using arguments "Job" and "Args" as "twoArgJob"
    And I wait for job "twoArgJob"
    Then "{result}" is "JobArgs"

  Scenario: Start job with three arguments
    Given I set "threeArgFn" to "{threeArgConcatFn}"
    When I start "{threeArgFn}" using arguments "X", "Y", and "Z" as "threeArgJob"
    And I wait for job "threeArgJob"
    Then "{result}" is "XYZ"

  Scenario: Start job with four arguments
    Given I set "fourArgFn" to "{fourArgConcatFn}"
    When I start "{fourArgFn}" using arguments "P", "Q", "R", and "S" as "fourArgJob"
    And I wait for job "fourArgJob"
    Then "{result}" is "PQRS"
  # Method calls as background jobs

  Scenario: Start method call as background job with no arguments
    Given I set "calculator" to "{testCalculator}"
    When I call "{calculator}" with "GetValue" as "getValueJob"
    And I wait for job "getValueJob"
    Then "{result}" is "42"

  Scenario: Start method call as background job with one argument
    Given I set "calculator" to "{testCalculator}"
    When I call "{calculator}" with "Add" using argument "{10}" as "addJob"
    And I wait for job "addJob"
    Then "{result}" is "52"

  Scenario: Start method call as background job with two arguments
    Given I set "calculator" to "{testCalculator}"
    When I call "{calculator}" with "Multiply" using arguments "{3}" and "{4}" as "multiplyJob"
    And I wait for job "multiplyJob"
    Then "{result}" is "12"

  Scenario: Start method call as background job with three arguments
    Given I set "calculator" to "{testCalculator}"
    When I call "{calculator}" with "Sum3" using arguments "{1}", "{2}", and "{3}" as "sum3Job"
    And I wait for job "sum3Job"
    Then "{result}" is "6"

  Scenario: Start method call as background job with four arguments
    Given I set "calculator" to "{testCalculator}"
    When I call "{calculator}" with "Sum4" using arguments "{1}", "{2}", "{3}", and "{4}" as "sum4Job"
    And I wait for job "sum4Job"
    Then "{result}" is "10"
  # Wait for a period

  Scenario: Wait for a period does not advance counter
    Given "handler" is a invocation counter into "count"
    And we wait for a period of "10" ms
    Then "{count}" is "0"
