using Reqnroll;
using StandardCucumberSteps.Support;
using StandardCucumberSteps.World;

namespace StandardCucumberSteps.Steps;

/// <summary>
/// Step definitions that exist solely to exercise C#-specific code paths in GenericSteps
/// (the generic Delegate fallback in CallFunctional, and the sync/generic-Task return
/// paths in CallFunctionalWithArgs).  These steps are not part of the standard shared
/// step library — they live here so GenericSteps.cs stays clean.
/// </summary>
[Binding]
public class CSharpSpecificSteps
{
    private readonly PropsWorld _world;

    public CSharpSpecificSteps(PropsWorld world)
    {
        _world = world;
    }

    [Given("{string} is a typed sync function returning {string}")]
    public void IsATypedSyncFunctionReturning(string fnName, string value)
    {
        var resolved = MatchingUtils.HandleResolve(value, _world)?.ToString() ?? "";
        _world.Set(fnName, (Func<string>)(() => resolved));
    }

    [Given("{string} is a typed async function returning {string}")]
    public void IsATypedAsyncFunctionReturning(string fnName, string value)
    {
        var resolved = MatchingUtils.HandleResolve(value, _world)?.ToString() ?? "";
        _world.Set(fnName, (Func<Task<string>>)(() => Task.FromResult(resolved)));
    }

    [Given("{string} is a typed sync function echoing its argument")]
    public void IsATypedSyncFunctionEchoing(string fnName)
    {
        _world.Set(fnName, (Func<object?, string>)(arg => arg?.ToString() ?? ""));
    }

    [Given("{string} is a typed async function echoing its argument")]
    public void IsATypedAsyncFunctionEchoing(string fnName)
    {
        _world.Set(fnName, (Func<object?, Task<string>>)(arg => Task.FromResult(arg?.ToString() ?? "")));
    }
}
