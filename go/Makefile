.PHONY: test

test:
	go test -v -coverprofile=coverage.out ./...
	@mkdir -p coverage
	go tool cover -html=coverage.out -o coverage/index.html
	@echo "Coverage report: coverage/index.html"
