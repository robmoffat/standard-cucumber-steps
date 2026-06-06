Feature: Numeric equality in object assertions
  # Placeholders like {1234} and {9.99} resolve to numbers. Implementations MUST compare
  # numeric values with loose equality so integer storage matches float placeholders (e.g. 42 vs 42.0).

  Scenario: Integer fields match integer placeholders
    Given I set "record" to "{numericRecord}"
    Then "{record}" is an object with the following contents
      | integers.first | integers.second | label  |
      | {1234}         | {2345}          | item-1 |

  Scenario: Float field matches float placeholder
    Given I set "record" to "{numericRecord}"
    Then "{record}" is an object with the following contents
      | floats.ratio | label  |
      | {9.99}       | item-1 |

  Scenario: Whole-number double matches integer placeholder
    Given I set "record" to "{numericRecord}"
    Then "{record}" is an object with the following contents
      | floats.whole | label  |
      | {42}         | item-1 |

  Scenario: Mixed integer and float placeholders on one row
    Given I set "record" to "{typedValues}"
    Then "{record}" is an object with the following contents
      | count | price  | nested.score |
      | {42}  | {9.99} | {100}        |

  Scenario: Array row with numeric placeholder
    Given I set "items" to "{numericArray}"
    Then "{items}" is an array of objects with the following contents
      | id | amount |
      |  1 | {100}  |
      |  2 | {9.99} |
