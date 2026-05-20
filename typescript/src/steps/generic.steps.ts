import { expect } from 'expect';
import {
  doesRowMatch,
  handleResolve,
  matchData,
  matchDataAtLeast,
  matchDataDoesntContain,
  type DataTableLike,
} from '../support/matching';
import { PropsWorldLike } from '../world/PropsWorldLike';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StepFn = (pattern: string, fn: (...args: any[]) => any) => void;

/** Step registrars shared by cucumber-js and quickpickle. */
export interface StepRegistrarBindings {
  Given: StepFn;
  When: StepFn;
  Then: StepFn;
  wrapStep: (fn: (world: PropsWorldLike, ...args: any[]) => any) => (this: unknown, ...args: any[]) => any;
}

export function getJobsMap(world: PropsWorldLike): Map<string, Promise<unknown>> {
  const jobs: Map<string, Promise<unknown>> = world.props['_jobs'] ?? new Map();
  world.props['_jobs'] = jobs;
  return jobs;
}

function startMethodJob(
  world: PropsWorldLike,
  jobName: string,
  field: string,
  fnName: string,
  params: string[] = []
) {
  const jobs = getJobsMap(world);
  jobs.set(
    jobName,
    Promise.resolve().then(async () => {
      const object = handleResolve(field, world);
      const fn = object[fnName];
      const resolved = params.map(p => handleResolve(p, world));
      return fn.call(object, ...resolved);
    })
  );
}

