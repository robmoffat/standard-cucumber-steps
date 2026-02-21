package io.github.robmoffat.steps;

import static io.github.robmoffat.support.MatchingUtils.doesRowMatch;
import static io.github.robmoffat.support.MatchingUtils.handleResolve;
import static io.github.robmoffat.support.MatchingUtils.matchData;
import static io.github.robmoffat.support.MatchingUtils.matchDataAtLeast;
import static io.github.robmoffat.support.MatchingUtils.matchDataDoesntContain;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.lang.reflect.Array;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import io.github.robmoffat.world.PropsWorld;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.Before;
import io.cucumber.java.Scenario;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

/**
 * Generic Cucumber step definitions.
 */
public class GenericSteps {

    private final PropsWorld world;
    private final Map<String, CompletableFuture<Object>> tasks = new HashMap<>();

    public GenericSteps(PropsWorld world) {
        this.world = world;
    }

    @Before
    public void setup(Scenario scenario) {
        world.setScenario(scenario);
    }

    // ========== Promise Resolution Steps ==========

    @Then("the promise {string} should resolve")
    public void thePromiseShouldResolve(String field) {
        try {
            Object promise = handleResolve(field, world);
            Object result = resolvePromise(promise);
            world.set("result", result);
        } catch (Exception error) {
            world.set("result", error);
        }
    }

    @Then("the promise {string} should resolve within 10 seconds")
    public void thePromiseShouldResolveWithin10Seconds(String field) {
        try {
            Object promise = handleResolve(field, world);
            Object result = resolvePromiseWithTimeout(promise, 10, TimeUnit.SECONDS);
            world.set("result", result);
        } catch (Exception error) {
            world.set("result", error);
        }
    }

    // ========== Method Invocation (Object.method) Steps ==========

    @When("I call {string} with {string}")
    public void iCallWith(String field, String fnName) {
        try {
            Object object = handleResolve(field, world);
            Object result = invokeMethod(object, fnName);
            world.set("result", result);
        } catch (Exception error) {
            world.set("result", error);
        }
    }

    @When("I call {string} with {string} with parameter {string}")
    public void iCallWithParameter(String field, String fnName, String param) {
        try {
            Object object = handleResolve(field, world);
            Object paramValue = handleResolve(param, world);
            Object result = invokeMethod(object, fnName, paramValue);
            world.set("result", result);
        } catch (Exception error) {
            world.set("result", error);
        }
    }

    @When("I call {string} with {string} with parameters {string} and {string}")
    public void iCallWithTwoParameters(String field, String fnName, String param1, String param2) {
        try {
            Object object = handleResolve(field, world);
            Object result = invokeMethod(object, fnName, handleResolve(param1, world), handleResolve(param2, world));
            world.set("result", result);
        } catch (Exception error) {
            world.set("result", error);
        }
    }

    @When("I call {string} with {string} with parameters {string} and {string} and {string}")
    public void iCallWithThreeParameters(String field, String fnName, String param1, String param2, String param3) {
        try {
            Object object = handleResolve(field, world);
            Object result = invokeMethod(object, fnName,
                    handleResolve(param1, world), handleResolve(param2, world), handleResolve(param3, world));
            world.set("result", result);
        } catch (Exception error) {
            world.set("result", error);
        }
    }

    // ========== Direct Function Call Steps ==========

    @When("I call {string}")
    public void iCallFunction(String fnName) {
        try {
            Object fn = handleResolve(fnName, world);
            Object result = callFunctional(fn);
            world.set("result", result);
        } catch (Exception error) {
            world.set("result", error);
        }
    }

    @When("I call {string} with parameter {string}")
    public void iCallFunctionWithParameter(String fnName, String param) {
        try {
            Object fn = handleResolve(fnName, world);
            Object paramVal = handleResolve(param, world);
            Object result = callFunctionalWithArgs(fn, paramVal);
            world.set("result", result);
        } catch (Exception error) {
            world.set("result", error);
        }
    }

