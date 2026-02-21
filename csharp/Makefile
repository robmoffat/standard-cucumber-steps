DOTNET ?= $(shell which dotnet 2>/dev/null || echo $$HOME/.dotnet/dotnet)

.PHONY: test

test:
	$(DOTNET) test --collect:"XPlat Code Coverage" --results-directory TestResults
	$(DOTNET) tool restore
	$(DOTNET) tool run reportgenerator -reports:"TestResults/**/coverage.cobertura.xml" -targetdir:coverage -reporttypes:Html
	@echo "Coverage report: coverage/index.html"
