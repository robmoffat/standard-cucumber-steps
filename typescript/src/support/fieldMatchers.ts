import { JSONPath } from 'jsonpath-plus';
import { PropsWorldLike } from '../world/PropsWorldLike';

export interface RowFieldMatcher {
  matchesField(field: string): boolean;
  matchField(
    world: PropsWorldLike,
    field: string,
    expected: string,
    rowData: unknown
  ): boolean | Promise<boolean>;
}

const fieldMatchers: RowFieldMatcher[] = [];

export function registerFieldMatcher(matcher: RowFieldMatcher): void {
  fieldMatchers.push(matcher);
}

export function clearFieldMatchers(): void {
  fieldMatchers.length = 0;
}

/** Path within rowData for a column name ending with `suffix` (e.g. `_regex`, `matches_type`). */
export function pathForFieldSuffix(field: string, suffix: string): string | null {
  if (!field.endsWith(suffix)) {
    return null;
  }
  if (field.length === suffix.length) {
    return '';
  }
  let stem = field.substring(0, field.length - suffix.length);
  // e.g. msg.matches_type → stem "msg." → path "msg"
  if (stem.endsWith('.')) {
    stem = stem.slice(0, -1);
  }
  return stem;
}

export function valueAtPath(data: unknown, path: string): unknown {
  if (path === '') {
    return data;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return JSONPath({ path: path, json: data as any })[0];
}

export function findFieldMatcher(field: string): RowFieldMatcher | undefined {
  return fieldMatchers.find(m => m.matchesField(field));
}
