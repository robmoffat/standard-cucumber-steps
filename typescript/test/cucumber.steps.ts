import { Before, Given, Then, When, setWorldConstructor } from '@cucumber/cucumber';
import { setupGenericSteps } from '../src/steps/generic.steps';
import { clearFieldMatchers } from '../src/support/matching';
import { registerRegexFieldMatcher } from '../src/support/testFieldMatchers';
import { PropsWorld } from '../src/world';
import type { PropsWorldLike } from '../src/world/PropsWorldLike';
import { registerScenarioFixtures } from './support/fixtures';

setWorldConstructor(PropsWorld);

const wrapStep = (fn: (world: PropsWorldLike, ...args: any[]) => any) => {
  const wrapped = function (this: unknown, ...args: any[]) {
    return fn(this as PropsWorldLike, ...args);
  };
  // cucumber-js uses fn.length for capture groups; step bodies take world as the first parameter
  Object.defineProperty(wrapped, 'length', { value: Math.max(0, fn.length - 1) });
  return wrapped;
};

setupGenericSteps({ Given, When, Then, wrapStep });

Before(function (this: PropsWorld) {
  clearFieldMatchers();
  registerRegexFieldMatcher();
  registerScenarioFixtures(this);
});
