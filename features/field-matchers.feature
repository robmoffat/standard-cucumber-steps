Feature: Pluggable field matchers

  Scenario: Suffix matcher on nested field with standard equality column
    Given I set "record" to "{contactRecord}"
    Then "{record}" is an object with the following contents
      | user.email_regex | id |
      | alice@example\.com | 1  |

  Scenario: Suffix matcher on top-level field
    Given I set "record" to "{contactRecord}"
    Then "{record}" is an object with the following contents
      | id_regex |
      | ^1$      |

  Scenario: Mixed matcher column and normal JSONPath column in one row
    Given I set "record" to "{contactRecord}"
    Then "{record}" is an object with the following contents
      | user.role |
      | admin     |

  Scenario: Array assertion delegates to registered matcher
    Given I set "records" to "{contactRecordList}"
    Then "{records}" is an array of objects with at least the following contents
      | user.email_regex |
      | bob@example\.com |

  Scenario: at-least match finds row via matcher when literal equality would fail
    Given I set "records" to "{contactRecordList}"
    Then "{records}" is an array of objects with at least the following contents
      | user.email_regex |
      | .*@example\.com   |
