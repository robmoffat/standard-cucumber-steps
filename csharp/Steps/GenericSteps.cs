using System.Reflection;
using Newtonsoft.Json;
using NUnit.Framework;
using Reqnroll;
using StandardCucumberSteps.Support;
using StandardCucumberSteps.World;

namespace StandardCucumberSteps.Steps;

[Binding]
public class GenericSteps
{
    private readonly PropsWorld _world;

    public GenericSteps(PropsWorld world)
    {
        _world = world;
    }

    // ========== Promise Resolution Steps ==========

    [When("the promise {string} should resolve")]
    [Then("the promise {string} should resolve")]
    public async Task ThePromiseShouldResolve(string field)
    {
        try
        {
            var promise = MatchingUtils.HandleResolve(field, _world);
            var result = await ResolveAsync(promise);
            _world.Set("result", result);
        }
        catch (Exception e)
        {
            _world.Set("result", e);
        }
    }

    [When("the promise {string} should resolve within 10 seconds")]
    [Then("the promise {string} should resolve within 10 seconds")]
    public async Task ThePromiseShouldResolveWithin10Seconds(string field)
    {
        try
        {
            var promise = MatchingUtils.HandleResolve(field, _world);
            var cts = new CancellationTokenSource(TimeSpan.FromSeconds(10));
            var result = await ResolveAsync(promise).WaitAsync(cts.Token);
            _world.Set("result", result);
        }
        catch (Exception e)
        {
            _world.Set("result", e);
        }
    }

    // ========== Method Invocation (Object.method) Steps ==========

    [When("I call {string} with {string}")]
    public async Task ICallWith(string field, string methodName)
    {
        try
        {
            var obj = MatchingUtils.HandleResolve(field, _world);
            var result = await InvokeMethod(obj!, methodName);
            _world.Set("result", result);
        }
        catch (Exception e)
        {
            _world.Set("result", e);
        }
    }

    [When("I call {string} with {string} using argument {string}")]
    public async Task ICallWithParameter(string field, string methodName, string param)
    {
        try
        {
            var obj = MatchingUtils.HandleResolve(field, _world);
            var p = MatchingUtils.HandleResolve(param, _world);
            var result = await InvokeMethod(obj!, methodName, p);
            _world.Set("result", result);
        }
        catch (Exception e)
        {
            _world.Set("result", e);
        }
    }

    [When("I call {string} with {string} using arguments {string} and {string}")]
    public async Task ICallWithTwoParameters(string field, string methodName, string param1, string param2)
    {
        try
        {
            var obj = MatchingUtils.HandleResolve(field, _world);
            var result = await InvokeMethod(obj!, methodName,
                MatchingUtils.HandleResolve(param1, _world),
                MatchingUtils.HandleResolve(param2, _world));
            _world.Set("result", result);
        }
        catch (Exception e)
        {
            _world.Set("result", e);
        }
    }

    [When("I call {string} with {string} using arguments {string}, {string}, and {string}")]
    public async Task ICallWithThreeParameters(string field, string methodName, string param1, string param2, string param3)
    {
        try
        {
            var obj = MatchingUtils.HandleResolve(field, _world);
            var result = await InvokeMethod(obj!, methodName,
                MatchingUtils.HandleResolve(param1, _world),
                MatchingUtils.HandleResolve(param2, _world),
                MatchingUtils.HandleResolve(param3, _world));
            _world.Set("result", result);
        }
        catch (Exception e)
        {
            _world.Set("result", e);
        }
    }

    // ========== Direct Function Call Steps ==========

    [When("I call {string}")]
    public async Task ICallFunction(string fnName)
    {
        try
        {
            var fn = MatchingUtils.HandleResolve(fnName, _world);
            var result = await CallFunctional(fn);
            _world.Set("result", result);
        }
        catch (Exception e)
        {
            _world.Set("result", e);
        }
    }

    [When("I call {string} using argument {string}")]
    public async Task ICallFunctionWithParameter(string fnName, string param)
    {
        try
        {
            var fn = MatchingUtils.HandleResolve(fnName, _world);
            var p = MatchingUtils.HandleResolve(param, _world);
            var result = await CallFunctionalWithArgs(fn, p);
            _world.Set("result", result);
        }
        catch (Exception e)
        {
            _world.Set("result", e);
        }
    }

    [When("I call {string} using arguments {string} and {string}")]
    public async Task ICallFunctionWithTwoParameters(string fnName, string param1, string param2)
    {
        try
        {
            var fn = MatchingUtils.HandleResolve(fnName, _world);
            var result = await CallFunctionalWithArgs(fn,
                MatchingUtils.HandleResolve(param1, _world),
                MatchingUtils.HandleResolve(param2, _world));
            _world.Set("result", result);
        }
        catch (Exception e)
        {
            _world.Set("result", e);
        }
    }

