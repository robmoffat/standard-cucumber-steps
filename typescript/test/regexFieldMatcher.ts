import { registerFieldMatcher, pathForFieldSuffix, valueAtPath } from '../src/support/fieldMatchers';
import type { PropsWorldLike } from '../src/world/PropsWorldLike';

const REGEX_SUFFIX = '_regex';

/** Example matcher for field-matchers.feature (not part of the published library API). */
export function registerRegexFieldMatcher(): void {
  registerFieldMatcher({
    matchesField: field => field.endsWith(REGEX_SUFFIX),
    matchField(world: PropsWorldLike, field, expected, rowData) {
      const path = pathForFieldSuffix(field, REGEX_SUFFIX);
      if (path === null) {
        return false;
      }
      const found = valueAtPath(rowData, path);
      const foundStr = found == null ? '' : String(found);
      try {
        const re = new RegExp(expected);
        if (!re.test(foundStr)) {
          world.log(`Regex match failed on ${field}: '${foundStr}' vs /${expected}/`);
          return false;
        }
        return true;
      } catch (e) {
        world.log(`Invalid regex for ${field}: ${e}`);
        return false;
      }
    },
  });
}
