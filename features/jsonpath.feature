Feature: JSONPath variable resolution
  Tests for accessing nested properties using JSONPath expressions.
  
  Test fixtures used in these scenarios:
  
  nestedObject:
    { name: "parent", level1: { level2: "deep-value" } }
  
  arrayWithObjects:
    [ { id: "1", name: "first" }, { id: "2", name: "second" }, { id: "3", name: "third" } ]
  
  deeplyNested:
    { a: { b: { c: { d: "found" } } } }
  
  userArray:
    [ { name: "Alice", address: { city: "New York", zip: "10001" } },
      { name: "Bob", address: { city: "Los Angeles", zip: "90001" } } ]
  # Simple nested property access using dot notation

  Scenario: Access nested property with dot notation
    Given I set "nested" to "{nestedObject}"
    Then "{nested.level1.level2}" is "deep-value"

  Scenario: Access top-level property of nested object
    Given I set "nested" to "{nestedObject}"
    Then "{nested.name}" is "parent"
  # Array element access using bracket notation [index]

  Scenario: Access array element by index
    Given I set "arr" to "{arrayWithObjects}"
    Then "{arr[0].id}" is "1"

  Scenario: Access second array element
    Given I set "arr" to "{arrayWithObjects}"
    Then "{arr[1].id}" is "2"

  Scenario: Access last array element properties
    Given I set "arr" to "{arrayWithObjects}"
    Then "{arr[2].id}" is "3"
  # Deeply nested property access (4 levels deep)

  Scenario: Access deeply nested property
    Given I set "data" to "{deeplyNested}"
    Then "{data.a.b.c.d}" is "found"
  # Using JSONPath expressions in both sides of assertions

  Scenario: Compare nested values from two variables
    Given I set "obj1" to "{nestedObject}"
    And I set "obj2" to "{nestedObject}"
    Then "{obj1.level1.level2}" is "{obj2.level1.level2}"
  # Array assertions with nested property matching in table columns
  # Column headers like "address.city" use JSONPath to access nested fields

  Scenario: Array of objects assertion with nested access
    Given I set "users" to "{userArray}"
    Then "{users}" is an array of objects with the following contents
      | name  | address.city |
      | Alice | New York     |
      | Bob   | Los Angeles  |

  Scenario: Match at least with nested properties
    Given I set "users" to "{userArray}"
    Then "{users}" is an array of objects with at least the following contents
      | address.city |
      | New York     |
