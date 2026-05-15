import { registerFieldMatcher, pathForFieldSuffix, valueAtPath } from './fieldMatchers';
import { PropsWorldLike } from '../world/PropsWorldLike';

const REGEX_SUFFIX = '_regex';

/** Test-only matcher for SCS field-matchers.feature (not published for production apps). */
export function registerRegexFieldMatcher(): void {
  registerFieldMatcher({
    matchesField: field => field.endsWith(REGEX_SUFFIX),
    matchField(world, field, expected, rowData) {
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
