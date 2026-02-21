package generic

import (
	"context"
	"encoding/json"
	"fmt"
	"reflect"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/PaesslerAG/jsonpath"
	"github.com/cucumber/godog"
)

// AsyncTask represents an asynchronous operation
type AsyncTask struct {
	Name      string
	StartTime time.Time
	Done      chan struct{}
	Result    interface{}
	Error     error
	Context   context.Context
	Cancel    context.CancelFunc
}

// AsyncTaskManager manages multiple async operations
type AsyncTaskManager struct {
	tasks map[string]*AsyncTask
	mutex sync.RWMutex
}

// NewAsyncTaskManager creates a new async task manager
func NewAsyncTaskManager() *AsyncTaskManager {
	return &AsyncTaskManager{
		tasks: make(map[string]*AsyncTask),
	}
}

// StartTask starts a new async task
func (atm *AsyncTaskManager) StartTask(name string, fn func(ctx context.Context) (interface{}, error)) {
	atm.mutex.Lock()
	defer atm.mutex.Unlock()

	ctx, cancel := context.WithCancel(context.Background())
	task := &AsyncTask{
		Name:      name,
		StartTime: time.Now(),
		Done:      make(chan struct{}),
		Context:   ctx,
		Cancel:    cancel,
	}

	atm.tasks[name] = task

	go func() {
		defer close(task.Done)
		task.Result, task.Error = fn(ctx)
	}()
}

// WaitForTask waits for a task to complete with timeout
func (atm *AsyncTaskManager) WaitForTask(name string, timeout time.Duration) error {
	atm.mutex.RLock()
	task, exists := atm.tasks[name]
	atm.mutex.RUnlock()

	if !exists {
		return fmt.Errorf("task %s not found", name)
	}

	select {
	case <-task.Done:
		return task.Error
	case <-time.After(timeout):
		task.Cancel()
		return fmt.Errorf("task %s timed out after %v", name, timeout)
	}
}

// GetTaskResult gets the result of a completed task
func (atm *AsyncTaskManager) GetTaskResult(name string) (interface{}, error) {
	atm.mutex.RLock()
	defer atm.mutex.RUnlock()

	task, exists := atm.tasks[name]
	if !exists {
		return nil, fmt.Errorf("task %s not found", name)
	}

	select {
	case <-task.Done:
		return task.Result, task.Error
	default:
		return nil, fmt.Errorf("task %s is still running", name)
	}
}

// TestingT interface for testing assertions
type TestingT interface {
	Errorf(format string, args ...interface{})
	FailNow()
}

// PropsWorld represents the test context
type PropsWorld struct {
	Props        map[string]interface{}
	T            TestingT
	AsyncManager *AsyncTaskManager
	mutex        sync.RWMutex
}

// NewPropsWorld creates a new test world instance
func NewPropsWorld() *PropsWorld {
	return &PropsWorld{
		Props:        make(map[string]interface{}),
		AsyncManager: NewAsyncTaskManager(),
	}
}

// HandleResolve resolves variables and literals from string references.
func (pw *PropsWorld) HandleResolve(name string) interface{} {
	if strings.HasPrefix(name, "{") && strings.HasSuffix(name, "}") && strings.Count(name, "{") == 1 {
		return pw.resolveSingleVar(name)
	}
	if strings.Contains(name, "{") && strings.Contains(name, "}") {
		result := name
		for {
			start := strings.Index(result, "{")
			if start == -1 {
				break
			}
			end := strings.Index(result[start:], "}")
			if end == -1 {
				break
			}
			end += start
			varRef := result[start : end+1]
			resolved := pw.resolveSingleVar(varRef)
			if resolved != nil {
				result = result[:start] + fmt.Sprintf("%v", resolved) + result[end+1:]
			} else {
				break
			}
		}
		return result
	}
	return name
}

// resolveSingleVar resolves a single {varName} reference
func (pw *PropsWorld) resolveSingleVar(name string) interface{} {
	if !strings.HasPrefix(name, "{") || !strings.HasSuffix(name, "}") {
		return name
	}

	stripped := name[1 : len(name)-1]

	switch stripped {
	case "null":
		return nil
	case "nil":
		return nil
	case "true":
		return true
	case "false":
		return false
	default:
		if val, err := strconv.ParseFloat(stripped, 64); err == nil {
			return val
		}
		if val, exists := pw.Props[stripped]; exists {
			return val
		}
		pascalCase := strings.ToUpper(stripped[:1]) + stripped[1:]
		if val, exists := pw.Props[pascalCase]; exists {
			return val
		}
		if strings.Contains(stripped, ".") {
			parts := strings.Split(stripped, ".")
			if len(parts) == 2 {
				objName := parts[0]
				fieldName := parts[1]
				if obj, exists := pw.Props[objName]; exists {
					v := reflect.ValueOf(obj)
					if v.Kind() == reflect.Ptr {
						v = v.Elem()
					}
					if v.Kind() == reflect.Struct {
						field := v.FieldByName(fieldName)
						if field.IsValid() {
							return field.Interface()
						}
						capitalizedFieldName := strings.ToUpper(fieldName[:1]) + fieldName[1:]
						field = v.FieldByName(capitalizedFieldName)
						if field.IsValid() {
							return field.Interface()
						}
						getterName := "Get" + capitalizedFieldName
						method := reflect.ValueOf(obj).MethodByName(getterName)
						if method.IsValid() {
							results := method.Call(nil)
							if len(results) > 0 {
								return results[0].Interface()
							}
						}
					}
				}
			}
		}
		if result, err := jsonpath.Get("$."+stripped, pw.Props); err == nil {
			return result
		}
		return nil
	}
}

