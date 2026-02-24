package io.github.robmoffat;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.function.Supplier;

import io.github.robmoffat.steps.GenericSteps.FourArgFunction;
import io.github.robmoffat.steps.GenericSteps.ThreeArgFunction;
import io.github.robmoffat.world.PropsWorld;

import io.cucumber.java.Before;
import io.cucumber.java.Scenario;

/**
 * Test-only hooks and fixtures. Not part of the published library.
 */
public class TestHooks {

    private final PropsWorld world;

    public TestHooks(PropsWorld world) {
        this.world = world;
    }

    @Before
    public void setup(Scenario scenario) {
        world.setScenario(scenario);

        // Shared fixtures for feature files
        world.set("sampleArray", Arrays.asList(
            Map.of("name", "Alice", "value", 100),
            Map.of("name", "Bob", "value", 200)
        ));
        world.set("sampleStringArray", Arrays.asList("one", "two", "three"));
        world.set("sampleEmptyArray", Collections.emptyList());
        world.set("sampleObject", Map.of("name", "John", "age", 30));

        world.set("singleArgFn", (Function<Object, CompletableFuture<Object>>)
            arg -> CompletableFuture.completedFuture(arg));
        world.set("twoArgFn", (BiFunction<Object, Object, CompletableFuture<Object>>)
            (a, b) -> CompletableFuture.completedFuture(String.valueOf(a) + String.valueOf(b)));
        world.set("threeArgConcatFn", (ThreeArgFunction)
            (a, b, c) -> CompletableFuture.completedFuture(String.valueOf(a) + String.valueOf(b) + String.valueOf(c)));
        world.set("fourArgConcatFn", (FourArgFunction)
            (a, b, c, d) -> CompletableFuture.completedFuture(String.valueOf(a) + String.valueOf(b) + String.valueOf(c) + String.valueOf(d)));

        world.set("errorThrowingFn", (Supplier<CompletableFuture<Object>>) () -> {
            throw new RuntimeException("Test error message");
        });
        world.set("errorWithArgFn", (Function<Object, CompletableFuture<Object>>)
            arg -> { throw new RuntimeException("Test error message"); });
        world.set("errorWith2ArgsFn", (BiFunction<Object, Object, CompletableFuture<Object>>)
            (a, b) -> { throw new RuntimeException("Test error message"); });
        world.set("errorWith3ArgsFn", (ThreeArgFunction)
            (a, b, c) -> { throw new RuntimeException("Test error message"); });
        world.set("errorWith4ArgsFn", (FourArgFunction)
            (a, b, c, d) -> { throw new RuntimeException("Test error message"); });

        world.set("testCalculator", new TestCalculator());

        Map<String, Object> level1 = new HashMap<>();
        level1.put("level2", "deep-value");
        Map<String, Object> nestedObject = new HashMap<>();
        nestedObject.put("name", "parent");
        nestedObject.put("level1", level1);
        world.set("nestedObject", nestedObject);

        world.set("arrayWithObjects", Arrays.asList(
            Map.of("id", "1", "name", "first"),
            Map.of("id", "2", "name", "second"),
            Map.of("id", "3", "name", "third")
        ));

        Map<String, Object> d = Map.of("d", "found");
        Map<String, Object> c = Map.of("c", d);
        Map<String, Object> b = Map.of("b", c);
        Map<String, Object> a = Map.of("a", b);
        world.set("deeplyNested", a);

        world.set("userArray", Arrays.asList(
            Map.of("name", "Alice", "address", Map.of("city", "New York", "zip", "10001")),
            Map.of("name", "Bob", "address", Map.of("city", "Los Angeles", "zip", "90001"))
        ));

        Map<String, Object> typedValues = new HashMap<>();
        typedValues.put("count", 42);
        typedValues.put("price", 9.99);
        typedValues.put("active", true);
        typedValues.put("deleted", false);
        typedValues.put("label", "hello");
        typedValues.put("nested", Map.of("score", 100, "enabled", true));
        world.set("typedValues", typedValues);

        // Java-specific fixtures for java-specific.feature
        world.set("nativeIntArray", new int[] { 10, 20, 30 });
        world.set("nativeStringArray", new String[] { "alpha", "beta", "gamma" });
        world.set("integerValue", Integer.valueOf(42));
        world.set("doubleValue", Double.valueOf(3.14));
    }

    public static class TestCalculator {
        private int value = 42;
        public int GetValue() { return value; }
        public int Add(Number n) { return value + n.intValue(); }
        public int Multiply(Number a, Number b) { return a.intValue() * b.intValue(); }
        public int Sum3(Number a, Number b, Number c) { return a.intValue() + b.intValue() + c.intValue(); }
        public int Sum4(Number a, Number b, Number c, Number d) { return a.intValue() + b.intValue() + c.intValue() + d.intValue(); }
        public String Describe(Object o) { return "object:" + o; }
        public String Describe(Number n) { return "number:" + n; }
        public String Describe(Integer i) { return "integer:" + i; }
        public int AddInt(int n) { return value + n; }
        public long AddLong(long n) { return value + n; }
        public boolean IsPositive(int n) { return n > 0; }
        public short AddShort(short n) { return (short)(value + n); }
        public byte AddByte(byte n) { return (byte)(value + n); }
        public double MultiplyByDouble(double n) { return value * n; }
        public float MultiplyByFloat(float n) { return value * n; }
        public char NextChar(char c) { return (char)(c + 1); }
        public boolean IsEven(boolean flag) { return flag && (value % 2 == 0); }
    }
}
