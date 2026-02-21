DOTNET ?= $(shell which dotnet 2>/dev/null || echo $$HOME/.dotnet/dotnet)
DOTNET_COVERAGE ?= $(shell which dotnet-coverage 2>/dev/null || echo $$HOME/.dotnet/tools/dotnet-coverage)

.PHONY: test

test:
	rm -rf TestResults
	$(DOTNET) test --collect "Code Coverage" --results-directory TestResults
	$(DOTNET_COVERAGE) merge --output coverage.xml --output-format cobertura TestResults/*/*.coverage
	$(DOTNET) tool restore
	$(DOTNET) tool run reportgenerator -reports:"coverage.xml" -targetdir:coverage -reporttypes:Html
	@echo "Coverage report: coverage/index.html"
