import { PropsWorldLike } from "../world/PropsWorldLike";


// Cucumber uses 'this' as the world parameter for each step
export const cucumberWrapStep = (fn: (world: PropsWorldLike, ...args: any[]) => any) => {
  const wrapped = function (this: unknown, ...args: any[]) {
    return fn(this as PropsWorldLike, ...args);
  };
  // cucumber-js uses fn.length for capture groups; step bodies take world as the first parameter
  Object.defineProperty(wrapped, 'length', { value: Math.max(0, fn.length - 1) });
  return wrapped;
};

// QuickPickle passes world as the first argument to every step
export const quickpickleWrapStep = (fn: (world: PropsWorldLike, ...args: any[]) => any) => fn;