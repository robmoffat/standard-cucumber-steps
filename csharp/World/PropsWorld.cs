using System.Collections.Concurrent;

namespace StandardCucumberSteps.World;

public class PropsWorld
{
    public Dictionary<string, object?> Props { get; } = new();
    public ConcurrentDictionary<string, Task<object?>> Tasks { get; } = new();

    public object? Get(string key) => Props.TryGetValue(key, out var v) ? v : null;

    public void Set(string key, object? value) => Props[key] = value;

    public bool Has(string key) => Props.ContainsKey(key);

    public void Log(string message) => Console.WriteLine(message);
}
