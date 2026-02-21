import { Before, setWorldConstructor } from '@cucumber/cucumber';
import { PropsWorld } from '../world';
import { setupGenericSteps } from '../steps/generic.steps';

setWorldConstructor(PropsWorld);
setupGenericSteps();

// Setup test fixtures before each scenario
Before(function (this: PropsWorld) {
    // Sample arrays for array assertion tests
    this.props['sampleArray'] = [
        { name: 'Alice', value: 100 },
        { name: 'Bob', value: 200 }
    ];
    this.props['sampleStringArray'] = ['one', 'two', 'three'];
    this.props['sampleEmptyArray'] = [];
    this.props['sampleObject'] = { name: 'John', age: 30 };

    // Functions with parameters for method call tests
    this.props['singleArgFn'] = async (arg: any) => arg;
    this.props['twoArgFn'] = async (a: any, b: any) => String(a) + String(b);
    this.props['threeArgConcatFn'] = async (a: any, b: any, c: any) => String(a) + String(b) + String(c);
    this.props['fourArgConcatFn'] = async (a: any, b: any, c: any, d: any) => String(a) + String(b) + String(c) + String(d);

    // Error throwing function for error assertion tests (accepts any args)
    this.props['errorThrowingFn'] = (..._args: any[]) => {
        throw new Error('Test error message');
    };
    // Error functions with specific arg counts (for cross-platform compatibility)
    this.props['errorWithArgFn'] = (_a: any) => { throw new Error('Test error message'); };
    this.props['errorWith2ArgsFn'] = (_a: any, _b: any) => { throw new Error('Test error message'); };
    this.props['errorWith3ArgsFn'] = (_a: any, _b: any, _c: any) => { throw new Error('Test error message'); };
    this.props['errorWith4ArgsFn'] = (_a: any, _b: any, _c: any, _d: any) => { throw new Error('Test error message'); };

    // Test calculator object for method invocation tests
    this.props['testCalculator'] = {
        value: 42,
        GetValue: function () { return this.value; },
        Add: function (n: number) { return this.value + n; },
        Multiply: function (a: number, b: number) { return a * b; },
        Sum3: function (a: number, b: number, c: number) { return a + b + c; },
        Sum4: function (a: number, b: number, c: number, d: number) { return a + b + c + d; }
    };

    // Nested objects for JSONPath tests
    this.props['nestedObject'] = {
        name: 'parent',
        level1: {
            level2: 'deep-value'
        }
    };

    this.props['arrayWithObjects'] = [
        { id: '1', name: 'first' },
        { id: '2', name: 'second' },
        { id: '3', name: 'third' }
    ];

    this.props['deeplyNested'] = {
        a: {
            b: {
                c: {
                    d: 'found'
                }
            }
        }
    };

    this.props['userArray'] = [
        { name: 'Alice', address: { city: 'New York', zip: '10001' } },
        { name: 'Bob', address: { city: 'Los Angeles', zip: '90001' } }
    ];
});
