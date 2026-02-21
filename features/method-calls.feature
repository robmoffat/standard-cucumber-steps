Feature: Method and function invocation
  # Direct function calls

  Scenario: Call a direct function with no parameters
    Given "handler" is a invocation counter into "count"
    When I call "{handler}"
    Then "{count}" is "1"

  Scenario: Call a function multiple times
    Given "handler" is a invocation counter into "count"
    When I call "{handler}"
    And I call "{handler}"
    Then "{count}" is "2"

  Scenario: Call counter three times
    Given "handler" is a invocation counter into "count"
    When I call "{handler}"
    And I call "{handler}"
    And I call "{handler}"
    Then "{count}" is "3"
  # Function calls with arguments

  Scenario: Call function with one argument
    Given I set "echoFn" to "{singleArgFn}"
    When I call "{echoFn}" using argument "test-input"
    Then "{result}" is "test-input"

  Scenario: Call function with two arguments
    Given I set "concatFn" to "{twoArgFn}"
    When I call "{concatFn}" using arguments "Hello" and "World"
    Then "{result}" is "HelloWorld"

  Scenario: Call function with three arguments
    Given I set "threeArgFn" to "{threeArgConcatFn}"
    When I call "{threeArgFn}" using arguments "A", "B", and "C"
    Then "{result}" is "ABC"

  Scenario: Call function with four arguments
    Given I set "fourArgFn" to "{fourArgConcatFn}"
    When I call "{fourArgFn}" using arguments "1", "2", "3", and "4"
    Then "{result}" is "1234"
  # Object method calls

  Scenario: Call method on an object with no arguments
    Given I set "calculator" to "{testCalculator}"
    When I call "{calculator}" with "GetValue"
    Then "{result}" is "42"

  Scenario: Call object method with one argument
    Given I set "calculator" to "{testCalculator}"
    When I call "{calculator}" with "Add" using argument "{10}"
    Then "{result}" is "52"

  Scenario: Call object method with two arguments
    Given I set "calculator" to "{testCalculator}"
    When I call "{calculator}" with "Multiply" using arguments "{3}" and "{4}"
    Then "{result}" is "12"

  Scenario: Call object method with three arguments
    Given I set "calculator" to "{testCalculator}"
    When I call "{calculator}" with "Sum3" using arguments "{1}", "{2}", and "{3}"
    Then "{result}" is "6"

  Scenario: Call object method with four arguments
    Given I set "calculator" to "{testCalculator}"
    When I call "{calculator}" with "Sum4" using arguments "{1}", "{2}", "{3}", and "{4}"
    Then "{result}" is "10"
  # Invocation counter setup

  Scenario: Create an invocation counter starts at zero
    Given "handler" is a invocation counter into "count"
    Then "{count}" is "0"
  # Async function setup

  Scenario: Create a function that returns a value
    Given I set "myVar" to "hello"
    And "fn" is an async function returning "{myVar}"
    When I wait for "{fn}"
    Then "{result}" is "hello"