// callFunction safely calls a function with error handling
func (pw *PropsWorld) callFunction(fn interface{}, args ...interface{}) {
	defer func() {
		if r := recover(); r != nil {
			pw.Props["result"] = fmt.Errorf("panic: %v", r)
		}
	}()

	fnValue := reflect.ValueOf(fn)
	if fnValue.Kind() != reflect.Func {
		pw.Props["result"] = fmt.Errorf("not a function")
		return
	}

	argValues := make([]reflect.Value, len(args))
	for i, arg := range args {
		argValues[i] = reflect.ValueOf(arg)
	}

	results := fnValue.Call(argValues)

	if len(results) > 0 {
		pw.Props["result"] = results[0].Interface()
	}
}

// doesRowMatch checks if a data row matches the expected values
func (pw *PropsWorld) doesRowMatch(expected map[string]string, actual interface{}) (bool, string) {
	actualBytes, _ := json.Marshal(actual)
	var actualMap map[string]interface{}
	json.Unmarshal(actualBytes, &actualMap)

	var debugInfo []string
	debugInfo = append(debugInfo, fmt.Sprintf("Actual object: %s", string(actualBytes)))

	for field, expectedVal := range expected {
		if strings.HasSuffix(field, "matches_type") {
			debugInfo = append(debugInfo, fmt.Sprintf("  %s: SKIPPED (schema validation)", field))
			continue
		}

		var foundVal interface{}
		if result, err := jsonpath.Get("$."+field, actualMap); err == nil {
			foundVal = result
		}

		resolvedExpected := pw.HandleResolve(expectedVal)

		if foundVal == true && resolvedExpected == "true" {
			continue
		}
		if foundVal == false && resolvedExpected == "false" {
			continue
		}

		foundStr := fmt.Sprintf("%v", foundVal)
		expectedStr := fmt.Sprintf("%v", resolvedExpected)

		if foundStr != expectedStr {
			debugInfo = append(debugInfo, fmt.Sprintf("  %s: MISMATCH - found: '%s', expected: '%s'",
				field, foundStr, expectedStr))
			return false, strings.Join(debugInfo, "\n")
		}
	}

	return true, strings.Join(debugInfo, "\n")
}

// matchData validates array data against expected table
func (pw *PropsWorld) matchData(actual []interface{}, expected []map[string]string) error {
	if len(actual) != len(expected) {
		return fmt.Errorf("length mismatch: expected %d, got %d", len(expected), len(actual))
	}
	for i, expectedRow := range expected {
		matches, debugInfo := pw.doesRowMatch(expectedRow, actual[i])
		if !matches {
			return fmt.Errorf("row %d does not match:\n%s", i, debugInfo)
		}
	}
	return nil
}

func (pw *PropsWorld) recoverFromMethodCallPanic(objectName, methodName string, params ...interface{}) {
	if r := recover(); r != nil {
		errMsg := fmt.Sprintf("Error calling %s.%s: %v", objectName, methodName, r)
		pw.Props["result"] = fmt.Errorf("%s", errMsg)
	}
}

func (pw *PropsWorld) handleMethodResultsSync(results []reflect.Value) {
	if len(results) > 1 {
		if err, ok := results[len(results)-1].Interface().(error); ok && err != nil {
			pw.Props["result"] = err
			return
		}
	}
	if len(results) > 0 {
		pw.Props["result"] = results[0].Interface()
	}
}

func parseNumber(val interface{}) (float64, error) {
	switch v := val.(type) {
	case int:
		return float64(v), nil
	case int32:
		return float64(v), nil
	case int64:
		return float64(v), nil
	case float32:
		return float64(v), nil
	case float64:
		return v, nil
	case string:
		return strconv.ParseFloat(v, 64)
	default:
		return strconv.ParseFloat(fmt.Sprintf("%v", v), 64)
	}
}

// Step implementations

func (pw *PropsWorld) iCallFunction(fnName string) error {
	fn := pw.HandleResolve(fnName)
	pw.callFunction(fn)
	return nil
}

func (pw *PropsWorld) iCallObjectWithMethod(field, fnName string) error {
	obj := pw.HandleResolve(field)
	objValue := reflect.ValueOf(obj)
	method := objValue.MethodByName(fnName)
	if !method.IsValid() {
		pw.Props["result"] = fmt.Errorf("method %s not found", fnName)
		return nil
	}
	defer pw.recoverFromMethodCallPanic(field, fnName)
	results := method.Call([]reflect.Value{})
	pw.handleMethodResultsSync(results)
	return nil
}

