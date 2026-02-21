Feature: C#-specific delegate type handling
  # These scenarios exercise internal C# code paths that cannot be reached via the shared
  # feature files, specifically the generic Delegate fallback in CallFunctional and the
  # sync/generic-Task return paths in CallFunctionalWithArgs.
  #
  # Typed delegates (e.g. Func<string>, Func<Task<string>>) are used deliberately here
  # rather than Func<Task<object?>> so they bypass the fast-path type checks and fall
  # through to the DynamicInvoke / reflection branches.

  Scenario: Call a sync Func<string> via the Delegate fallback
    # Func<string> is not covariant to Func<object?> so CallFunctional reaches
    # the generic Delegate branch and returns the value directly via DynamicInvoke
    Given "fn" is a typed sync function returning "sync-value"
    When I wait for "{fn}"
    Then "{result}" is "sync-value"

  Scenario: Call a Func<Task<string>> via the generic Task branch
    # Func<Task<string>> is not Func<Task<object?>> so CallFunctional reaches the
    # generic Task branch and extracts the result via reflection on Task<T>.Result
    Given "fn" is a typed async function returning "typed-async-value"
    When I wait for "{fn}"
    Then "{result}" is "typed-async-value"

  Scenario: Call a sync Func<object?,string> via CallFunctionalWithArgs sync return
    # Func<object?,string>.Invoke returns a plain string, not a Task, so
    # CallFunctionalWithArgs hits the plain "return result" branch
    Given "fn" is a typed sync function echoing its argument
    When I wait for "{fn}" using argument "hello"
    Then "{result}" is "hello"

  Scenario: Call a Func<object?,Task<string>> via CallFunctionalWithArgs generic Task branch
    # Func<object?,Task<string>>.Invoke returns Task<string> which is a Task but not
    # Task<object?>, so CallFunctionalWithArgs hits the generic Task branch with reflection
    Given "fn" is a typed async function echoing its argument
    When I wait for "{fn}" using argument "world"
    Then "{result}" is "world"
