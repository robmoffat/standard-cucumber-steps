package generic_test

import (
	"fmt"
	"testing"

	"github.com/cucumber/godog"
	generic "github.com/robmoffat/standard-cucumber-steps/go"
)

// TestCalculator is a helper struct for method invocation tests
type TestCalculator struct {
	Value float64
}

func (c *TestCalculator) GetValue() float64 {
	return c.Value
}

func (c *TestCalculator) Add(n float64) float64 {
	return c.Value + n
}

func (c *TestCalculator) Multiply(a, b float64) float64 {
	return a * b
}

func (calc *TestCalculator) Sum3(a, b, c float64) float64 {
	return a + b + c
}

func (calc *TestCalculator) Sum4(a, b, c, d float64) float64 {
	return a + b + c + d
}

func (calc *TestCalculator) FailingMethod() (float64, error) {
	return 0, fmt.Errorf("method failed")
}

func setupTestFixtures(world *generic.PropsWorld) {
	// Sample arrays for array assertion tests
	world.Props["sampleArray"] = []interface{}{
		map[string]interface{}{"name": "Alice", "value": 100},
		map[string]interface{}{"name": "Bob", "value": 200},
	}
	world.Props["sampleStringArray"] = []interface{}{"one", "two", "three"}
	world.Props["sampleEmptyArray"] = []interface{}{}
	world.Props["sampleObject"] = map[string]interface{}{"name": "John", "age": 30}

	// Functions with parameters for method call tests
	world.Props["singleArgFn"] = func(arg string) interface{} { return arg }
	world.Props["twoArgFn"] = func(a, b string) interface{} { return a + b }
	world.Props["threeArgConcatFn"] = func(a, b, c string) interface{} { return a + b + c }
	world.Props["fourArgConcatFn"] = func(a, b, c, d string) interface{} { return a + b + c + d }

	// Error throwing function for error assertion tests (accepts any args via multiple signatures)
	world.Props["errorThrowingFn"] = func() interface{} {
		return fmt.Errorf("Test error message")
	}
	// For functions with args, we need separate error functions
	world.Props["errorWithArgFn"] = func(a string) interface{} {
		return fmt.Errorf("Test error message")
	}
	world.Props["errorWith2ArgsFn"] = func(a, b string) interface{} {
		return fmt.Errorf("Test error message")
	}
	world.Props["errorWith3ArgsFn"] = func(a, b, c string) interface{} {
		return fmt.Errorf("Test error message")
	}
	world.Props["errorWith4ArgsFn"] = func(a, b, c, d string) interface{} {
		return fmt.Errorf("Test error message")
	}

	// Test calculator object for method invocation tests
	world.Props["testCalculator"] = &TestCalculator{Value: 42}

	// Nested objects for JSONPath tests
	world.Props["nestedObject"] = map[string]interface{}{
		"name": "parent",
		"level1": map[string]interface{}{
			"level2": "deep-value",
		},
	}

	world.Props["arrayWithObjects"] = []interface{}{
		map[string]interface{}{"id": "1", "name": "first"},
		map[string]interface{}{"id": "2", "name": "second"},
		map[string]interface{}{"id": "3", "name": "third"},
	}

	world.Props["deeplyNested"] = map[string]interface{}{
		"a": map[string]interface{}{
			"b": map[string]interface{}{
				"c": map[string]interface{}{
					"d": "found",
				},
			},
		},
	}

	world.Props["userArray"] = []interface{}{
		map[string]interface{}{
			"name": "Alice",
			"address": map[string]interface{}{
				"city": "New York",
				"zip":  "10001",
			},
		},
		map[string]interface{}{
			"name": "Bob",
			"address": map[string]interface{}{
				"city": "Los Angeles",
				"zip":  "90001",
			},
		},
	}

	world.Props["typedValues"] = map[string]interface{}{
		"count":   42,
		"price":   9.99,
		"active":  true,
		"deleted": false,
		"label":   "hello",
		"nested": map[string]interface{}{
			"score":   100,
			"enabled": true,
		},
	}
}

func TestFeatures(t *testing.T) {
	suite := godog.TestSuite{
		Name: "standard-cucumber-steps",
		ScenarioInitializer: func(ctx *godog.ScenarioContext) {
			world := generic.NewPropsWorld()
			setupTestFixtures(world)
			world.RegisterSteps(ctx)
		},
		Options: &godog.Options{
			Format:   "pretty",
			Paths:    []string{"../features", "./features"},
			TestingT: t,
		},
	}

	if suite.Run() != 0 {
		t.Fatal("non-zero status returned, failed to run feature tests")
	}
}
