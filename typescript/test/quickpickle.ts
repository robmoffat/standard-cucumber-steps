import { Before, Given, Then, When, setWorldConstructor } from 'quickpickle';
import { setupGenericSteps } from '../src/steps/generic.steps';
import { clearFieldMatchers } from '../src/support/matching';
import { registerRegexFieldMatcher } from './regexFieldMatcher';
import type { PropsWorldLike } from '../src/world/PropsWorldLike';
import { registerScenarioFixtures } from './fixtures';
import { QuickPickleWorld } from 'quickpickle';
import { quickpickleWrapStep } from '../src/support/stepWrappers';

/** World used by the quickpickle test harness (vitest). */
export class QuickPropsWorld extends QuickPickleWorld implements PropsWorldLike {
  props: Record<string, any> = {};

  log(message: string): void {
    console.log(message);
  }
}

setWorldConstructor(QuickPropsWorld);

setupGenericSteps({ Given, When, Then, wrapStep: quickpickleWrapStep });

Before(async (world: QuickPropsWorld) => {
  clearFieldMatchers();
  registerRegexFieldMatcher();
  registerScenarioFixtures(world);
});