    @When("I call {string} with parameters {string} and {string}")
    public void iCallFunctionWithTwoParameters(String fnName, String param1, String param2) {
        try {
            Object fn = handleResolve(fnName, world);
            Object result = callFunctionalWithArgs(fn, handleResolve(param1, world), handleResolve(param2, world));
            world.set("result", result);
        } catch (Exception error) {
            world.set("result", error);
        }
    }

    @When("I call {string} with parameters {string} and {string} and {string}")
    public void iCallFunctionWithThreeParameters(String fnName, String param1, String param2, String param3) {
        try {
            Object fn = handleResolve(fnName, world);
            Object result = callFunctionalWithArgs(fn,
                    handleResolve(param1, world), handleResolve(param2, world), handleResolve(param3, world));
            world.set("result", result);
        } catch (Exception error) {
            world.set("result", error);
        }
    }

    // ========== Variable Reference ==========

    @When("I refer to {string} as {string}")
    public void iReferToAs(String from, String to) {
        world.set(to, handleResolve(from, world));
    }

    // ========== Array Matching Steps ==========

    @Then("{string} is an array of objects with the following contents")
    public void isAnArrayOfObjectsWithContents(String field, DataTable dt) {
        matchData(world, toList(handleResolve(field, world)), dt);
    }

    @Then("{string} is an array of objects with at least the following contents")
    public void isAnArrayOfObjectsWithAtLeastContents(String field, DataTable dt) {
        matchDataAtLeast(world, toList(handleResolve(field, world)), dt);
    }

    @Then("{string} is an array of objects which doesn't contain any of")
    public void isAnArrayOfObjectsWhichDoesntContainAnyOf(String field, DataTable dt) {
        matchDataDoesntContain(world, toList(handleResolve(field, world)), dt);
    }

    @Then("{string} is an array of objects with length {string}")
    public void isAnArrayOfObjectsWithLength(String field, String lengthField) {
        List<Object> data = toList(handleResolve(field, world));
        Object resolved = handleResolve(lengthField, world);
        assertEquals(Integer.parseInt(String.valueOf(resolved)), data.size());
    }

    @Then("{string} is an array of strings with the following values")
    public void isAnArrayOfStringsWithValues(String field, DataTable dt) {
        List<Object> data = toList(handleResolve(field, world));
        List<Map<String, Object>> values = data.stream()
                .map(s -> Map.<String, Object>of("value", s))
                .collect(Collectors.toList());
        matchData(world, values, dt);
    }

    @Then("{string} is an object with the following contents")
    public void isAnObjectWithContents(String field, DataTable params) {
        List<Map<String, String>> table = params.asMaps();
        Object data = handleResolve(field, world);
        assertTrue(doesRowMatch(world, table.get(0), data));
    }

    // ========== Value Assertions ==========

    @Then("{string} is null")
    public void isNull(String field) {
        assertNull(handleResolve(field, world));
    }

    @Then("{string} is not null")
    public void isNotNull(String field) {
        assertNotNull(handleResolve(field, world));
    }

    @Then("{string} is true")
    public void isTrue(String field) {
        assertTrue(isTruthy(handleResolve(field, world)));
    }

    @Then("{string} is false")
    public void isFalse(String field) {
        assertFalse(isTruthy(handleResolve(field, world)));
    }

    @Then("{string} is undefined")
    public void isUndefined(String field) {
        assertNull(handleResolve(field, world));
    }

    @Then("{string} is empty")
    public void isEmpty(String field) {
        List<?> data = (List<?>) handleResolve(field, world);
        assertTrue(data.isEmpty());
    }

    // Note: @Then("{string} is {string}") merged here — keywords are interchangeable in Cucumber-JVM

    // ========== Error Assertions ==========

