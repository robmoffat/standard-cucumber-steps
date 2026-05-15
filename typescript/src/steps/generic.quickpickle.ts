import type { DataTable } from 'quickpickle';
import { expect } from 'expect';
import {
  doesRowMatch,
  handleResolve,
  matchData,
  matchDataAtLeast,
  matchDataDoesntContain
} from '../support/matching';
import { PropsWorldLike } from '../world/PropsWorldLike';
import { defaultQuickpickleBindings, type QuickpickleBindings } from '../quickpickleBindings';

export function setupGenericStepsQuickpickle(bindings?: QuickpickleBindings) {
  const { Given, When, Then, DataTable } = bindings ?? defaultQuickpickleBindings();

  // ========== Method Invocation (Object.method) Steps ==========

  When('I call {string} with {string}', async (world: PropsWorldLike, field: string, fnName: string) => {
    try {
      const object = handleResolve(field, world);
      const fn = object[fnName];
      const result = await fn.call(object);
      world.props['result'] = result;
    } catch (error) {
      world.props['result'] = error;
    }
  });

  When(
    'I call {string} with {string} using argument {string}',
    async (world: PropsWorldLike, field: string, fnName: string, param: string) => {
      try {
        const object = handleResolve(field, world);
        const fn = object[fnName];
        const result = await fn.call(object, handleResolve(param, world));
        world.props['result'] = result;
      } catch (error) {
        world.props['result'] = error;
      }
    }
  );

  When(
    'I call {string} with {string} using arguments {string} and {string}',
    async (world: PropsWorldLike, field: string, fnName: string, param1: string, param2: string) => {
      try {
        const object = handleResolve(field, world);
        const fn = object[fnName];
        const result = await fn.call(object, handleResolve(param1, world), handleResolve(param2, world));
        world.props['result'] = result;
      } catch (error) {
        world.props['result'] = error;
      }
    }
  );

  When(
    'I call {string} with {string} using arguments {string} and {string} and {string}',
    async (world: PropsWorldLike, field: string, fnName: string, param1: string, param2: string, param3: string) => {
      try {
        const object = handleResolve(field, world);
        const fn = object[fnName];
        const result = await fn.call(
          object,
          handleResolve(param1, world),
          handleResolve(param2, world),
          handleResolve(param3, world)
        );
        world.props['result'] = result;
      } catch (error) {
        world.props['result'] = error;
      }
    }
  );

  When(
    'I call {string} with {string} using arguments {string}, {string}, and {string}',
    async function (
      world: PropsWorldLike,
      field: string,
      fnName: string,
      param1: string,
      param2: string,
      param3: string
    ) {
      try {
        const object = handleResolve(field, world);
        const fn = object[fnName];
        const result = await fn.call(
          object,
          handleResolve(param1, world),
          handleResolve(param2, world),
          handleResolve(param3, world)
        );
        world.props['result'] = result;
      } catch (error) {
        world.props['result'] = error;
      }
    }
  );

  When(
    'I call {string} with {string} using arguments {string}, {string}, {string}, and {string}',
    async function (
      world: PropsWorldLike,
      field: string,
      fnName: string,
      param1: string,
      param2: string,
      param3: string,
      param4: string
    ) {
      try {
        const object = handleResolve(field, world);
        const fn = object[fnName];
        const result = await fn.call(
          object,
          handleResolve(param1, world),
          handleResolve(param2, world),
          handleResolve(param3, world),
          handleResolve(param4, world)
        );
        world.props['result'] = result;
      } catch (error) {
        world.props['result'] = error;
      }
    }
  );

  // ========== Direct Function Call Steps ==========

  When('I call {string}', async (world: PropsWorldLike, fnName: string) => {
    try {
      const fn = handleResolve(fnName, world);
      const result = await fn();
      world.props['result'] = result;
    } catch (error) {
      world.props['result'] = error;
    }
  });

  When(
    'I call {string} using argument {string}',
    async (world: PropsWorldLike, fnName: string, param: string) => {
      try {
        const fn = handleResolve(fnName, world);
        const result = await fn(handleResolve(param, world));
        world.props['result'] = result;
      } catch (error) {
        world.props['result'] = error;
      }
    }
  );

  When(
    'I call {string} using arguments {string} and {string}',
    async (world: PropsWorldLike, fnName: string, param1: string, param2: string) => {
      try {
        const fn = handleResolve(fnName, world);
        const result = await fn(handleResolve(param1, world), handleResolve(param2, world));
        world.props['result'] = result;
      } catch (error) {
        world.props['result'] = error;
      }
    }
  );

  When(
    'I call {string} using arguments {string}, {string}, and {string}',
    async (world: PropsWorldLike, fnName: string, param1: string, param2: string, param3: string) => {
      try {
        const fn = handleResolve(fnName, world);
        const result = await fn(
          handleResolve(param1, world),
          handleResolve(param2, world),
          handleResolve(param3, world)
        );
        world.props['result'] = result;
      } catch (error) {
        world.props['result'] = error;
      }
    }
  );

  When(
    'I call {string} using arguments {string}, {string}, {string}, and {string}',
    async (world: PropsWorldLike, fnName: string, param1: string, param2: string, param3: string, param4: string) => {
      try {
        const fn = handleResolve(fnName, world);
        const result = await fn(
          handleResolve(param1, world),
          handleResolve(param2, world),
          handleResolve(param3, world),
          handleResolve(param4, world)
        );
        world.props['result'] = result;
      } catch (error) {
        world.props['result'] = error;
      }
    }
  );

  // ========== Variable Reference ==========

  When('I refer to {string} as {string}', async (world: PropsWorldLike, from: string, to: string) => {
    world.props[to] = handleResolve(from, world);
  });

  // ========== Array Matching Steps ==========

  Then(
    '{string} is an array of objects with the following contents',
    (world: PropsWorldLike, field: string, dt: DataTable) => {
      matchData(world, handleResolve(field, world), dt);
    }
  );

  Then(
    '{string} is an array of objects with at least the following contents',
    (world: PropsWorldLike, field: string, dt: DataTable) => {
      matchDataAtLeast(world, handleResolve(field, world), dt);
    }
  );

  Then(
    "{string} is an array of objects which doesn't contain any of",
    (world: PropsWorldLike, field: string, dt: DataTable) => {
      matchDataDoesntContain(world, handleResolve(field, world), dt);
    }
  );

  Then(
    '{string} is an array of objects with length {string}',
    (world: PropsWorldLike, field: string, field2: string) => {
      expect(handleResolve(field, world).length).toEqual(Number.parseInt(handleResolve(field2, world)));
    }
  );

  Then(
    '{string} is an array of strings with the following values',
    (world: PropsWorldLike, field: string, dt: DataTable) => {
      const values = handleResolve(field, world).map((s: string) => {
        return { value: s };
      });
      matchData(world, values, dt);
    }
  );

  Then(
    '{string} is an object with the following contents',
    (world: PropsWorldLike, field: string, params: DataTable) => {
      const table = params.hashes();
      expect(doesRowMatch(world, table[0], handleResolve(field, world))).toBeTruthy();
    }
  );

  // ========== Value Assertions ==========

  Then('{string} is null', (world: PropsWorldLike, field: string) => {
    expect(handleResolve(field, world)).toBeNull();
  });

  Then('{string} is not null', (world: PropsWorldLike, field: string) => {
    expect(handleResolve(field, world)).toBeDefined();
  });

  Then('{string} is true', (world: PropsWorldLike, field: string) => {
    expect(handleResolve(field, world)).toBeTruthy();
  });

  Then('{string} is false', (world: PropsWorldLike, field: string) => {
    expect(handleResolve(field, world)).toBeFalsy();
  });

  Then('{string} is undefined', (world: PropsWorldLike, field: string) => {
    expect(handleResolve(field, world)).toBeUndefined();
  });

  Then('{string} is empty', (world: PropsWorldLike, field: string) => {
    expect(handleResolve(field, world)).toHaveLength(0);
  });

  // Setter step: Given I set "field" to "value"
  Given('I set {string} to {string}', (world: PropsWorldLike, field: string, value: string) => {
    world.props[field] = handleResolve(value, world);
  });

  // Assertion step: Then "{field}" is "value"
  Then('{string} is {string}', (world: PropsWorldLike, field: string, value: string) => {
    const actual = handleResolve(field, world);
    const expected = handleResolve(value, world);
    expect('' + actual).toEqual('' + expected);
  });

  // ========== Error Assertions ==========

  Then('{string} is an error with message {string}', (world: PropsWorldLike, field: string, errorType: string) => {
    expect(handleResolve(field, world)['message']).toBe(errorType);
  });

  Then('{string} is an error', (world: PropsWorldLike, field: string) => {
    expect(handleResolve(field, world)).toBeInstanceOf(Error);
  });

  Then('{string} is not an error', (world: PropsWorldLike, field: string) => {
    expect(handleResolve(field, world)).not.toBeInstanceOf(Error);
  });

  Then('{string} contains {string}', (world: PropsWorldLike, field: string, sub: string) => {
    expect(String(handleResolve(field, world))).toContain(sub);
  });

  Then(
    '{string} is a string containing one of',
    (world: PropsWorldLike, field: string, dt: DataTable) => {
      const str = String(handleResolve(field, world));
      const values = dt.rows().map(r => r[0]);
      expect(values.some(v => str.includes(v))).toBeTruthy();
    }
  );

  Then('{string} should be greater than {string}', (world: PropsWorldLike, field: string, threshold: string) => {
    const actual = Number(handleResolve(field, world));
    const thresh = Number(handleResolve(threshold, world));
    expect(actual).toBeGreaterThan(thresh);
  });

  Then('{string} should be less than {string}', (world: PropsWorldLike, field: string, threshold: string) => {
    const actual = Number(handleResolve(field, world));
    const thresh = Number(handleResolve(threshold, world));
    expect(actual).toBeLessThan(thresh);
  });

  // ========== Test Setup ==========

  Given(
    '{string} is a invocation counter into {string}',
    (world: PropsWorldLike, handlerName: string, field: string) => {
      world.props[field] = 0;
      world.props[handlerName] = () => {
        var amount: number = world.props[field];
        amount++;
        world.props[field] = amount;
      };
    }
  );

  Given(
    '{string} is an async function returning {string}',
    (world: PropsWorldLike, fnName: string, field: string) => {
      const value = handleResolve(field, world);
      world.props[fnName] = async () => {
        return value;
      };
    }
  );

  Given(
    '{string} is an async function returning {string} after {string} ms',
    (world: PropsWorldLike, fnName: string, field: string, delayMs: string) => {
      const value = handleResolve(field, world);
      const delay = parseInt(delayMs);
      world.props[fnName] = async () => {
        await new Promise(resolve => setTimeout(resolve, delay));
        return value;
      };
    }
  );

  Given('we wait for a period of {string} ms', (world: PropsWorldLike, ms: string) => {
    return new Promise<void>((resolve, _reject) => {
      setTimeout(() => resolve(), parseInt(ms));
    });
  });

  // ========== Async Job Steps ==========

  When(
    'I start {string} as {string}',
    async (world: PropsWorldLike, fnName: string, jobName: string) => {
      const jobs: Map<string, Promise<any>> = world.props['_jobs'] ?? new Map();
      world.props['_jobs'] = jobs;
      const fn = handleResolve(fnName, world);
      jobs.set(jobName, Promise.resolve().then(() => fn()));
    }
  );

  When(
    'I start {string} using argument {string} as {string}',
    async (world: PropsWorldLike, fnName: string, param: string, jobName: string) => {
      const jobs: Map<string, Promise<any>> = world.props['_jobs'] ?? new Map();
      world.props['_jobs'] = jobs;
      const fn = handleResolve(fnName, world);
      const p = handleResolve(param, world);
      jobs.set(jobName, Promise.resolve().then(() => fn(p)));
    }
  );

  When(
    'I start {string} using arguments {string} and {string} as {string}',
    async (world: PropsWorldLike, fnName: string, param1: string, param2: string, jobName: string) => {
      const jobs: Map<string, Promise<any>> = world.props['_jobs'] ?? new Map();
      world.props['_jobs'] = jobs;
      const fn = handleResolve(fnName, world);
      const p1 = handleResolve(param1, world);
      const p2 = handleResolve(param2, world);
      jobs.set(jobName, Promise.resolve().then(() => fn(p1, p2)));
    }
  );

  When(
    'I start {string} using arguments {string}, {string}, and {string} as {string}',
    async (world: PropsWorldLike, fnName: string, param1: string, param2: string, param3: string, jobName: string) => {
      const jobs: Map<string, Promise<any>> = world.props['_jobs'] ?? new Map();
      world.props['_jobs'] = jobs;
      const fn = handleResolve(fnName, world);
      const p1 = handleResolve(param1, world);
      const p2 = handleResolve(param2, world);
      const p3 = handleResolve(param3, world);
      jobs.set(jobName, Promise.resolve().then(() => fn(p1, p2, p3)));
    }
  );

  When(
    'I start {string} using arguments {string}, {string}, {string}, and {string} as {string}',
    async (world: PropsWorldLike, fnName: string, param1: string, param2: string, param3: string, param4: string, jobName: string) => {
      const jobs: Map<string, Promise<any>> = world.props['_jobs'] ?? new Map();
      world.props['_jobs'] = jobs;
      const fn = handleResolve(fnName, world);
      const p1 = handleResolve(param1, world);
      const p2 = handleResolve(param2, world);
      const p3 = handleResolve(param3, world);
      const p4 = handleResolve(param4, world);
      jobs.set(jobName, Promise.resolve().then(() => fn(p1, p2, p3, p4)));
    }
  );

  Then(
    'I wait for job {string}',
    async (world: PropsWorldLike, jobName: string) => {
      const jobs: Map<string, Promise<any>> = world.props['_jobs'] ?? new Map();
      try {
        const result = await jobs.get(jobName);
        world.props['result'] = result;
        world.props[jobName] = result;
      } catch (error) {
        world.props['result'] = error;
        world.props[jobName] = error;
      }
    }
  );

  Then(
    'I wait for job {string} within {string} ms',
    async (world: PropsWorldLike, jobName: string, timeoutMs: string) => {
      const jobs: Map<string, Promise<any>> = world.props['_jobs'] ?? new Map();
      const ms = parseInt(timeoutMs);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Job ${jobName} timed out after ${ms}ms`)), ms)
      );
      try {
        const result = await Promise.race([jobs.get(jobName), timeoutPromise]);
        world.props['result'] = result;
        world.props[jobName] = result;
      } catch (error) {
        world.props['result'] = error;
        world.props[jobName] = error;
      }
    }
  );

  When('I wait for {string}', async (world: PropsWorldLike, fnName: string) => {
    const fn = handleResolve(fnName, world);
    try {
      const result = await fn();
      world.props['result'] = result;
    } catch (error) {
      world.props['result'] = error;
    }
  });

  When(
    'I wait for {string} within {string} ms',
    async (world: PropsWorldLike, fnName: string, timeoutMs: string) => {
      const fn = handleResolve(fnName, world);
      const ms = parseInt(timeoutMs);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
      );
      try {
        const result = await Promise.race([fn(), timeoutPromise]);
        world.props['result'] = result;
      } catch (error) {
        world.props['result'] = error;
      }
    }
  );

  When(
    'I wait for {string} using argument {string}',
    async (world: PropsWorldLike, fnName: string, param: string) => {
      const fn = handleResolve(fnName, world);
      try {
        const result = await fn(handleResolve(param, world));
        world.props['result'] = result;
      } catch (error) {
        world.props['result'] = error;
      }
    }
  );

  When(
    'I wait for {string} using arguments {string} and {string}',
    async (world: PropsWorldLike, fnName: string, param1: string, param2: string) => {
      const fn = handleResolve(fnName, world);
      try {
        const result = await fn(handleResolve(param1, world), handleResolve(param2, world));
        world.props['result'] = result;
      } catch (error) {
        world.props['result'] = error;
      }
    }
  );

  When(
    'I wait for {string} using arguments {string}, {string}, and {string}',
    async (world: PropsWorldLike, fnName: string, param1: string, param2: string, param3: string) => {
      const fn = handleResolve(fnName, world);
      try {
        const result = await fn(handleResolve(param1, world), handleResolve(param2, world), handleResolve(param3, world));
        world.props['result'] = result;
      } catch (error) {
        world.props['result'] = error;
      }
    }
  );

  When(
    'I wait for {string} using arguments {string}, {string}, {string}, and {string}',
    async (world: PropsWorldLike, fnName: string, param1: string, param2: string, param3: string, param4: string) => {
      const fn = handleResolve(fnName, world);
      try {
        const result = await fn(
          handleResolve(param1, world),
          handleResolve(param2, world),
          handleResolve(param3, world),
          handleResolve(param4, world)
        );
        world.props['result'] = result;
      } catch (error) {
        world.props['result'] = error;
      }
    }
  );
}
