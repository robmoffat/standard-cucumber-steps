import { World } from '@cucumber/cucumber';
import { PropsWorldLike } from './PropsWorldLike';

export type { PropsWorldLike } from './PropsWorldLike';

export class PropsWorld extends World implements PropsWorldLike {
  props: Record<string, any> = {};
}