func (pw *PropsWorld) iCallObjectWithMethodWithParameter(field, fnName, param string) error {
	obj := pw.HandleResolve(field)
	paramVal := pw.HandleResolve(param)
	objValue := reflect.ValueOf(obj)
	method := objValue.MethodByName(fnName)
	if !method.IsValid() {
		pw.Props["result"] = fmt.Errorf("method %s not found", fnName)
		return nil
	}
	defer pw.recoverFromMethodCallPanic(field, fnName, param)
	results := method.Call([]reflect.Value{reflect.ValueOf(paramVal)})
	pw.handleMethodResultsSync(results)
	return nil
}

func (pw *PropsWorld) iCallObjectWithMethodWithTwoParameters(field, fnName, param1, param2 string) error {
	obj := pw.HandleResolve(field)
	objValue := reflect.ValueOf(obj)
	method := objValue.MethodByName(fnName)
	if !method.IsValid() {
		pw.Props["result"] = fmt.Errorf("method %s not found", fnName)
		return nil
	}
	defer pw.recoverFromMethodCallPanic(field, fnName, param1, param2)
	results := method.Call([]reflect.Value{
		reflect.ValueOf(pw.HandleResolve(param1)),
		reflect.ValueOf(pw.HandleResolve(param2)),
	})
	pw.handleMethodResultsSync(results)
	return nil
}

func (pw *PropsWorld) iCallObjectWithMethodWithThreeParameters(field, fnName, param1, param2, param3 string) error {
	obj := pw.HandleResolve(field)
	objValue := reflect.ValueOf(obj)
	method := objValue.MethodByName(fnName)
	if !method.IsValid() {
		pw.Props["result"] = fmt.Errorf("method %s not found", fnName)
		return nil
	}
	defer pw.recoverFromMethodCallPanic(field, fnName, param1, param2, param3)
	results := method.Call([]reflect.Value{
		reflect.ValueOf(pw.HandleResolve(param1)),
		reflect.ValueOf(pw.HandleResolve(param2)),
		reflect.ValueOf(pw.HandleResolve(param3)),
	})
	pw.handleMethodResultsSync(results)
	return nil
}

func (pw *PropsWorld) iCallObjectWithMethodWithFourParameters(field, fnName, param1, param2, param3, param4 string) error {
	obj := pw.HandleResolve(field)
	objValue := reflect.ValueOf(obj)
	method := objValue.MethodByName(fnName)
	if !method.IsValid() {
		pw.Props["result"] = fmt.Errorf("method %s not found", fnName)
		return nil
	}
	defer pw.recoverFromMethodCallPanic(field, fnName, param1, param2, param3, param4)
	results := method.Call([]reflect.Value{
		reflect.ValueOf(pw.HandleResolve(param1)),
		reflect.ValueOf(pw.HandleResolve(param2)),
		reflect.ValueOf(pw.HandleResolve(param3)),
		reflect.ValueOf(pw.HandleResolve(param4)),
	})
	pw.handleMethodResultsSync(results)
	return nil
}

func (pw *PropsWorld) iCallFunctionWithParameter(fnName, param string) error {
	pw.callFunction(pw.HandleResolve(fnName), pw.HandleResolve(param))
	return nil
}

func (pw *PropsWorld) iCallFunctionWithTwoParameters(fnName, param1, param2 string) error {
	pw.callFunction(pw.HandleResolve(fnName), pw.HandleResolve(param1), pw.HandleResolve(param2))
	return nil
}

func (pw *PropsWorld) iCallFunctionWithThreeParameters(fnName, param1, param2, param3 string) error {
	pw.callFunction(pw.HandleResolve(fnName), pw.HandleResolve(param1), pw.HandleResolve(param2), pw.HandleResolve(param3))
	return nil
}

func (pw *PropsWorld) iCallFunctionWithFourParameters(fnName, param1, param2, param3, param4 string) error {
	pw.callFunction(pw.HandleResolve(fnName), pw.HandleResolve(param1), pw.HandleResolve(param2), pw.HandleResolve(param3), pw.HandleResolve(param4))
	return nil
}

func (pw *PropsWorld) IReferToAs(from, to string) error {
	pw.Props[to] = pw.HandleResolve(from)
	return nil
}

func (pw *PropsWorld) fieldIsArrayOfObjectsWithContents(field string, table *godog.Table) error {
	actual := pw.HandleResolve(field)
	actualSlice, ok := actual.([]interface{})
	if !ok {
		return fmt.Errorf("field %s is not an array", field)
	}
	expected := tableToMaps(table)
	return pw.matchData(actualSlice, expected)
}

func (pw *PropsWorld) fieldIsArrayOfObjectsWithAtLeastContents(field string, table *godog.Table) error {
	actual := pw.HandleResolve(field)
	actualSlice, ok := actual.([]interface{})
	if !ok {
		return fmt.Errorf("field %s is not an array", field)
	}
	expected := tableToMaps(table)
	for _, expectedRow := range expected {
		found := false
		for _, actualItem := range actualSlice {
			match, _ := pw.doesRowMatch(expectedRow, actualItem)
			if match {
				found = true
				break
			}
		}
		if !found {
			return fmt.Errorf("expected row not found: %+v", expectedRow)
		}
	}
	return nil
}