/** Registers generic steps with the consumer's Given/When/Then (pass the same module instance your runner uses). */
export function setupGenericSteps(bindings: StepRegistrarBindings) {
  const { Given, When, Then, wrapStep } = bindings;
  type DataTable = DataTableLike;

  // ========== Method Invocation (Object.method) Steps ==========

  When('I call {string} with {string}', wrapStep(async (world: PropsWorldLike, field: string, fnName: string) => {
    try {
      const object = handleResolve(field, world);
      const fn = object[fnName];
      const result = await fn.call(object);
      world.props['result'] = result;
    } catch (error) {
      world.props['result'] = error;
    }
  }));

  When(
    'I call {string} with {string} using argument {string}',
    wrapStep(async (world: PropsWorldLike, field: string, fnName: string, param: string) => {
      try {
        const object = handleResolve(field, world);
        const fn = object[fnName];
        const result = await fn.call(object, handleResolve(param, world));
        world.props['result'] = result;
      } catch (error) {
        world.props['result'] = error;
      }
    })
  );

  When(
    'I call {string} with {string} using arguments {string} and {string}',
    wrapStep(async (world: PropsWorldLike, field: string, fnName: string, param1: string, param2: string) => {
      try {
        const object = handleResolve(field, world);
        const fn = object[fnName];
        const result = await fn.call(object, handleResolve(param1, world), handleResolve(param2, world));
        world.props['result'] = result;
      } catch (error) {
        world.props['result'] = error;
      }
    })
  );

  When(
    'I call {string} with {string} using arguments {string}, {string}, and {string}',
    wrapStep(
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
    )
  );

  When(
    'I call {string} with {string} using arguments {string}, {string}, {string}, and {string}',
    wrapStep(
      async (
        world: PropsWorldLike,
        field: string,
        fnName: string,
        param1: string,
        param2: string,
        param3: string,
        param4: string
      ) => {
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
    )
  );

  When(
    'I call {string} with {string} as {string}',
    wrapStep((world: PropsWorldLike, field: string, fnName: string, jobName: string) => {
      startMethodJob(world, jobName, field, fnName);
    })
  );

  When(
    'I call {string} with {string} using argument {string} as {string}',
    wrapStep((world: PropsWorldLike, field: string, fnName: string, param: string, jobName: string) => {
      startMethodJob(world, jobName, field, fnName, [param]);
    })
  );

  When(
    'I call {string} with {string} using arguments {string} and {string} as {string}',
    wrapStep(
      (world: PropsWorldLike, field: string, fnName: string, param1: string, param2: string, jobName: string) => {
        startMethodJob(world, jobName, field, fnName, [param1, param2]);
      }
    )
  );

  When(
    'I call {string} with {string} using arguments {string}, {string}, and {string} as {string}',
    wrapStep(
      (
        world: PropsWorldLike,
        field: string,
        fnName: string,
        param1: string,
        param2: string,
        param3: string,
        jobName: string
      ) => {
        startMethodJob(world, jobName, field, fnName, [param1, param2, param3]);
      }
    )
  );

  When(
    'I call {string} with {string} using arguments {string}, {string}, {string}, and {string} as {string}',
    wrapStep(
      (
        world: PropsWorldLike,
        field: string,
        fnName: string,
        param1: string,
        param2: string,
        param3: string,
        param4: string,
        jobName: string
      ) => {
        startMethodJob(world, jobName, field, fnName, [param1, param2, param3, param4]);
      }
    )
  );

  // ========== Direct Function Call Steps ==========

  When('I call {string}', wrapStep(async (world: PropsWorldLike, fnName: string) => {
    try {
      const fn = handleResolve(fnName, world);
      const result = await fn();
      world.props['result'] = result;
    } catch (error) {
      world.props['result'] = error;
    }
  }));

  When(
    'I call {string} using argument {string}',
    wrapStep(async (world: PropsWorldLike, fnName: string, param: string) => {
      try {
        const fn = handleResolve(fnName, world);
        const result = await fn(handleResolve(param, world));
        world.props['result'] = result;
      } catch (error) {
        world.props['result'] = error;
      }
    })
  );

  When(
    'I call {string} using arguments {string} and {string}',
    wrapStep(async (world: PropsWorldLike, fnName: string, param1: string, param2: string) => {
      try {
        const fn = handleResolve(fnName, world);
        const result = await fn(handleResolve(param1, world), handleResolve(param2, world));
        world.props['result'] = result;
      } catch (error) {
        world.props['result'] = error;
      }
    })
  );

  When(
    'I call {string} using arguments {string}, {string}, and {string}',
    wrapStep(async (world: PropsWorldLike, fnName: string, param1: string, param2: string, param3: string) => {
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
    })
  );

  When(
    'I call {string} using arguments {string}, {string}, {string}, and {string}',
    wrapStep(async (world: PropsWorldLike, fnName: string, param1: string, param2: string, param3: string, param4: string) => {
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
    })
  );

  // ========== Variable Reference ==========

  When('I refer to {string} as {string}', wrapStep(async (world: PropsWorldLike, from: string, to: string) => {
    world.props[to] = handleResolve(from, world);
  }));

  // ========== Array Matching Steps ==========

  Then(
    '{string} is an array of objects with the following contents',
    wrapStep((world: PropsWorldLike, field: string, dt: DataTable) => {
      matchData(world, handleResolve(field, world), dt);
    })
  );

  Then(
    '{string} is an array of objects with at least the following contents',
    wrapStep((world: PropsWorldLike, field: string, dt: DataTable) => {
      matchDataAtLeast(world, handleResolve(field, world), dt);
    })
  );

  Then(
    "{string} is an array of objects which doesn't contain any of",
    wrapStep((world: PropsWorldLike, field: string, dt: DataTable) => {
      matchDataDoesntContain(world, handleResolve(field, world), dt);
    })
  );

  Then(
    '{string} is an array of objects with length {string}',
    wrapStep((world: PropsWorldLike, field: string, field2: string) => {
      expect(handleResolve(field, world).length).toEqual(Number.parseInt(handleResolve(field2, world)));
    })
  );

  Then(
    '{string} is an array of strings with the following values',
    wrapStep((world: PropsWorldLike, field: string, dt: DataTable) => {
      const values = handleResolve(field, world).map((s: string) => {
        return { value: s };
      });
      matchData(world, values, dt);
    })
  );

  Then(
    '{string} is an object with the following contents',
    wrapStep((world: PropsWorldLike, field: string, params: DataTable) => {
      const table = params.hashes();
      expect(doesRowMatch(world, table[0], handleResolve(field, world))).toBeTruthy();
    })
  );

  // ========== Value Assertions ==========

  Then('{string} is null', wrapStep((world: PropsWorldLike, field: string) => {
    expect(handleResolve(field, world)).toBeNull();
  }));

  Then('{string} is not null', wrapStep((world: PropsWorldLike, field: string) => {
    expect(handleResolve(field, world)).toBeDefined();
  }));

  Then('{string} is true', wrapStep((world: PropsWorldLike, field: string) => {
    expect(handleResolve(field, world)).toBeTruthy();
  }));

  Then('{string} is false', wrapStep((world: PropsWorldLike, field: string) => {
    expect(handleResolve(field, world)).toBeFalsy();
  }));

  Then('{string} is undefined', wrapStep((world: PropsWorldLike, field: string) => {
    expect(handleResolve(field, world)).toBeUndefined();
  }));

  Then('{string} is empty', wrapStep((world: PropsWorldLike, field: string) => {
    expect(handleResolve(field, world)).toHaveLength(0);
  }));

  // Setter step: Given I set "field" to "value"
  Given('I set {string} to {string}', wrapStep((world: PropsWorldLike, field: string, value: string) => {
    world.props[field] = handleResolve(value, world);
  }));

  // Assertion step: Then "{field}" is "value"
  Then('{string} is {string}', wrapStep((world: PropsWorldLike, field: string, value: string) => {
    const actual = handleResolve(field, world);
    const expected = handleResolve(value, world);
    expect('' + actual).toEqual('' + expected);
  }));

  // ========== Error Assertions ==========

  Then('{string} is an error with message {string}', wrapStep((world: PropsWorldLike, field: string, errorType: string) => {
    expect(handleResolve(field, world)['message']).toBe(errorType);
  }));

  Then('{string} is an error', wrapStep((world: PropsWorldLike, field: string) => {
    expect(handleResolve(field, world)).toBeInstanceOf(Error);
  }));

  Then('{string} is not an error', wrapStep((world: PropsWorldLike, field: string) => {
    expect(handleResolve(field, world)).not.toBeInstanceOf(Error);
  }));

  Then('{string} contains {string}', wrapStep((world: PropsWorldLike, field: string, sub: string) => {
    expect(String(handleResolve(field, world))).toContain(sub);
  }));

  Then(
    '{string} is a string containing one of',
    wrapStep((world: PropsWorldLike, field: string, dt: DataTable) => {
      const str = String(handleResolve(field, world));
      const values = dt.hashes().map(row => Object.values(row)[0]);
      expect(values.some(v => str.includes(v))).toBeTruthy();
    })
  );

  Then('{string} should be greater than {string}', wrapStep((world: PropsWorldLike, field: string, threshold: string) => {
    const actual = Number(handleResolve(field, world));
    const thresh = Number(handleResolve(threshold, world));
    expect(actual).toBeGreaterThan(thresh);
  }));

  Then('{string} should be less than {string}', wrapStep((world: PropsWorldLike, field: string, threshold: string) => {
    const actual = Number(handleResolve(field, world));
    const thresh = Number(handleResolve(threshold, world));
    expect(actual).toBeLessThan(thresh);
  }));

  // ========== Test Setup ==========

  Given(
    '{string} is a invocation counter into {string}',
    wrapStep((world: PropsWorldLike, handlerName: string, field: string) => {
      world.props[field] = 0;
      world.props[handlerName] = () => {
        var amount: number = world.props[field];
        amount++;
        world.props[field] = amount;
      };
    })
  );

  Given(
    '{string} is an async function returning {string}',
    wrapStep((world: PropsWorldLike, fnName: string, field: string) => {
      const value = handleResolve(field, world);
      world.props[fnName] = async () => {
        return value;
      };
    })
  );

  Given(
    '{string} is an async function returning {string} after {string} ms',
    wrapStep((world: PropsWorldLike, fnName: string, field: string, delayMs: string) => {
      const value = handleResolve(field, world);
      const delay = parseInt(delayMs);
      world.props[fnName] = async () => {
        await new Promise(resolve => setTimeout(resolve, delay));
        return value;
      };
    })
  );

  Given('we wait for a period of {string} ms', wrapStep((world: PropsWorldLike, ms: string) => {
    return new Promise<void>((resolve, _reject) => {
      setTimeout(() => resolve(), parseInt(ms));
    });
  }));

  // ========== Async Job Steps ==========

  When(
    'I start {string} as {string}',
    wrapStep(async (world: PropsWorldLike, fnName: string, jobName: string) => {
      const jobs: Map<string, Promise<any>> = world.props['_jobs'] ?? new Map();
      world.props['_jobs'] = jobs;
      const fn = handleResolve(fnName, world);
      jobs.set(jobName, Promise.resolve().then(() => fn()));
    })
  );

  When(
    'I start {string} using argument {string} as {string}',
    wrapStep(async (world: PropsWorldLike, fnName: string, param: string, jobName: string) => {
      const jobs: Map<string, Promise<any>> = world.props['_jobs'] ?? new Map();
      world.props['_jobs'] = jobs;
      const fn = handleResolve(fnName, world);
      const p = handleResolve(param, world);
      jobs.set(jobName, Promise.resolve().then(() => fn(p)));
    })
  );

  When(
    'I start {string} using arguments {string} and {string} as {string}',
    wrapStep(async (world: PropsWorldLike, fnName: string, param1: string, param2: string, jobName: string) => {
      const jobs: Map<string, Promise<any>> = world.props['_jobs'] ?? new Map();
      world.props['_jobs'] = jobs;
      const fn = handleResolve(fnName, world);
      const p1 = handleResolve(param1, world);
      const p2 = handleResolve(param2, world);
      jobs.set(jobName, Promise.resolve().then(() => fn(p1, p2)));
    })
  );

  When(
    'I start {string} using arguments {string}, {string}, and {string} as {string}',
    wrapStep(async (world: PropsWorldLike, fnName: string, param1: string, param2: string, param3: string, jobName: string) => {
      const jobs: Map<string, Promise<any>> = world.props['_jobs'] ?? new Map();
      world.props['_jobs'] = jobs;
      const fn = handleResolve(fnName, world);
      const p1 = handleResolve(param1, world);
      const p2 = handleResolve(param2, world);
      const p3 = handleResolve(param3, world);
      jobs.set(jobName, Promise.resolve().then(() => fn(p1, p2, p3)));
    })
  );

  When(
    'I start {string} using arguments {string}, {string}, {string}, and {string} as {string}',
    wrapStep(async (world: PropsWorldLike, fnName: string, param1: string, param2: string, param3: string, param4: string, jobName: string) => {
      const jobs: Map<string, Promise<any>> = world.props['_jobs'] ?? new Map();
      world.props['_jobs'] = jobs;
      const fn = handleResolve(fnName, world);
      const p1 = handleResolve(param1, world);
      const p2 = handleResolve(param2, world);
      const p3 = handleResolve(param3, world);
      const p4 = handleResolve(param4, world);
      jobs.set(jobName, Promise.resolve().then(() => fn(p1, p2, p3, p4)));
    })
  );

  Then(
    'I wait for job {string}',
    wrapStep(async (world: PropsWorldLike, jobName: string) => {
      const jobs: Map<string, Promise<any>> = world.props['_jobs'] ?? new Map();
      try {
        const resolvedName = handleResolve(jobName, world);
        const result = await jobs.get(jobName);
        world.props['result'] = result;
        world.props[jobName] = result;
      } catch (error) {
        world.props['result'] = error;
        world.props[jobName] = error;
      }
    })
  );

  Then(
    'I wait for job {string} within {string} ms',
    wrapStep(async (world: PropsWorldLike, jobName: string, timeoutMs: string) => {
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
    })
  );

  When('I wait for {string}', wrapStep(async (world: PropsWorldLike, fnName: string) => {
    const fn = handleResolve(fnName, world);
    try {
      const result = await fn();
      world.props['result'] = result;
    } catch (error) {
      world.props['result'] = error;
    }
  }));

  When(
    'I wait for {string} within {string} ms',
    wrapStep(async (world: PropsWorldLike, fnName: string, timeoutMs: string) => {
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
    })
  );

  When(
    'I wait for {string} using argument {string}',
    wrapStep(async (world: PropsWorldLike, fnName: string, param: string) => {
      const fn = handleResolve(fnName, world);
      try {
        const result = await fn(handleResolve(param, world));
        world.props['result'] = result;
      } catch (error) {
        world.props['result'] = error;
      }
    })
  );

  When(
    'I wait for {string} using arguments {string} and {string}',
    wrapStep(async (world: PropsWorldLike, fnName: string, param1: string, param2: string) => {
      const fn = handleResolve(fnName, world);
      try {
        const result = await fn(handleResolve(param1, world), handleResolve(param2, world));
        world.props['result'] = result;
      } catch (error) {
        world.props['result'] = error;
      }
    })
  );

  When(
    'I wait for {string} using arguments {string}, {string}, and {string}',
    wrapStep(async (world: PropsWorldLike, fnName: string, param1: string, param2: string, param3: string) => {
      const fn = handleResolve(fnName, world);
      try {
        const result = await fn(handleResolve(param1, world), handleResolve(param2, world), handleResolve(param3, world));
        world.props['result'] = result;
      } catch (error) {
        world.props['result'] = error;
      }
    })
  );

  When(
    'I wait for {string} using arguments {string}, {string}, {string}, and {string}',
    wrapStep(async (world: PropsWorldLike, fnName: string, param1: string, param2: string, param3: string, param4: string) => {
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
    })
  );
}
