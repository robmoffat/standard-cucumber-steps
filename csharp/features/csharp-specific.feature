Feature: C#-specific delegate type handling
  # These scenarios exercise internal C# code paths that cannot be reached via the shared
  # feature files, specifically the generic Delegate fallback in CallFunctional and the
  # sync/generic-Task return paths in CallFunctionalWithArgs.
  #
  # The fixtures used here are typed delegates (e.g. Func<string>, Func<Task<string>>)
  # that are deliberately NOT cast to Func<Task<object?>> so they bypass the fast-path
  # type checks and fall through to the DynamicInvoke / reflection branches.

  Scenario: Call a sync Func<string> via the Delegate fallback
    # syncReturnFn is stored as Func<string> — not covariant to Func<object?>
    # so CallFunctional hits the generic Delegate branch and returns the value directly
    Given I set "fn" to "{syncReturnFn}"
    When I wait for "{fn}"
    Then "{result}" is "sync-value"

  Scenario: Call a Func<Task<string>> via the generic Task branch
    # typedAsyncFn is stored as Func<Task<string>> — not Func<Task<object?>>
    # so CallFunctional hits the generic Task branch and extracts Result via reflection
    Given I set "fn" to "{typedAsyncFn}"
    When I wait for "{fn}"
    Then "{result}" is "typed-async-value"

  Scenario: Call a sync Func<object?,string> via CallFunctionalWithArgs sync return
    # syncArgFn is Func<object?,string> — its Invoke returns a plain string, not a Task
    # so CallFunctionalWithArgs hits the plain "return result" branch
    Given I set "fn" to "{syncArgFn}"
    When I wait for "{fn}" using argument "hello"
    Then "{result}" is "echo:hello"

  Scenario: Call a Func<object?,Task<string>> via CallFunctionalWithArgs generic Task branch
    # typedAsyncArgFn is Func<object?,Task<string>> — its Invoke returns Task<string>
    # which is a Task but not Task<object?>, hitting the generic Task branch with reflection
    Given I set "fn" to "{typedAsyncArgFn}"
    When I wait for "{fn}" using argument "world"
    Then "{result}" is "async:world"