func (pw *PropsWorld) fieldIsArrayOfObjectsWhichDoesntContainAnyOf(field string, table *godog.Table) error {
	actual := pw.HandleResolve(field)
	actualSlice, ok := actual.([]interface{})
	if !ok {
		return fmt.Errorf("field %s is not an array", field)
	}
	unwanted := tableToMaps(table)
	for _, unwantedRow := range unwanted {
		for _, actualItem := range actualSlice {
			match, _ := pw.doesRowMatch(unwantedRow, actualItem)
			if match {
				return fmt.Errorf("unwanted row found in array: %+v", unwantedRow)
			}
		}
	}
	return nil
}

func (pw *PropsWorld) fieldIsArrayOfObjectsWithLength(field, lengthField string) error {
	actual := pw.HandleResolve(field)
	actualSlice, ok := actual.([]interface{})
	if !ok {
		return fmt.Errorf("field %s is not an array", field)
	}
	expectedLen, err := strconv.Atoi(fmt.Sprintf("%v", pw.HandleResolve(lengthField)))
	if err != nil {
		return fmt.Errorf("invalid length: %v", lengthField)
	}
	if len(actualSlice) != expectedLen {
		return fmt.Errorf("expected length %d, got %d", expectedLen, len(actualSlice))
	}
	return nil
}

func (pw *PropsWorld) fieldIsArrayOfStringsWithValues(field string, table *godog.Table) error {
	actual := pw.HandleResolve(field)
	actualSlice, ok := actual.([]interface{})
	if !ok {
		return fmt.Errorf("field %s is not an array", field)
	}
	expectedValues := make([]string, len(table.Rows)-1)
	for i := 1; i < len(table.Rows); i++ {
		expectedValues[i-1] = table.Rows[i].Cells[0].Value
	}
	if len(actualSlice) != len(expectedValues) {
		return fmt.Errorf("length mismatch: expected %d, got %d", len(expectedValues), len(actualSlice))
	}
	for i, expectedVal := range expectedValues {
		actualVal := fmt.Sprintf("%v", actualSlice[i])
		if actualVal != expectedVal {
			return fmt.Errorf("element %d mismatch: expected %s, got %s", i, expectedVal, actualVal)
		}
	}
	return nil
}

func (pw *PropsWorld) fieldIsObjectWithContents(field string, table *godog.Table) error {
	actual := pw.HandleResolve(field)
	if len(table.Rows) != 2 {
		return fmt.Errorf("expected exactly one data row in table")
	}
	expected := make(map[string]string)
	for i, cell := range table.Rows[0].Cells {
		expected[cell.Value] = table.Rows[1].Cells[i].Value
	}
	actualMap, ok := actual.(map[string]interface{})
	if !ok {
		return fmt.Errorf("field %s is not an object/map", field)
	}
	for key, expectedVal := range expected {
		actualVal, exists := actualMap[key]
		if !exists {
			return fmt.Errorf("field %s missing in actual object", key)
		}
		if fmt.Sprintf("%v", actualVal) != expectedVal {
			return fmt.Errorf("field %s mismatch: expected %s, got %v", key, expectedVal, actualVal)
		}
	}
	return nil
}

func (pw *PropsWorld) fieldIsNil(field string) error {
	actual := pw.HandleResolve(field)
	if actual != nil {
		return fmt.Errorf("expected %s to be null, got %v", field, actual)
	}
	return nil
}

func (pw *PropsWorld) fieldIsNotNil(field string) error {
	actual := pw.HandleResolve(field)
	if actual == nil {
		return fmt.Errorf("expected %s to not be null", field)
	}
	return nil
}

func isTruthy(value interface{}) bool {
	if value == nil {
		return false
	}
	switch v := value.(type) {
	case bool:
		return v
	case int:
		return v != 0
	case int32:
		return v != 0
	case int64:
		return v != 0
	case float32:
		return v != 0
	case float64:
		return v != 0
	case string:
		return len(v) > 0
	default:
		return true
	}
}

func (pw *PropsWorld) fieldIsTrue(field string) error {
	actual := pw.HandleResolve(field)
	if !isTruthy(actual) {
		return fmt.Errorf("expected %s to be truthy, got %v (type: %T)", field, actual, actual)
	}
	return nil
}

func (pw *PropsWorld) fieldIsFalse(field string) error {
	actual := pw.HandleResolve(field)
	if isTruthy(actual) {
		return fmt.Errorf("expected %s to be falsy, got %v (type: %T)", field, actual, actual)
	}
	return nil
}

func (pw *PropsWorld) fieldIsEmpty(field string) error {
	actual := pw.HandleResolve(field)
	switch v := actual.(type) {
	case []interface{}:
		if len(v) != 0 {
			return fmt.Errorf("expected %s to be empty, got length %d", field, len(v))
		}
	case string:
		if len(v) != 0 {
			return fmt.Errorf("expected %s to be empty, got length %d", field, len(v))
		}
	default:
		return fmt.Errorf("cannot check if %s is empty: unsupported type", field)
	}
	return nil
}

