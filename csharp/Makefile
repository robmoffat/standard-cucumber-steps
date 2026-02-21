DOTNET ?= $(shell which dotnet 2>/dev/null || echo $$HOME/.dotnet/dotnet)

.PHONY: test

test:
	$(DOTNET) test /p:CollectCoverage=true /p:CoverletOutputFormat=cobertura /p:CoverletOutput=coverage.xml /p:Exclude="[Reqnroll*]*"
	$(DOTNET) tool restore
	$(DOTNET) tool run reportgenerator -reports:"coverage.xml" -targetdir:coverage -reporttypes:Html
	@echo "Coverage report: coverage/index.html"
