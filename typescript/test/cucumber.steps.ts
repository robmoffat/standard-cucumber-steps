import { Before, Given, Then, When, World, setWorldConstructor } from '@cucumber/cucumber';
import { setupGenericSteps } from '../src/steps/generic.steps';
import { clearFieldMatchers } from '../src/support/matching';
import { registerRegexFieldMatcher } from './regexFieldMatcher';
import type { PropsWorldLike } from '../src/world/PropsWorldLike';
import { registerScenarioFixtures } from './fixtures';
import { cucumberWrapStep } from '../src/support/stepWrappers';


export class PropsWorld extends World implements PropsWorldLike {
  props: Record<string, any> = {};
}

setWorldConstructor(PropsWorld);


setupGenericSteps({ Given, When, Then, wrapStep: cucumberWrapStep });

Before(function (this: PropsWorld) {
  clearFieldMatchers();
  registerRegexFieldMatcher();
  registerScenarioFixtures(this);
});