func (pw *PropsWorld) fieldIsErrorWithMessage(field, errorType string) error {
	actual := pw.HandleResolve(field)
	if err, ok := actual.(error); ok {
		if err.Error() != errorType {
			return fmt.Errorf("expected error message '%s', got '%s'", errorType, err.Error())
		}
		return nil
	}
	return fmt.Errorf("expected %s to be an error", field)
}

func (pw *PropsWorld) fieldIsError(field string) error {
	actual := pw.HandleResolve(field)
	if _, ok := actual.(error); !ok {
		return fmt.Errorf("expected %s to be an error, got %T", field, actual)
	}
	return nil
}

func (pw *PropsWorld) fieldIsNotError(field string) error {
	actual := pw.HandleResolve(field)
	if _, ok := actual.(error); ok {
		return fmt.Errorf("expected %s to not be an error, but got: %v", field, actual)
	}
	return nil
}

func (pw *PropsWorld) fieldContains(field, substring string) error {
	actual := pw.HandleResolve(field)
	var actualStr string
	if err, ok := actual.(error); ok {
		actualStr = err.Error()
	} else {
		actualStr = fmt.Sprintf("%v", actual)
	}
	if !strings.Contains(actualStr, substring) {
		return fmt.Errorf("expected %s to contain '%s', but got '%s'", field, substring, actualStr)
	}
	return nil
}

func (pw *PropsWorld) fieldIsStringContainingOneOf(field string, table *godog.Table) error {
	actual := pw.HandleResolve(field)
	var actualStr string
	if err, ok := actual.(error); ok {
		actualStr = err.Error()
	} else {
		actualStr = fmt.Sprintf("%v", actual)
	}
	expectedValues := make([]string, 0, len(table.Rows)-1)
	for i := 1; i < len(table.Rows); i++ {
		if len(table.Rows[i].Cells) > 0 {
			expectedValues = append(expectedValues, table.Rows[i].Cells[0].Value)
		}
	}
	for _, expected := range expectedValues {
		if strings.Contains(actualStr, expected) {
			return nil
		}
	}
	return fmt.Errorf("expected %s to contain one of %v, but got '%s'", field, expectedValues, actualStr)
}

func (pw *PropsWorld) fieldShouldBeGreaterThan(field, thresholdStr string) error {
	actualNum, err := parseNumber(pw.HandleResolve(field))
	if err != nil {
		return fmt.Errorf("cannot parse %s as number: %v", field, err)
	}
	thresholdNum, err := parseNumber(pw.HandleResolve(thresholdStr))
	if err != nil {
		return fmt.Errorf("cannot parse threshold '%s' as number: %v", thresholdStr, err)
	}
	if actualNum <= thresholdNum {
		return fmt.Errorf("expected %s (%v) to be greater than %v", field, actualNum, thresholdNum)
	}
	return nil
}

func (pw *PropsWorld) fieldShouldBeLessThan(field, thresholdStr string) error {
	actualNum, err := parseNumber(pw.HandleResolve(field))
	if err != nil {
		return fmt.Errorf("cannot parse %s as number: %v", field, err)
	}
	thresholdNum, err := parseNumber(pw.HandleResolve(thresholdStr))
	if err != nil {
		return fmt.Errorf("cannot parse threshold '%s' as number: %v", thresholdStr, err)
	}
	if actualNum >= thresholdNum {
		return fmt.Errorf("expected %s (%v) to be less than %v", field, actualNum, thresholdNum)
	}
	return nil
}

func (pw *PropsWorld) HandlerIsInvocationCounter(handlerName, field string) error {
	pw.Props[field] = 0
	pw.Props[handlerName] = func() {
		count, exists := pw.Props[field]
		if !exists {
			count = 0
		}
		if countInt, ok := count.(int); ok {
			pw.Props[field] = countInt + 1
		} else {
			pw.Props[field] = 1
		}
	}
	return nil
}

func (pw *PropsWorld) IsAnAsyncFunctionReturning(fnName, field string) error {
	value := pw.HandleResolve(field)
	pw.Props[fnName] = func() interface{} {
		return value
	}
	return nil
}

// Setter step: I set "field" to "value"
func (pw *PropsWorld) iSetFieldTo(field, value string) error {
	pw.Props[field] = pw.HandleResolve(value)
	return nil
}

// Assertion step: "{field}" is "value"
func (pw *PropsWorld) fieldIs(field, value string) error {
	actual := pw.HandleResolve(field)
	expected := pw.HandleResolve(value)
	actualStr := fmt.Sprintf("%v", actual)
	expectedStr := fmt.Sprintf("%v", expected)
	if actualStr != expectedStr {
		return fmt.Errorf("expected %s to equal '%s', got '%s'", field, expectedStr, actualStr)
	}
	return nil
}

func (pw *PropsWorld) waitForPeriod(ms string) error {
	duration, err := strconv.Atoi(ms)
	if err != nil {
		return fmt.Errorf("invalid duration: %s", ms)
	}
	time.Sleep(time.Duration(duration) * time.Millisecond)
	return nil
}