    @Then("{string} is an error with message {string}")
    public void isAnErrorWithMessage(String field, String errorType) {
        Object value = handleResolve(field, world);
        assertTrue(value instanceof Throwable, "Expected a Throwable but got: " + value);
        Throwable t = (Throwable) value;
        String message = getRootCauseMessage(t);
        assertEquals(errorType, message);
    }

    @Then("{string} is an error")
    public void isAnError(String field) {
        assertTrue(handleResolve(field, world) instanceof Throwable);
    }

    @Then("{string} is not an error")
    public void isNotAnError(String field) {
        assertFalse(handleResolve(field, world) instanceof Throwable);
    }

    @Then("{string} contains {string}")
    public void contains(String field, String substring) {
        String actual = String.valueOf(handleResolve(field, world));
        assertTrue(actual.contains(substring), "Expected '" + actual + "' to contain '" + substring + "'");
    }

    @Then("{string} is a string containing one of")
    public void isAStringContainingOneOf(String field, DataTable dt) {
        String actual = String.valueOf(handleResolve(field, world));
        List<List<String>> rows = dt.cells();
        List<String> values = rows.stream().skip(1).map(r -> r.get(0)).collect(Collectors.toList());
        boolean found = values.stream().anyMatch(actual::contains);
        assertTrue(found, "Expected '" + actual + "' to contain one of: " + values);
    }

    @Then("{string} should be greater than {string}")
    public void shouldBeGreaterThan(String field, String threshold) {
        double actual = toDouble(handleResolve(field, world));
        double thresh = toDouble(handleResolve(threshold, world));
        assertTrue(actual > thresh, "Expected " + actual + " > " + thresh);
    }

    @Then("{string} should be less than {string}")
    public void shouldBeLessThan(String field, String threshold) {
        double actual = toDouble(handleResolve(field, world));
        double thresh = toDouble(handleResolve(threshold, world));
        assertTrue(actual < thresh, "Expected " + actual + " < " + thresh);
    }

    // ========== Test Setup ==========

    @Given("{string} is a invocation counter into {string}")
    public void isAnInvocationCounter(String handlerName, String counterField) {
        world.set(counterField, 0);
        world.set(handlerName, (Runnable) () -> {
            int amount = (Integer) world.get(counterField);
            world.set(counterField, amount + 1);
        });
    }

    @Given("{string} is a function which returns a promise of {string}")
    public void isAFunctionReturningPromise(String fnName, String valueField) {
        Object value = handleResolve(valueField, world);
        world.set(fnName, (Supplier<CompletableFuture<Object>>) () ->
                CompletableFuture.completedFuture(value));
    }

    @Given("{string} is {string}")
    public void fieldIs(String field, String value) {
        Object resolved = handleResolve(value, world);
        if (field.startsWith("{") && field.endsWith("}")) {
            // Assertion mode: Then "{count}" is "3"
            Object fieldValue = handleResolve(field, world);
            assertEquals(String.valueOf(resolved), String.valueOf(fieldValue));
        } else {
            // Setter mode: Given "greeting" is "hello world"
            world.set(field, resolved);
        }
    }

    @Given("we wait for a period of {string} ms")
    public void weWaitForPeriod(String ms) throws InterruptedException {
        Thread.sleep(Long.parseLong(ms));
    }

    // ========== Async Task Steps ==========