    [When("I call {string} using arguments {string}, {string}, and {string}")]
    public async Task ICallFunctionWithThreeParameters(string fnName, string param1, string param2, string param3)
    {
        try
        {
            var fn = MatchingUtils.HandleResolve(fnName, _world);
            var result = await CallFunctionalWithArgs(fn,
                MatchingUtils.HandleResolve(param1, _world),
                MatchingUtils.HandleResolve(param2, _world),
                MatchingUtils.HandleResolve(param3, _world));
            _world.Set("result", result);
        }
        catch (Exception e)
        {
            _world.Set("result", e);
        }
    }

    // ========== Variable Reference ==========

    [When("I refer to {string} as {string}")]
    public void IReferToAs(string from, string to)
    {
        _world.Set(to, MatchingUtils.HandleResolve(from, _world));
    }

    // ========== Array/Object Assertions ==========

    [Then("{string} is an array of objects with the following contents")]
    public void IsAnArrayOfObjectsWithContents(string field, DataTable dt)
    {
        var data = ToList(MatchingUtils.HandleResolve(field, _world));
        MatchingUtils.MatchData(_world, data, dt);
    }

    [Then("{string} is an array of objects with at least the following contents")]
    public void IsAnArrayOfObjectsWithAtLeastContents(string field, DataTable dt)
    {
        var data = ToList(MatchingUtils.HandleResolve(field, _world));
        MatchingUtils.MatchDataAtLeast(_world, data, dt);
    }

    [Then("{string} is an array of objects which doesn't contain any of")]
    public void IsAnArrayOfObjectsWhichDoesntContainAnyOf(string field, DataTable dt)
    {
        var data = ToList(MatchingUtils.HandleResolve(field, _world));
        MatchingUtils.MatchDataDoesntContain(_world, data, dt);
    }

    [Then("{string} is an array of objects with length {string}")]
    public void IsAnArrayOfObjectsWithLength(string field, string lengthField)
    {
        var data = ToList(MatchingUtils.HandleResolve(field, _world));
        var expected = int.Parse(MatchingUtils.HandleResolve(lengthField, _world)?.ToString() ?? "0");
        Assert.That(data.Count, Is.EqualTo(expected));
    }

    [Then("{string} is an array of strings with the following values")]
    public void IsAnArrayOfStringsWithValues(string field, DataTable dt)
    {
        var data = ToList(MatchingUtils.HandleResolve(field, _world))
            .Select(s => (object?)new Dictionary<string, object?> { ["value"] = s })
            .ToList();
        MatchingUtils.MatchData(_world, data, dt);
    }

    [Then("{string} is an object with the following contents")]
    public void IsAnObjectWithContents(string field, DataTable dt)
    {
        var data = MatchingUtils.HandleResolve(field, _world);
        var row = dt.CreateSet<Dictionary<string, string>>().First();
        Assert.That(MatchingUtils.DoesRowMatch(_world, row, data), Is.True);
    }

    // ========== Value Assertions ==========

    [Then("{string} is null")]
    public void IsNull(string field) =>
        Assert.That(MatchingUtils.HandleResolve(field, _world), Is.Null);

    [Then("{string} is not null")]
    public void IsNotNull(string field) =>
        Assert.That(MatchingUtils.HandleResolve(field, _world), Is.Not.Null);

    [Then("{string} is true")]
    public void IsTrue(string field) =>
        Assert.That(IsTruthy(MatchingUtils.HandleResolve(field, _world)), Is.True);

    [Then("{string} is false")]
    public void IsFalse(string field) =>
        Assert.That(IsTruthy(MatchingUtils.HandleResolve(field, _world)), Is.False);

    [Then("{string} is undefined")]
    public void IsUndefined(string field) =>
        Assert.That(MatchingUtils.HandleResolve(field, _world), Is.Null);

    [Then("{string} is empty")]
    public void IsEmpty(string field)
    {
        var val = MatchingUtils.HandleResolve(field, _world);
        var list = ToList(val);
        Assert.That(list, Is.Empty);
    }

    [Then("{string} is {string}")]
    public void FieldIs(string field, string expected)
    {
        var actual = MatchingUtils.HandleResolve(field, _world)?.ToString();
        var expectedVal = MatchingUtils.HandleResolve(expected, _world)?.ToString();
        Assert.That(actual, Is.EqualTo(expectedVal));
    }

    // ========== Error Assertions ==========

    [Then("{string} is an error with message {string}")]
    public void IsAnErrorWithMessage(string field, string message)
    {
        var val = MatchingUtils.HandleResolve(field, _world);
        Assert.That(val, Is.InstanceOf<Exception>());
        Assert.That(((Exception)val!).Message, Is.EqualTo(message));
    }

