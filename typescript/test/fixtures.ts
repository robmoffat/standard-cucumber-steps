import type { PropsWorldLike } from '../src/world/PropsWorldLike';

/** Per-scenario props used by the shared feature files under ../features. */
export function registerScenarioFixtures(world: PropsWorldLike): void {
  world.props['sampleArray'] = [
    { name: 'Alice', value: 100 },
    { name: 'Bob', value: 200 },
  ];
  world.props['sampleStringArray'] = ['one', 'two', 'three'];
  world.props['sampleEmptyArray'] = [];
  world.props['sampleObject'] = { name: 'John', age: 30 };

  world.props['singleArgFn'] = async (arg: unknown) => arg;
  world.props['twoArgFn'] = async (a: unknown, b: unknown) => String(a) + String(b);
  world.props['threeArgConcatFn'] = async (a: unknown, b: unknown, c: unknown) =>
    String(a) + String(b) + String(c);
  world.props['fourArgConcatFn'] = async (a: unknown, b: unknown, c: unknown, d: unknown) =>
    String(a) + String(b) + String(c) + String(d);

  world.props['errorThrowingFn'] = (..._args: unknown[]) => {
    throw new Error('Test error message');
  };
  world.props['errorWithArgFn'] = (_a: unknown) => {
    throw new Error('Test error message');
  };
  world.props['errorWith2ArgsFn'] = (_a: unknown, _b: unknown) => {
    throw new Error('Test error message');
  };
  world.props['errorWith3ArgsFn'] = (_a: unknown, _b: unknown, _c: unknown) => {
    throw new Error('Test error message');
  };
  world.props['errorWith4ArgsFn'] = (_a: unknown, _b: unknown, _c: unknown, _d: unknown) => {
    throw new Error('Test error message');
  };

  world.props['testCalculator'] = {
    value: 42,
    GetValue: function (this: { value: number }) {
      return this.value;
    },
    Add: function (this: { value: number }, n: number) {
      return this.value + n;
    },
    Multiply: function (a: number, b: number) {
      return a * b;
    },
    Sum3: function (a: number, b: number, c: number) {
      return a + b + c;
    },
    Sum4: function (a: number, b: number, c: number, d: number) {
      return a + b + c + d;
    },
  };

  world.props['nestedObject'] = {
    name: 'parent',
    level1: {
      level2: 'deep-value',
    },
  };

  world.props['arrayWithObjects'] = [
    { id: '1', name: 'first' },
    { id: '2', name: 'second' },
    { id: '3', name: 'third' },
  ];

  world.props['deeplyNested'] = {
    a: {
      b: {
        c: {
          d: 'found',
        },
      },
    },
  };

  world.props['userArray'] = [
    { name: 'Alice', address: { city: 'New York', zip: '10001' } },
    { name: 'Bob', address: { city: 'Los Angeles', zip: '90001' } },
  ];

  world.props['typedValues'] = {
    count: 42,
    price: 9.99,
    active: true,
    deleted: false,
    label: 'hello',
    nested: { score: 100, enabled: true },
  };

  world.props['contactRecord'] = {
    id: '1',
    user: { email: 'alice@example.com', role: 'admin' },
  };
  world.props['contactRecordList'] = [
    world.props['contactRecord'],
    { id: '2', user: { email: 'bob@example.com', role: 'user' } },
  ];
}