// Async step implementations

func (pw *PropsWorld) iWaitForFunction(functionName string) error {
	jobName := "temp_" + functionName
	if err := pw.iStartJob(functionName, jobName); err != nil {
		return err
	}
	return pw.iWaitForJob(jobName)
}

func (pw *PropsWorld) iWaitForFunctionWithParameter(functionName, param1 string) error {
	jobName := "temp_" + functionName
	if err := pw.iStartJobWithParameter(functionName, param1, jobName); err != nil {
		return err
	}
	return pw.iWaitForJob(jobName)
}

func (pw *PropsWorld) iWaitForFunctionWithTwoParameters(functionName, param1, param2 string) error {
	jobName := "temp_" + functionName
	if err := pw.iStartJobWithTwoParameters(functionName, param1, param2, jobName); err != nil {
		return err
	}
	return pw.iWaitForJob(jobName)
}

func (pw *PropsWorld) iWaitForFunctionWithThreeParameters(functionName, param1, param2, param3 string) error {
	jobName := "temp_" + functionName
	if err := pw.iStartJobWithThreeParameters(functionName, param1, param2, param3, jobName); err != nil {
		return err
	}
	return pw.iWaitForJob(jobName)
}

func (pw *PropsWorld) iWaitForFunctionWithFourParameters(functionName, param1, param2, param3, param4 string) error {
	jobName := "temp_" + functionName
	if err := pw.iStartJobWithFourParameters(functionName, param1, param2, param3, param4, jobName); err != nil {
		return err
	}
	return pw.iWaitForJob(jobName)
}

func (pw *PropsWorld) iStartJob(functionName, jobName string) error {
	pw.AsyncManager.StartTask(jobName, func(ctx context.Context) (interface{}, error) {
		funcValue := pw.HandleResolve(functionName)
		if funcValue == nil {
			return nil, fmt.Errorf("function %s not found", functionName)
		}
		fn, ok := funcValue.(func() interface{})
		if !ok {
			// Try func()
			if fn0, ok2 := funcValue.(func()); ok2 {
				fn0()
				return nil, nil
			}
			return nil, fmt.Errorf("%s is not a callable function", functionName)
		}
		result := fn()
		if err, ok := result.(error); ok {
			return nil, err
		}
		return result, nil
	})
	return nil
}

func (pw *PropsWorld) iStartJobWithParameter(functionName, param1, jobName string) error {
	pw.AsyncManager.StartTask(jobName, func(ctx context.Context) (interface{}, error) {
		funcValue := pw.HandleResolve(functionName)
		if funcValue == nil {
			return nil, fmt.Errorf("function %s not found", functionName)
		}
		resolvedParam1 := pw.HandleResolve(param1)
		fn, ok := funcValue.(func(string) interface{})
		if !ok {
			return nil, fmt.Errorf("%s is not a callable function with 1 parameter", functionName)
		}
		result := fn(fmt.Sprintf("%v", resolvedParam1))
		if err, ok := result.(error); ok {
			return nil, err
		}
		return result, nil
	})
	return nil
}

func (pw *PropsWorld) iStartJobWithTwoParameters(functionName, param1, param2, jobName string) error {
	pw.AsyncManager.StartTask(jobName, func(ctx context.Context) (interface{}, error) {
		funcValue := pw.HandleResolve(functionName)
		if funcValue == nil {
			return nil, fmt.Errorf("function %s not found", functionName)
		}
		resolvedParam1 := pw.HandleResolve(param1)
		resolvedParam2 := pw.HandleResolve(param2)
		fn, ok := funcValue.(func(string, string) interface{})
		if !ok {
			return nil, fmt.Errorf("%s is not a callable function with 2 parameters", functionName)
		}
		result := fn(fmt.Sprintf("%v", resolvedParam1), fmt.Sprintf("%v", resolvedParam2))
		if err, ok := result.(error); ok {
			return nil, err
		}
		return result, nil
	})
	return nil
}

func (pw *PropsWorld) iStartJobWithThreeParameters(functionName, param1, param2, param3, jobName string) error {
	pw.AsyncManager.StartTask(jobName, func(ctx context.Context) (interface{}, error) {
		funcValue := pw.HandleResolve(functionName)
		if funcValue == nil {
			return nil, fmt.Errorf("function %s not found", functionName)
		}
		resolvedParam1 := pw.HandleResolve(param1)
		resolvedParam2 := pw.HandleResolve(param2)
		resolvedParam3 := pw.HandleResolve(param3)
		fn, ok := funcValue.(func(string, string, string) interface{})
		if !ok {
			return nil, fmt.Errorf("%s is not a callable function with 3 parameters", functionName)
		}
		result := fn(fmt.Sprintf("%v", resolvedParam1), fmt.Sprintf("%v", resolvedParam2), fmt.Sprintf("%v", resolvedParam3))
		if err, ok := result.(error); ok {
			return nil, err
		}
		return result, nil
	})
	return nil
}