    [Then("{string} is an error")]
    public void IsAnError(string field) =>
        Assert.That(MatchingUtils.HandleResolve(field, _world), Is.InstanceOf<Exception>());

    [Then("{string} is not an error")]
    public void IsNotAnError(string field) =>
        Assert.That(MatchingUtils.HandleResolve(field, _world), Is.Not.InstanceOf<Exception>());

    [Then("{string} contains {string}")]
    public void Contains(string field, string substring)
    {
        var actual = MatchingUtils.HandleResolve(field, _world)?.ToString() ?? "";
        Assert.That(actual, Does.Contain(substring));
    }

    [Then("{string} is a string containing one of")]
    public void IsAStringContainingOneOf(string field, DataTable dt)
    {
        var actual = MatchingUtils.HandleResolve(field, _world)?.ToString() ?? "";
        var values = dt.Rows.Select(r => r[0]).ToList();
        Assert.That(values.Any(v => actual.Contains(v)), Is.True,
            $"Expected '{actual}' to contain one of: [{string.Join(", ", values)}]");
    }

    [Then("{string} should be greater than {string}")]
    public void ShouldBeGreaterThan(string field, string threshold)
    {
        var actual = Convert.ToDouble(MatchingUtils.HandleResolve(field, _world));
        var thresh = Convert.ToDouble(MatchingUtils.HandleResolve(threshold, _world));
        Assert.That(actual, Is.GreaterThan(thresh));
    }

    [Then("{string} should be less than {string}")]
    public void ShouldBeLessThan(string field, string threshold)
    {
        var actual = Convert.ToDouble(MatchingUtils.HandleResolve(field, _world));
        var thresh = Convert.ToDouble(MatchingUtils.HandleResolve(threshold, _world));
        Assert.That(actual, Is.LessThan(thresh));
    }

    // ========== Test Setup ==========

    [Given("{string} is a invocation counter into {string}")]
    public void IsAnInvocationCounter(string handlerName, string counterField)
    {
        _world.Set(counterField, 0);
        _world.Set(handlerName, (Action)(() =>
        {
            var count = Convert.ToInt32(_world.Get(counterField));
            _world.Set(counterField, count + 1);
        }));
    }

    [Given("{string} is an async function returning {string}")]
    public void IsAnAsyncFunctionReturning(string fnName, string valueField)
    {
        var value = MatchingUtils.HandleResolve(valueField, _world);
        _world.Set(fnName, (Func<Task<object?>>)(() => Task.FromResult(value)));
    }

    [Given("{string} is an async function returning {string} after {string} ms")]
    public void IsAnAsyncFunctionReturningAfterDelay(string fnName, string valueField, string delayMs)
    {
        var value = MatchingUtils.HandleResolve(valueField, _world);
        var delay = int.Parse(delayMs);
        _world.Set(fnName, (Func<Task<object?>>)(async () =>
        {
            await Task.Delay(delay);
            return value;
        }));
    }

    [Given("I set {string} to {string}")]
    public void ISetFieldTo(string field, string value)
    {
        _world.Set(field, MatchingUtils.HandleResolve(value, _world));
    }

    [Given("we wait for a period of {string} ms")]
    public async Task WeWaitForPeriod(string ms)
    {
        await Task.Delay(int.Parse(ms));
    }

    // ========== Async Task Steps ==========

    [When("I start task {string} by calling {string}")]
    public void StartTask(string taskName, string fnName)
    {
        var fn = MatchingUtils.HandleResolve(fnName, _world);
        var task = Task.Run(async () => await CallFunctional(fn));
        _world.Tasks[taskName] = task;
    }

    [When("I start task {string} by calling {string} with parameter {string}")]
    public void StartTaskWithParam(string taskName, string fnName, string param)
    {
        var fn = MatchingUtils.HandleResolve(fnName, _world);
        var p = MatchingUtils.HandleResolve(param, _world);
        var task = Task.Run(async () => await CallFunctionalWithArgs(fn, p));
        _world.Tasks[taskName] = task;
    }

    [When("I start task {string} by calling {string} with parameters {string} and {string}")]
    public void StartTaskWithTwoParams(string taskName, string fnName, string param1, string param2)
    {
        var fn = MatchingUtils.HandleResolve(fnName, _world);
        var p1 = MatchingUtils.HandleResolve(param1, _world);
        var p2 = MatchingUtils.HandleResolve(param2, _world);
        var task = Task.Run(async () => await CallFunctionalWithArgs(fn, p1, p2));
        _world.Tasks[taskName] = task;
    }

    [When("I wait for task {string} to complete")]
    [Then("I wait for task {string} to complete")]
    public async Task WaitForTask(string taskName)
    {
        try
        {
            var result = await _world.Tasks[taskName].WaitAsync(TimeSpan.FromSeconds(30));
            _world.Set("result", result);
            _world.Set(taskName, result);
        }
        catch (Exception e)
        {
            _world.Set("result", e);
            _world.Set(taskName, e);
        }
    }

