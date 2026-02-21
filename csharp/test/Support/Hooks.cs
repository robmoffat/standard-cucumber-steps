using Reqnroll;
using StandardCucumberSteps.World;

namespace StandardCucumberSteps.Support;

[Binding]
public class Hooks
{
    private readonly PropsWorld _world;

    public Hooks(PropsWorld world)
    {
        _world = world;
    }

    [BeforeScenario]
    public void BeforeScenario()
    {
        // Setup test fixtures
        _world.Set("sampleArray", new List<object?>
        {
            new Dictionary<string, object?> { ["name"] = "Alice", ["value"] = 100 },
            new Dictionary<string, object?> { ["name"] = "Bob", ["value"] = 200 }
        });

        _world.Set("sampleStringArray", new List<object?> { "one", "two", "three" });
        _world.Set("sampleEmptyArray", new List<object?>());
        _world.Set("sampleObject", new Dictionary<string, object?> { ["name"] = "John", ["age"] = 30 });

        // Functions with parameters
        _world.Set("singleArgFn", (Func<object?, Task<object?>>)(arg => Task.FromResult(arg)));
        _world.Set("twoArgFn", (Func<object?, object?, Task<object?>>)((a, b) => 
            Task.FromResult<object?>($"{a}{b}")));
        _world.Set("threeArgConcatFn", (Func<object?, object?, object?, Task<object?>>)((a, b, c) => 
            Task.FromResult<object?>($"{a}{b}{c}")));
        _world.Set("fourArgConcatFn", (Func<object?, object?, object?, object?, Task<object?>>)((a, b, c, d) => 
            Task.FromResult<object?>($"{a}{b}{c}{d}")));

        // Error throwing functions
        _world.Set("errorThrowingFn", (Func<Task<object?>>)(() =>
            throw new InvalidOperationException("Test error message")));
        _world.Set("errorWithArgFn", (Func<object?, Task<object?>>)(arg =>
            throw new InvalidOperationException("Test error message")));
        _world.Set("errorWith2ArgsFn", (Func<object?, object?, Task<object?>>)((a, b) =>
            throw new InvalidOperationException("Test error message")));
        _world.Set("errorWith3ArgsFn", (Func<object?, object?, object?, Task<object?>>)((a, b, c) =>
            throw new InvalidOperationException("Test error message")));
        _world.Set("errorWith4ArgsFn", (Func<object?, object?, object?, object?, Task<object?>>)((a, b, c, d) =>
            throw new InvalidOperationException("Test error message")));

        // Test calculator
        _world.Set("testCalculator", new TestCalculator());

        // Nested objects for JSONPath tests
        _world.Set("nestedObject", new Dictionary<string, object?>
        {
            ["name"] = "parent",
            ["level1"] = new Dictionary<string, object?>
            {
                ["level2"] = "deep-value"
            }
        });

        _world.Set("arrayWithObjects", new List<object?>
        {
            new Dictionary<string, object?> { ["id"] = "1", ["name"] = "first" },
            new Dictionary<string, object?> { ["id"] = "2", ["name"] = "second" },
            new Dictionary<string, object?> { ["id"] = "3", ["name"] = "third" }
        });

        _world.Set("deeplyNested", new Dictionary<string, object?>
        {
            ["a"] = new Dictionary<string, object?>
            {
                ["b"] = new Dictionary<string, object?>
                {
                    ["c"] = new Dictionary<string, object?>
                    {
                        ["d"] = "found"
                    }
                }
            }
        });

        _world.Set("userArray", new List<object?>
        {
            new Dictionary<string, object?> 
            { 
                ["name"] = "Alice", 
                ["address"] = new Dictionary<string, object?> { ["city"] = "New York", ["zip"] = "10001" } 
            },
            new Dictionary<string, object?> 
            { 
                ["name"] = "Bob", 
                ["address"] = new Dictionary<string, object?> { ["city"] = "Los Angeles", ["zip"] = "90001" } 
            }
        });
    }

    public class TestCalculator
    {
        private readonly int _value = 42;

        public int GetValue() => _value;
        public int Add(int n) => _value + n;
        public int Multiply(int a, int b) => a * b;
        public int Sum3(int a, int b, int c) => a + b + c;
        public int Sum4(int a, int b, int c, int d) => a + b + c + d;
    }
}