func (pw *PropsWorld) iStartJobWithFourParameters(functionName, param1, param2, param3, param4, jobName string) error {
	pw.AsyncManager.StartTask(jobName, func(ctx context.Context) (interface{}, error) {
		funcValue := pw.HandleResolve(functionName)
		if funcValue == nil {
			return nil, fmt.Errorf("function %s not found", functionName)
		}
		resolvedParam1 := pw.HandleResolve(param1)
		resolvedParam2 := pw.HandleResolve(param2)
		resolvedParam3 := pw.HandleResolve(param3)
		resolvedParam4 := pw.HandleResolve(param4)
		fn, ok := funcValue.(func(string, string, string, string) interface{})
		if !ok {
			return nil, fmt.Errorf("%s is not a callable function with 4 parameters", functionName)
		}
		result := fn(fmt.Sprintf("%v", resolvedParam1), fmt.Sprintf("%v", resolvedParam2), fmt.Sprintf("%v", resolvedParam3), fmt.Sprintf("%v", resolvedParam4))
		if err, ok := result.(error); ok {
			return nil, err
		}
		return result, nil
	})
	return nil
}

func (pw *PropsWorld) iWaitForJob(jobName string) error {
	err := pw.AsyncManager.WaitForTask(jobName, 30*time.Second)
	if err != nil {
		pw.Props["result"] = err
		pw.Props[jobName] = err
		return nil
	}
	result, err := pw.AsyncManager.GetTaskResult(jobName)
	if err != nil {
		pw.Props["result"] = err
		pw.Props[jobName] = err
	} else {
		pw.Props["result"] = result
		pw.Props[jobName] = result
	}
	return nil
}

func (pw *PropsWorld) iWaitForJobWithTimeout(jobName, timeoutMs string) error {
	timeoutVal, err := strconv.Atoi(timeoutMs)
	if err != nil {
		return fmt.Errorf("invalid timeout: %s", timeoutMs)
	}
	timeout := time.Duration(timeoutVal) * time.Millisecond
	err = pw.AsyncManager.WaitForTask(jobName, timeout)
	if err != nil {
		pw.Props["result"] = err
		pw.Props[jobName] = err
		return nil
	}
	result, err := pw.AsyncManager.GetTaskResult(jobName)
	if err != nil {
		pw.Props["result"] = err
		pw.Props[jobName] = err
	} else {
		pw.Props["result"] = result
		pw.Props[jobName] = result
	}
	return nil
}

func (pw *PropsWorld) iWaitForFunctionWithTimeout(functionName, timeoutMs string) error {
	jobName := "temp_" + functionName
	if err := pw.iStartJob(functionName, jobName); err != nil {
		return err
	}
	return pw.iWaitForJobWithTimeout(jobName, timeoutMs)
}

// tableToMaps converts a godog table to a slice of maps (skipping header row)
func tableToMaps(table *godog.Table) []map[string]string {
	result := make([]map[string]string, len(table.Rows)-1)
	headers := make([]string, len(table.Rows[0].Cells))
	for i, cell := range table.Rows[0].Cells {
		headers[i] = cell.Value
	}
	for i := 1; i < len(table.Rows); i++ {
		row := make(map[string]string)
		for j, cell := range table.Rows[i].Cells {
			row[headers[j]] = cell.Value
		}
		result[i-1] = row
	}
	return result
}