    [When("I wait for task {string} to complete within {string} ms")]
    [Then("I wait for task {string} to complete within {string} ms")]
    public async Task WaitForTaskWithTimeout(string taskName, string timeoutMs)
    {
        try
        {
            var ms = int.Parse(timeoutMs);
            var result = await _world.Tasks[taskName].WaitAsync(TimeSpan.FromMilliseconds(ms));
            _world.Set("result", result);
            _world.Set(taskName, result);
        }
        catch (Exception e)
        {
            _world.Set("result", e);
            _world.Set(taskName, e);
        }
    }

    [When("I wait for {string}")]
    public async Task IWaitFor(string fnName)
    {
        try
        {
            var fn = MatchingUtils.HandleResolve(fnName, _world);
            var result = await CallFunctional(fn);
            _world.Set("result", result);
        }
        catch (Exception e)
        {
            _world.Set("result", e);
        }
    }

    [When("I wait for {string} using argument {string}")]
    public async Task IWaitForWithParam(string fnName, string param)
    {
        try
        {
            var fn = MatchingUtils.HandleResolve(fnName, _world);
            var result = await CallFunctionalWithArgs(fn, MatchingUtils.HandleResolve(param, _world));
            _world.Set("result", result);
        }
        catch (Exception e)
        {
            _world.Set("result", e);
        }
    }

    [When("I wait for {string} using arguments {string} and {string}")]
    public async Task IWaitForWithTwoParams(string fnName, string param1, string param2)
    {
        try
        {
            var fn = MatchingUtils.HandleResolve(fnName, _world);
            var result = await CallFunctionalWithArgs(fn,
                MatchingUtils.HandleResolve(param1, _world),
                MatchingUtils.HandleResolve(param2, _world));
            _world.Set("result", result);
        }
        catch (Exception e)
        {
            _world.Set("result", e);
        }
    }

    // ========== Helpers ==========

    private static async Task<object?> ResolveAsync(object? value)
    {
        if (value is Task<object?> taskOfObj) return await taskOfObj;
        if (value is Task task) { await task; return null; }
        if (value is Func<Task<object?>> asyncFn) return await asyncFn();
        if (value is Func<object?> syncFn) return syncFn();
        return value;
    }

    private async Task<object?> CallFunctional(object? fn)
    {
        if (fn is Action action) { action(); return null; }
        if (fn is Func<object?> func) return func();
        if (fn is Func<Task<object?>> asyncFunc) return await asyncFunc();
        if (fn is Func<Task> asyncAction) { await asyncAction(); return null; }
        throw new InvalidOperationException($"Not a callable: {fn?.GetType().Name ?? "null"}");
    }

    private async Task<object?> CallFunctionalWithArgs(object? fn, params object?[] args)
    {
        if (fn == null) throw new InvalidOperationException("Function is null");

        // Try Invoke via reflection
        var type = fn.GetType();
        var invokeMethod = type.GetMethod("Invoke");
        if (invokeMethod != null)
        {
            var result = invokeMethod.Invoke(fn, args);
            if (result is Task<object?> t) return await t;
            if (result is Task task) { await task; return null; }
            return result;
        }
        throw new InvalidOperationException($"Cannot call {type.Name} with {args.Length} args");
    }

    private static async Task<object?> InvokeMethod(object target, string methodName, params object?[] args)
    {
        var method = FindMethod(target.GetType(), methodName, args);
        if (method == null) throw new MissingMethodException($"Method not found: {methodName}");
        var result = method.Invoke(target, args);
        if (result is Task<object?> t) return await t;
        if (result is Task task) { await task; return null; }
        return result;
    }

    private static MethodInfo? FindMethod(Type type, string name, object?[] args)
    {
        return type.GetMethods()
            .Where(m => m.Name == name && m.GetParameters().Length == args.Length)
            .FirstOrDefault();
    }

    private static bool IsTruthy(object? value) => value switch
    {
        null => false,
        bool b => b,
        int i => i != 0,
        long l => l != 0,
        double d => d != 0,
        string s when s.Length == 0 => false,
        string s when double.TryParse(s, out var n) => n != 0,
        string s => !s.Equals("false", StringComparison.OrdinalIgnoreCase)
                    && !s.Equals("null", StringComparison.OrdinalIgnoreCase),
        _ => true
    };

    private static List<object?> ToList(object? value)
    {
        if (value is IEnumerable<object?> enumerable)
            return enumerable.ToList();
        if (value is System.Collections.IEnumerable collection)
            return collection.Cast<object?>().ToList();
        return new List<object?>();
    }
}
