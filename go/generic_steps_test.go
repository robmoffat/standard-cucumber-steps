package generic_test

import (
	"testing"

	"github.com/cucumber/godog"
	generic "github.com/robmoffat/standard-cucumber-steps/go"
)

func TestFeatures(t *testing.T) {
	suite := godog.TestSuite{
		Name: "standard-cucumber-steps",
		ScenarioInitializer: func(ctx *godog.ScenarioContext) {
			world := generic.NewPropsWorld()
			world.RegisterSteps(ctx)
		},
		Options: &godog.Options{
			Format:   "pretty",
			Paths:    []string{"../features"},
			TestingT: t,
		},
	}

	if suite.Run() != 0 {
		t.Fatal("non-zero status returned, failed to run feature tests")
	}
}