// RegisterSteps registers all step definitions with the Godog suite
func (pw *PropsWorld) RegisterSteps(s *godog.ScenarioContext) {
	// Function call — direct
	s.Step(`^I call "([^"]*)"$`, pw.iCallFunction)
	s.Step(`^I call "([^"]*)" using argument "([^"]*)"$`, pw.iCallFunctionWithParameter)
	s.Step(`^I call "([^"]*)" using arguments "([^"]*)" and "([^"]*)"$`, pw.iCallFunctionWithTwoParameters)
	s.Step(`^I call "([^"]*)" using arguments "([^"]*)", "([^"]*)", and "([^"]*)"$`, pw.iCallFunctionWithThreeParameters)
	s.Step(`^I call "([^"]*)" using arguments "([^"]*)", "([^"]*)", "([^"]*)", and "([^"]*)"$`, pw.iCallFunctionWithFourParameters)

	// Function call — object methods
	s.Step(`^I call "([^"]*)" with "([^"]*)"$`, pw.iCallObjectWithMethod)
	s.Step(`^I call "([^"]*)" with "([^"]*)" using argument "([^"]*)"$`, pw.iCallObjectWithMethodWithParameter)
	s.Step(`^I call "([^"]*)" with "([^"]*)" using arguments "([^"]*)" and "([^"]*)"$`, pw.iCallObjectWithMethodWithTwoParameters)
	s.Step(`^I call "([^"]*)" with "([^"]*)" using arguments "([^"]*)", "([^"]*)", and "([^"]*)"$`, pw.iCallObjectWithMethodWithThreeParameters)
	s.Step(`^I call "([^"]*)" with "([^"]*)" using arguments "([^"]*)", "([^"]*)", "([^"]*)", and "([^"]*)"$`, pw.iCallObjectWithMethodWithFourParameters)

	// Variable management
	s.Step(`^I refer to "([^"]*)" as "([^"]*)"$`, pw.IReferToAs)

	// Array/object assertions
	s.Step(`^"([^"]*)" is an array of objects with the following contents$`, pw.fieldIsArrayOfObjectsWithContents)
	s.Step(`^"([^"]*)" is an array of objects with at least the following contents$`, pw.fieldIsArrayOfObjectsWithAtLeastContents)
	s.Step(`^"([^"]*)" is an array of objects which doesn't contain any of$`, pw.fieldIsArrayOfObjectsWhichDoesntContainAnyOf)
	s.Step(`^"([^"]*)" is an array of objects with length "([^"]*)"$`, pw.fieldIsArrayOfObjectsWithLength)
	s.Step(`^"([^"]*)" is an array of strings with the following values$`, pw.fieldIsArrayOfStringsWithValues)
	s.Step(`^"([^"]*)" is an object with the following contents$`, pw.fieldIsObjectWithContents)

	// Value assertions
	s.Step(`^"([^"]*)" is null$`, pw.fieldIsNil)
	s.Step(`^"([^"]*)" is nil$`, pw.fieldIsNil)
	s.Step(`^"([^"]*)" is undefined$`, pw.fieldIsNil)
	s.Step(`^"([^"]*)" is not null$`, pw.fieldIsNotNil)
	s.Step(`^"([^"]*)" is not nil$`, pw.fieldIsNotNil)
	s.Step(`^"([^"]*)" is true$`, pw.fieldIsTrue)
	s.Step(`^"([^"]*)" is false$`, pw.fieldIsFalse)
	s.Step(`^"([^"]*)" is empty$`, pw.fieldIsEmpty)
	s.Step(`^"([^"]*)" is "([^"]*)"$`, pw.fieldIs)
	s.Step(`^I set "([^"]*)" to "([^"]*)"$`, pw.iSetFieldTo)
	s.Step(`^"([^"]*)" is an error with message "([^"]*)"$`, pw.fieldIsErrorWithMessage)
	s.Step(`^"([^"]*)" is an error$`, pw.fieldIsError)
	s.Step(`^"([^"]*)" is not an error$`, pw.fieldIsNotError)
	s.Step(`^"([^"]*)" contains "([^"]*)"$`, pw.fieldContains)
	s.Step(`^"([^"]*)" is a string containing one of$`, pw.fieldIsStringContainingOneOf)
	s.Step(`^"([^"]*)" should be greater than "([^"]*)"$`, pw.fieldShouldBeGreaterThan)
	s.Step(`^"([^"]*)" should be less than "([^"]*)"$`, pw.fieldShouldBeLessThan)

	// Test setup
	s.Step(`^"([^"]*)" is a invocation counter into "([^"]*)"$`, pw.HandlerIsInvocationCounter)
	s.Step(`^"([^"]*)" is an async function returning "([^"]*)"$`, pw.IsAnAsyncFunctionReturning)
	s.Step(`^we wait for a period of "([^"]*)" ms$`, pw.waitForPeriod)

	// Async job — start
	s.Step(`^I start "([^"]*)" as "([^"]*)"$`, pw.iStartJob)
	s.Step(`^I start "([^"]*)" using argument "([^"]*)" as "([^"]*)"$`, pw.iStartJobWithParameter)
	s.Step(`^I start "([^"]*)" using arguments "([^"]*)" and "([^"]*)" as "([^"]*)"$`, pw.iStartJobWithTwoParameters)
	s.Step(`^I start "([^"]*)" using arguments "([^"]*)", "([^"]*)", and "([^"]*)" as "([^"]*)"$`, pw.iStartJobWithThreeParameters)
	s.Step(`^I start "([^"]*)" using arguments "([^"]*)", "([^"]*)", "([^"]*)", and "([^"]*)" as "([^"]*)"$`, pw.iStartJobWithFourParameters)

	// Async job — wait
	s.Step(`^I wait for job "([^"]*)"$`, pw.iWaitForJob)
	s.Step(`^I wait for job "([^"]*)" within "([^"]*)" ms$`, pw.iWaitForJobWithTimeout)

	// Async — direct function call
	s.Step(`^I wait for "([^"]*)"$`, pw.iWaitForFunction)
	s.Step(`^I wait for "([^"]*)" within "([^"]*)" ms$`, pw.iWaitForFunctionWithTimeout)
	s.Step(`^I wait for "([^"]*)" using argument "([^"]*)"$`, pw.iWaitForFunctionWithParameter)
	s.Step(`^I wait for "([^"]*)" using arguments "([^"]*)" and "([^"]*)"$`, pw.iWaitForFunctionWithTwoParameters)
	s.Step(`^I wait for "([^"]*)" using arguments "([^"]*)", "([^"]*)", and "([^"]*)"$`, pw.iWaitForFunctionWithThreeParameters)
	s.Step(`^I wait for "([^"]*)" using arguments "([^"]*)", "([^"]*)", "([^"]*)", and "([^"]*)"$`, pw.iWaitForFunctionWithFourParameters)
}
