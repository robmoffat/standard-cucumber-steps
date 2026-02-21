import { DataTable, Given, Then, When, setWorldConstructor } from '@cucumber/cucumber';
import { expect } from 'expect';
import {
  doesRowMatch,
  handleResolve,
  matchData,
  matchDataAtLeast,
  matchDataDoesntContain
} from '../support/matching';
import { PropsWorld } from '../world';

export function setupGenericSteps() {
  // ========== Promise Resolution Steps ==========

  Then('the promise {string} should resolve', async function (this: PropsWorld, field: string) {
    try {
      const fn = handleResolve(field, this);
      const promise = typeof fn === 'function' ? fn() : fn;
      const object = await promise;
      this.props['result'] = object;
    } catch (error) {
      this.props['result'] = error;
    }
  });

  Then(
    'the promise {string} should resolve within 10 seconds',
    { timeout: 10 * 1000 },
    async function (this: PropsWorld, field: string) {
      try {
        const fn = handleResolve(field, this);
        const promise = typeof fn === 'function' ? fn() : fn;
        const object = await promise;
        this.props['result'] = object;
      } catch (error) {
        this.props['result'] = error;
      }
    }
  );

  // ========== Method Invocation (Object.method) Steps ==========

  When('I call {string} with {string}', async function (this: PropsWorld, field: string, fnName: string) {
    try {
      const object = handleResolve(field, this);
      const fn = object[fnName];
      const result = await fn.call(object);
      this.props['result'] = result;
    } catch (error) {
      this.props['result'] = error;
    }
  });

  When(
    'I call {string} with {string} with parameter {string}',
    async function (this: PropsWorld, field: string, fnName: string, param: string) {
      try {
        const object = handleResolve(field, this);
        const fn = object[fnName];
        const result = await fn.call(object, handleResolve(param, this));
        this.props['result'] = result;
      } catch (error) {
        this.props['result'] = error;
      }
    }
  );

  When(
    'I call {string} with {string} with parameters {string} and {string}',
    async function (this: PropsWorld, field: string, fnName: string, param1: string, param2: string) {
      try {
        const object = handleResolve(field, this);
        const fn = object[fnName];
        const result = await fn.call(object, handleResolve(param1, this), handleResolve(param2, this));
        this.props['result'] = result;
      } catch (error) {
        this.props['result'] = error;
      }
    }
  );

  When(
    'I call {string} with {string} with parameters {string} and {string} and {string}',
    async function (
      this: PropsWorld,
      field: string,
      fnName: string,
      param1: string,
      param2: string,
      param3: string
    ) {
      try {
        const object = handleResolve(field, this);
        const fn = object[fnName];
        const result = await fn.call(
          object,
          handleResolve(param1, this),
          handleResolve(param2, this),
          handleResolve(param3, this)
        );
        this.props['result'] = result;
      } catch (error) {
        this.props['result'] = error;
      }
    }
  );

  // ========== Direct Function Call Steps ==========

  When('I call {string}', async function (this: PropsWorld, fnName: string) {
    try {
      const fn = handleResolve(fnName, this);
      const result = await fn();
      this.props['result'] = result;
    } catch (error) {
      this.props['result'] = error;
    }
  });

  When(
    'I call {string} with parameter {string}',
    async function (this: PropsWorld, fnName: string, param: string) {
      try {
        const fn = handleResolve(fnName, this);
        const result = await fn(handleResolve(param, this));
        this.props['result'] = result;
      } catch (error) {
        this.props['result'] = error;
      }
    }
  );

  When(
    'I call {string} with parameters {string} and {string}',
    async function (this: PropsWorld, fnName: string, param1: string, param2: string) {
      try {
        const fn = handleResolve(fnName, this);
        const result = await fn(handleResolve(param1, this), handleResolve(param2, this));
        this.props['result'] = result;
      } catch (error) {
        this.props['result'] = error;
      }
    }
  );

  When(
    'I call {string} with parameters {string} and {string} and {string}',
    async function (this: PropsWorld, fnName: string, param1: string, param2: string, param3: string) {
      try {
        const fn = handleResolve(fnName, this);
        const result = await fn(
          handleResolve(param1, this),
          handleResolve(param2, this),
          handleResolve(param3, this)
        );
        this.props['result'] = result;
      } catch (error) {
        this.props['result'] = error;
      }
    }
  );

  // ========== Variable Reference ==========

  When('I refer to {string} as {string}', async function (this: PropsWorld, from: string, to: string) {
    this.props[to] = handleResolve(from, this);
  });

  // ========== Array Matching Steps ==========

  Then(
    '{string} is an array of objects with the following contents',
    function (this: PropsWorld, field: string, dt: DataTable) {
      matchData(this, handleResolve(field, this), dt);
    }
  );

  Then(
    '{string} is an array of objects with at least the following contents',
    function (this: PropsWorld, field: string, dt: DataTable) {
      matchDataAtLeast(this, handleResolve(field, this), dt);
    }
  );

  Then(
    "{string} is an array of objects which doesn't contain any of",
    function (this: PropsWorld, field: string, dt: DataTable) {
      matchDataDoesntContain(this, handleResolve(field, this), dt);
    }
  );

  Then(
    '{string} is an array of objects with length {string}',
    function (this: PropsWorld, field: string, field2: string) {
      expect(handleResolve(field, this).length).toEqual(Number.parseInt(handleResolve(field2, this)));
    }
  );

  Then(
    '{string} is an array of strings with the following values',
    function (this: PropsWorld, field: string, dt: DataTable) {
      const values = handleResolve(field, this).map((s: string) => {
        return { value: s };
      });
      matchData(this, values, dt);
    }
  );

  Then(
    '{string} is an object with the following contents',
    function (this: PropsWorld, field: string, params: DataTable) {
      const table = params.hashes();
      expect(doesRowMatch(this, table[0], handleResolve(field, this))).toBeTruthy();
    }
  );

  // ========== Value Assertions ==========

  Then('{string} is null', function (this: PropsWorld, field: string) {
    expect(handleResolve(field, this)).toBeNull();
  });

  Then('{string} is not null', function (this: PropsWorld, field: string) {
    expect(handleResolve(field, this)).toBeDefined();
  });

  Then('{string} is true', function (this: PropsWorld, field: string) {
    expect(handleResolve(field, this)).toBeTruthy();
  });

  Then('{string} is false', function (this: PropsWorld, field: string) {
    expect(handleResolve(field, this)).toBeFalsy();
  });

  Then('{string} is undefined', function (this: PropsWorld, field: string) {
    expect(handleResolve(field, this)).toBeUndefined();
  });

  Then('{string} is empty', function (this: PropsWorld, field: string) {
    expect(handleResolve(field, this)).toHaveLength(0);
  });

  Given('{string} is {string}', function (this: PropsWorld, field: string, value: string) {
    const resolved = handleResolve(value, this);
    if (field.startsWith('{') && field.endsWith('}')) {
      // Assertion mode: Then "{count}" is "3"
      const fVal = handleResolve(field, this);
      expect('' + fVal).toEqual('' + resolved);
    } else {
      // Setter mode: Given "greeting" is "hello world"
      this.props[field] = resolved;
    }
  });

  // ========== Error Assertions ==========

  Then('{string} is an error with message {string}', function (this: PropsWorld, field: string, errorType: string) {
    expect(handleResolve(field, this)['message']).toBe(errorType);
  });

  Then('{string} is an error', function (this: PropsWorld, field: string) {
    expect(handleResolve(field, this)).toBeInstanceOf(Error);
  });

  Then('{string} is not an error', function (this: PropsWorld, field: string) {
    expect(handleResolve(field, this)).not.toBeInstanceOf(Error);
  });

  Then('{string} contains {string}', function (this: PropsWorld, field: string, sub: string) {
    expect(String(handleResolve(field, this))).toContain(sub);
  });

  Then(
    '{string} is a string containing one of',
    function (this: PropsWorld, field: string, dt: DataTable) {
      const str = String(handleResolve(field, this));
      const values = dt.rows().map(r => r[0]);
      expect(values.some(v => str.includes(v))).toBeTruthy();
    }
  );

  Then('{string} should be greater than {string}', function (this: PropsWorld, field: string, threshold: string) {
    const actual = Number(handleResolve(field, this));
    const thresh = Number(handleResolve(threshold, this));
    expect(actual).toBeGreaterThan(thresh);
  });

  Then('{string} should be less than {string}', function (this: PropsWorld, field: string, threshold: string) {
    const actual = Number(handleResolve(field, this));
    const thresh = Number(handleResolve(threshold, this));
    expect(actual).toBeLessThan(thresh);
  });

  // ========== Test Setup ==========

  Given(
    '{string} is a invocation counter into {string}',
    function (this: PropsWorld, handlerName: string, field: string) {
      this.props[field] = 0;
      this.props[handlerName] = () => {
        var amount: number = this.props[field];
        amount++;
        this.props[field] = amount;
      };
    }
  );

  Given(
    '{string} is a function which returns a promise of {string}',
    function (this: PropsWorld, fnName: string, field: string) {
      const value = handleResolve(field, this);
      this.props[fnName] = async () => {
        return value;
      };
    }
  );

  Given('we wait for a period of {string} ms', function (this: PropsWorld, ms: string) {
    return new Promise<void>((resolve, _reject) => {
      setTimeout(() => resolve(), parseInt(ms));
    });
  });

  // ========== Async Task Steps ==========

  When(
    'I start task {string} by calling {string}',
    async function (this: PropsWorld, taskName: string, fnName: string) {
      const tasks: Map<string, Promise<any>> = this.props['_tasks'] ?? new Map();
      this.props['_tasks'] = tasks;
      const fn = handleResolve(fnName, this);
      tasks.set(taskName, Promise.resolve().then(() => fn()));
    }
  );

  When(
    'I start task {string} by calling {string} with parameter {string}',
    async function (this: PropsWorld, taskName: string, fnName: string, param: string) {
      const tasks: Map<string, Promise<any>> = this.props['_tasks'] ?? new Map();
      this.props['_tasks'] = tasks;
      const fn = handleResolve(fnName, this);
      const p = handleResolve(param, this);
      tasks.set(taskName, Promise.resolve().then(() => fn(p)));
    }
  );

  When(
    'I start task {string} by calling {string} with parameters {string} and {string}',
    async function (this: PropsWorld, taskName: string, fnName: string, param1: string, param2: string) {
      const tasks: Map<string, Promise<any>> = this.props['_tasks'] ?? new Map();
      this.props['_tasks'] = tasks;
      const fn = handleResolve(fnName, this);
      const p1 = handleResolve(param1, this);
      const p2 = handleResolve(param2, this);
      tasks.set(taskName, Promise.resolve().then(() => fn(p1, p2)));
    }
  );

  Then(
    'I wait for task {string} to complete',
    async function (this: PropsWorld, taskName: string) {
      const tasks: Map<string, Promise<any>> = this.props['_tasks'] ?? new Map();
      try {
        const result = await tasks.get(taskName);
        this.props['result'] = result;
        this.props[taskName] = result;
      } catch (error) {
        this.props['result'] = error;
        this.props[taskName] = error;
      }
    }
  );

  Then(
    'I wait for task {string} to complete within {string} ms',
    async function (this: PropsWorld, taskName: string, timeoutMs: string) {
      const tasks: Map<string, Promise<any>> = this.props['_tasks'] ?? new Map();
      const ms = parseInt(timeoutMs);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Task ${taskName} timed out after ${ms}ms`)), ms)
      );
      try {
        const result = await Promise.race([tasks.get(taskName), timeoutPromise]);
        this.props['result'] = result;
        this.props[taskName] = result;
      } catch (error) {
        this.props['result'] = error;
        this.props[taskName] = error;
      }
    }
  );

  When('I wait for {string}', async function (this: PropsWorld, fnName: string) {
    const fn = handleResolve(fnName, this);
    try {
      const result = await fn();
      this.props['result'] = result;
    } catch (error) {
      this.props['result'] = error;
    }
  });

  When(
    'I wait for {string} with parameter {string}',
    async function (this: PropsWorld, fnName: string, param: string) {
      const fn = handleResolve(fnName, this);
      try {
        const result = await fn(handleResolve(param, this));
        this.props['result'] = result;
      } catch (error) {
        this.props['result'] = error;
      }
    }
  );

  When(
    'I wait for {string} with parameters {string} and {string}',
    async function (this: PropsWorld, fnName: string, param1: string, param2: string) {
      const fn = handleResolve(fnName, this);
      try {
        const result = await fn(handleResolve(param1, this), handleResolve(param2, this));
        this.props['result'] = result;
      } catch (error) {
        this.props['result'] = error;
      }
    }
  );
}
