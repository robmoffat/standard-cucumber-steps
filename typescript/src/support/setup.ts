import { setWorldConstructor } from '@cucumber/cucumber';
import { PropsWorld } from '../world';
import { setupGenericSteps } from '../steps/generic.steps';

setWorldConstructor(PropsWorld);
setupGenericSteps();
