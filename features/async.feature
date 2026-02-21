Feature: Async operations
  # Basic async function calls

  Scenario: Await an async function
    Given "myVar" is "async-result"
    And "fn" is an async function returning "{myVar}"
    When I wait for "{fn}"
    Then "{result}" is "async-result"

  Scenario: Wait for a function directly
    Given "handler" is a invocation counter into "count"
    When I wait for "{handler}"
    Then "{count}" is "1"

  Scenario: Async function returning after delay
    Given "delayedValue" is "delayed-result"
    And "delayedFn" is an async function returning "{delayedValue}" after "50" ms
    When I wait for "{delayedFn}"
    Then "{result}" is "delayed-result"
  # Wait for with timeout

  Scenario: Await with timeout
    Given "myVar" is "timed-result"
    And "fn" is an async function returning "{myVar}"
    When I wait for "{fn}" within "10000" ms
    Then "{result}" is "timed-result"
  # Wait for with arguments

  Scenario: Wait for function with one argument
    Given "echoFn" is "{singleArgFn}"
    When I wait for "{echoFn}" using argument "hello"
    Then "{result}" is "hello"

  Scenario: Wait for function with two arguments
    Given "concatFn" is "{twoArgFn}"
    When I wait for "{concatFn}" using arguments "Hello" and "World"
    Then "{result}" is "HelloWorld"

  Scenario: Wait for function with three arguments
    Given "threeArgFn" is "{threeArgConcatFn}"
    When I wait for "{threeArgFn}" using arguments "A", "B", and "C"
    Then "{result}" is "ABC"

  Scenario: Wait for function with four arguments
    Given "fourArgFn" is "{fourArgConcatFn}"
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
    Given "echoFn" is "{singleArgFn}"
    When I start "{echoFn}" using argument "jobArg" as "argJob"
    And I wait for job "argJob"
    Then "{result}" is "jobArg"

  Scenario: Start job with two arguments
    Given "concatFn" is "{twoArgFn}"
    When I start "{concatFn}" using arguments "Job" and "Args" as "twoArgJob"
    And I wait for job "twoArgJob"
    Then "{result}" is "JobArgs"

  Scenario: Start job with three arguments
    Given "threeArgFn" is "{threeArgConcatFn}"
    When I start "{threeArgFn}" using arguments "X", "Y", and "Z" as "threeArgJob"
    And I wait for job "threeArgJob"
    Then "{result}" is "XYZ"

  Scenario: Start job with four arguments
    Given "fourArgFn" is "{fourArgConcatFn}"
    When I start "{fourArgFn}" using arguments "P", "Q", "R", and "S" as "fourArgJob"
    And I wait for job "fourArgJob"
    Then "{result}" is "PQRS"
  # Wait for a period

  Scenario: Wait for a period does not advance counter
    Given "handler" is a invocation counter into "count"
    And we wait for a period of "10" ms
    Then "{count}" is "0"
