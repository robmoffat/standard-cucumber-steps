package generic

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
	"sync"

	"github.com/PaesslerAG/jsonpath"
)

// RowFieldMatcher handles custom Gherkin table column semantics.
type RowFieldMatcher interface {
	MatchesField(field string) bool
	MatchField(pw *PropsWorld, field string, expected string, rowData interface{}) bool
}

var (
	fieldMatchers   []RowFieldMatcher
	fieldMatchersMu sync.RWMutex
	regexSuffix     = "_regex"
)

// RegisterFieldMatcher adds a pluggable column matcher (first match wins).
func RegisterFieldMatcher(m RowFieldMatcher) {
	fieldMatchersMu.Lock()
	defer fieldMatchersMu.Unlock()
	fieldMatchers = append(fieldMatchers, m)
}

// ClearFieldMatchers removes all registered matchers (for test isolation).
func ClearFieldMatchers() {
	fieldMatchersMu.Lock()
	defer fieldMatchersMu.Unlock()
	fieldMatchers = nil
}

func findFieldMatcher(field string) RowFieldMatcher {
	fieldMatchersMu.RLock()
	defer fieldMatchersMu.RUnlock()
	for _, m := range fieldMatchers {
		if m.MatchesField(field) {
			return m
		}
	}
	return nil
}

// PathForFieldSuffix returns the JSONPath within row data for a suffixed column name.
func PathForFieldSuffix(field, suffix string) (string, bool) {
	if !strings.HasSuffix(field, suffix) {
		return "", false
	}
	if len(field) == len(suffix) {
		return "", true
	}
	stem := field[:len(field)-len(suffix)]
	if strings.HasSuffix(stem, ".") {
		stem = stem[:len(stem)-1]
	}
	return stem, true
}

func valueAtPath(rowData interface{}, path string) (interface{}, error) {
	if path == "" {
		return rowData, nil
	}
	actualBytes, err := json.Marshal(rowData)
	if err != nil {
		return nil, err
	}
	var actualMap map[string]interface{}
	if err := json.Unmarshal(actualBytes, &actualMap); err != nil {
		return nil, err
	}
	return jsonpath.Get("$."+path, actualMap)
}

// RegisterRegexFieldMatcher installs the test-only _regex suffix matcher (SCS feature tests).
func RegisterRegexFieldMatcher() {
	RegisterFieldMatcher(regexFieldMatcher{})
}

type regexFieldMatcher struct{}

func (regexFieldMatcher) MatchesField(field string) bool {
	return strings.HasSuffix(field, regexSuffix)
}

func (regexFieldMatcher) MatchField(pw *PropsWorld, field string, expected string, rowData interface{}) bool {
	path, ok := PathForFieldSuffix(field, regexSuffix)
	if !ok {
		return false
	}
	found, err := valueAtPath(rowData, path)
	if err != nil {
		return false
	}
	foundStr := fmt.Sprintf("%v", found)
	re, err := regexp.Compile(expected)
	if err != nil {
		return false
	}
	return re.MatchString(foundStr)
}