    @When("I start task {string} by calling {string}")
    public void startTask(String taskName, String fnName) {
        CompletableFuture<Object> future = CompletableFuture.supplyAsync(() -> {
            try {
                Object fn = handleResolve(fnName, world);
                Object result = callFunctional(fn);
                return result;
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });
        tasks.put(taskName, future);
    }

    @When("I start task {string} by calling {string} with parameter {string}")
    public void startTaskWithParam(String taskName, String fnName, String param) {
        Object paramVal = handleResolve(param, world);
        CompletableFuture<Object> future = CompletableFuture.supplyAsync(() -> {
            try {
                Object fn = handleResolve(fnName, world);
                return callFunctionalWithArgs(fn, paramVal);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });
        tasks.put(taskName, future);
    }

    @When("I start task {string} by calling {string} with parameters {string} and {string}")
    public void startTaskWithTwoParams(String taskName, String fnName, String param1, String param2) {
        Object p1 = handleResolve(param1, world);
        Object p2 = handleResolve(param2, world);
        CompletableFuture<Object> future = CompletableFuture.supplyAsync(() -> {
            try {
                Object fn = handleResolve(fnName, world);
                return callFunctionalWithArgs(fn, p1, p2);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });
        tasks.put(taskName, future);
    }

    @Then("I wait for task {string} to complete")
    public void waitForTask(String taskName) {
        try {
            Object result = tasks.get(taskName).get(30, TimeUnit.SECONDS);
            world.set("result", result);
            world.set(taskName, result);
        } catch (Exception e) {
            world.set("result", e);
            world.set(taskName, e);
        }
    }

    @Then("I wait for task {string} to complete within {string} ms")
    public void waitForTaskWithTimeout(String taskName, String timeoutMs) {
        try {
            long ms = Long.parseLong(timeoutMs);
            Object result = tasks.get(taskName).get(ms, TimeUnit.MILLISECONDS);
            world.set("result", result);
            world.set(taskName, result);
        } catch (Exception e) {
            world.set("result", e);
            world.set(taskName, e);
        }
    }

    @When("I wait for {string}")
    public void iWaitFor(String fnName) {
        try {
            Object fn = handleResolve(fnName, world);
            Object result = callFunctional(fn);
            world.set("result", result);
        } catch (Exception e) {
            world.set("result", e);
        }
    }

    @When("I wait for {string} with parameter {string}")
    public void iWaitForWithParam(String fnName, String param) {
        try {
            Object fn = handleResolve(fnName, world);
            Object result = callFunctionalWithArgs(fn, handleResolve(param, world));
            world.set("result", result);
        } catch (Exception e) {
            world.set("result", e);
        }
    }

    @When("I wait for {string} with parameters {string} and {string}")
    public void iWaitForWithTwoParams(String fnName, String param1, String param2) {
        try {
            Object fn = handleResolve(fnName, world);
            Object result = callFunctionalWithArgs(fn, handleResolve(param1, world), handleResolve(param2, world));
            world.set("result", result);
        } catch (Exception e) {
            world.set("result", e);
        }
    }

    // ========== Helper Methods ==========

    private Object callFunctional(Object fn) throws Exception {
        if (fn instanceof Runnable) {
            ((Runnable) fn).run();
            return null;
        }
        if (fn instanceof java.util.concurrent.Callable) {
            Object result = ((java.util.concurrent.Callable<?>) fn).call();
            return resolvePromise(result);
        }
        if (fn instanceof Supplier) {
            Object result = ((Supplier<?>) fn).get();
            return resolvePromise(result);
        }
        throw new IllegalArgumentException("Not a callable: " + (fn == null ? "null" : fn.getClass().getName()));
    }

    private Object callFunctionalWithArgs(Object fn, Object... args) throws Exception {
        // Try reflection-based invocation for any callable with args
        Method invokeMethod = findMethod(fn.getClass(), "apply", args);
        if (invokeMethod == null) {
            invokeMethod = findMethod(fn.getClass(), "accept", args);
        }
        if (invokeMethod == null) {
            invokeMethod = findMethod(fn.getClass(), "call", args);
        }
        if (invokeMethod != null) {
            invokeMethod.setAccessible(true);
            Object result = invokeMethod.invoke(fn, args);
            return resolvePromise(result);
        }
        throw new IllegalArgumentException("Cannot call " + fn.getClass().getName() + " with " + args.length + " args");
    }

    private Object resolvePromise(Object promise) throws Exception {
        if (promise instanceof Supplier) {
            promise = ((Supplier<?>) promise).get();
        }
        if (promise instanceof CompletionStage) {
            return ((CompletionStage<?>) promise).toCompletableFuture().get(30, TimeUnit.SECONDS);
        }
        return promise;
    }

    private Object resolvePromiseWithTimeout(Object promise, long timeout, TimeUnit unit) throws Exception {
        if (promise instanceof Supplier) {
            promise = ((Supplier<?>) promise).get();
        }
        if (promise instanceof CompletionStage) {
            return ((CompletionStage<?>) promise).toCompletableFuture().get(timeout, unit);
        }
        return promise;
    }

    private Object invokeMethod(Object target, String methodName, Object... args) throws Exception {
        Method method = findMethod(target.getClass(), methodName, args);
        if (method == null) {
            throw new NoSuchMethodException("Method not found: " + methodName);
        }
        method.setAccessible(true);
        Object result = method.invoke(target, args);
        return resolvePromise(result);
    }

    public static Method findMethod(Class<?> targetClass, String name, Object... args) {
        Method bestMatch = null;
        for (Method method : targetClass.getMethods()) {
            if (!method.getName().equals(name)) continue;
            Class<?>[] paramTypes = method.getParameterTypes();
            if (paramTypes.length != args.length) continue;
            if (isCompatible(paramTypes, args)) {
                if (bestMatch == null || isMoreSpecific(paramTypes, bestMatch.getParameterTypes())) {
                    bestMatch = method;
                }
            }
        }
        return bestMatch;
    }

    private static boolean isCompatible(Class<?>[] paramTypes, Object[] args) {
        for (int i = 0; i < paramTypes.length; i++) {
            if (args[i] == null) {
                if (paramTypes[i].isPrimitive()) return false;
                continue;
            }
            if (!wrap(paramTypes[i]).isAssignableFrom(args[i].getClass())) return false;
        }
        return true;
    }

    private static boolean isMoreSpecific(Class<?>[] a, Class<?>[] b) {
        for (int i = 0; i < a.length; i++) {
            if (a[i] != b[i] && b[i].isAssignableFrom(a[i])) return true;
        }
        return false;
    }

    private static Class<?> wrap(Class<?> type) {
        if (!type.isPrimitive()) return type;
        if (type == int.class) return Integer.class;
        if (type == long.class) return Long.class;
        if (type == boolean.class) return Boolean.class;
        if (type == double.class) return Double.class;
        if (type == float.class) return Float.class;
        if (type == char.class) return Character.class;
        if (type == byte.class) return Byte.class;
        if (type == short.class) return Short.class;
        return type;
    }

    private String getRootCauseMessage(Throwable t) {
        Throwable root = t;
        while (root.getCause() != null && root.getCause() != root) {
            root = root.getCause();
        }
        return root.getMessage();
    }

    private boolean isTruthy(Object value) {
        if (value == null) return false;
        if (value instanceof Boolean) return (Boolean) value;
        if (value instanceof Number) return ((Number) value).doubleValue() != 0;
        if (value instanceof String) {
            String s = (String) value;
            if (s.isEmpty()) return false;
            try { return Double.parseDouble(s) != 0; } catch (NumberFormatException ignored) {}
            return !s.equalsIgnoreCase("false") && !s.equalsIgnoreCase("null");
        }
        return true;
    }

    private double toDouble(Object value) {
        return Double.parseDouble(String.valueOf(value));
    }

    @SuppressWarnings("unchecked")
    private List<Object> toList(Object obj) {
        if (obj == null) return Collections.emptyList();
        if (obj instanceof List) return (List<Object>) obj;
        if (obj.getClass().isArray()) {
            int length = Array.getLength(obj);
            List<Object> list = new ArrayList<>(length);
            for (int i = 0; i < length; i++) list.add(Array.get(obj, i));
            return list;
        }
        throw new IllegalArgumentException("Expected array or List, but got: " + obj.getClass().getName());
    }
}
