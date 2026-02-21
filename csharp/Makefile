DOTNET ?= $(shell which dotnet 2>/dev/null || echo $$HOME/.dotnet/dotnet)
DOTNET_COVERAGE ?= $(shell which dotnet-coverage 2>/dev/null || echo $$HOME/.dotnet/tools/dotnet-coverage)

.PHONY: test clean copy-features

test: clean copy-features
	$(DOTNET) test test/ --collect "Code Coverage" --settings test/coverage.runsettings --results-directory test/TestResults
	$(DOTNET_COVERAGE) merge --output coverage.xml --output-format cobertura test/TestResults/*/*.coverage
	$(DOTNET) tool restore --tool-manifest test/.config/dotnet-tools.json 2>/dev/null || $(DOTNET) tool restore
	$(DOTNET) tool run reportgenerator -reports:"coverage.xml" -targetdir:coverage -reporttypes:Html
	@echo "Coverage report: coverage/index.html"

copy-features:
	mkdir -p test/features/shared
	cp ../features/*.feature test/features/shared/

clean:
	rm -rf test/TestResults coverage coverage.xml test/features/shared
