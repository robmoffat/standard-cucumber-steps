Feature: Java-specific tests
  # This feature file tests Java-specific code paths that cannot be tested
  # via the shared feature files, including:
  # - Method overloading resolution (isMoreSpecific)
  # - Primitive type wrapping (wrap)
  # - Native array to List conversion (toList)
  #
  # Test Fixtures:
  # testCalculator - TestCalculator instance with methods:
  #   - Describe(Object), Describe(Number), Describe(Integer) for overload resolution
  #   - Various primitive parameter methods for wrap() coverage
  #
  # nativeIntArray - int[] { 10, 20, 30 }
  # nativeStringArray - String[] { "alpha", "beta", "gamma" }
  # integerValue - Integer object (42)
  # doubleValue - Double object (3.14)
  # ========== Method Overloading Resolution (isMoreSpecific) ==========

  Scenario: Call overloaded method - Integer picks more specific than Number
    Given I set "calc" to "{testCalculator}"
    When I call "{calc}" with "Describe" using argument "{integerValue}"
    Then "{result}" contains "integer"
  # ========== Primitive Type Wrapping (wrap) ==========
  # These tests verify that string arguments are correctly converted to primitive types

  Scenario: Call method with int primitive parameter
    Given I set "calc" to "{testCalculator}"
    When I call "{calc}" with "AddInt" using argument "8"
    Then "{result}" is "50"

  Scenario: Call method with long primitive parameter
    Given I set "calc" to "{testCalculator}"
    When I call "{calc}" with "AddLong" using argument "100"
    Then "{result}" is "142"

  Scenario: Call method with boolean return from int primitive
    Given I set "calc" to "{testCalculator}"
    When I call "{calc}" with "IsPositive" using argument "5"
    Then "{result}" is true

  Scenario: Call method with short primitive parameter
    Given I set "calc" to "{testCalculator}"
    When I call "{calc}" with "AddShort" using argument "3"
    Then "{result}" is "45"

  Scenario: Call method with byte primitive parameter
    Given I set "calc" to "{testCalculator}"
    When I call "{calc}" with "AddByte" using argument "2"
    Then "{result}" is "44"

  Scenario: Call method with double primitive parameter
    Given I set "calc" to "{testCalculator}"
    When I call "{calc}" with "MultiplyByDouble" using argument "0.5"
    Then "{result}" is "21"

  Scenario: Call method with float primitive parameter
    Given I set "calc" to "{testCalculator}"
    When I call "{calc}" with "MultiplyByFloat" using argument "2.0"
    Then "{result}" is "84"

  Scenario: Call method with char primitive parameter
    Given I set "calc" to "{testCalculator}"
    When I call "{calc}" with "NextChar" using argument "A"
    Then "{result}" is "B"

  Scenario: Call method with boolean primitive parameter
    Given I set "calc" to "{testCalculator}"
    When I call "{calc}" with "IsEven" using argument "{true}"
    Then "{result}" is true
  # ========== Native Array Conversion (toList) ==========

  Scenario: Convert native int array to list and check length
    Given I set "arr" to "{nativeIntArray}"
    Then "{arr}" is an array of objects with length "3"

  Scenario: Convert native String array to list and check values
    Given I set "arr" to "{nativeStringArray}"
    Then "{arr}" is an array of strings with the following values
      | value |
      | alpha |
      | beta  |
      | gamma |

  Scenario: Null array returns empty list
    Given I set "nullArr" to "{null}"
    Then "{nullArr}" is empty
