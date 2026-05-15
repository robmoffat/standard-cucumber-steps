import { JSONPath } from 'jsonpath-plus';
import expect from 'expect';

export interface DataTableLike {
  hashes(): Record<string, string>[];
}
import { PropsWorldLike } from '../world/PropsWorldLike';
import { findFieldMatcher } from './fieldMatchers';

export { registerFieldMatcher, clearFieldMatchers, pathForFieldSuffix, valueAtPath } from './fieldMatchers';
export type { RowFieldMatcher } from './fieldMatchers';

export function doesRowMatch(cw: PropsWorldLike, t: Record<string, string>, data: unknown): boolean {
  for (const [field, actual] of Object.entries(t)) {
    const matcher = findFieldMatcher(field);
    if (matcher) {
      const ok = matcher.matchField(cw, field, actual, data);
      if (ok instanceof Promise) {
        throw new Error('Async field matchers are not supported in synchronous step handlers');
      }
      if (!ok) {
        return false;
      }
      continue;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const found = JSONPath({ path: field, json: data as any })[0];
    const resolved = handleResolve(actual, cw);

    if (found != resolved) {
      try {
        cw.log(
          `Comparing Validation failed: ${JSON.stringify(data, null, 2)} \n Match failed on ${field} '${found}' vs '${resolved}'`
        );
      } catch {
        cw.log('Match failed on ' + field + " '" + found + "' vs '" + resolved + "'");
      }
      return false;
    }
  }

  return true;
}

export function indexOf(cw: PropsWorldLike, rows: Record<string, string>[], data: unknown): number {
  for (let i = 0; i < rows.length; i++) {
    if (doesRowMatch(cw, rows[i], data)) {
      return i;
    }
  }
  return -1;
}

function isNumeric(n: string) {
  return !isNaN(parseFloat(n)) && isFinite(n as unknown as number);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function handleResolve(name: string, on: PropsWorldLike): any {
  if (name.startsWith('{') && name.endsWith('}')) {
    const stripped = name.substring(1, name.length - 1);
    if (stripped == 'null') {
      return null;
    } else if (stripped == 'true') {
      return true;
    } else if (stripped == 'false') {
      return false;
    } else if (isNumeric(stripped)) {
      return Number.parseFloat(stripped);
    } else {
      const out = JSONPath({ path: stripped, json: on.props })[0];
      return out;
    }
  } else {
    return name;
  }
}

export function matchData(cw: PropsWorldLike, actual: unknown[], dt: DataTableLike) {
  const tableData = dt.hashes();
  const rowCount = tableData.length;

  let resultCopy = JSON.parse(JSON.stringify(actual)) as unknown[];
  cw.log(`result ${JSON.stringify(resultCopy, null, 2)} length ${resultCopy.length}`);
  expect(resultCopy).toHaveLength(rowCount);
  let row = 0;

  resultCopy = resultCopy.filter(rr => {
    const matchingRow = tableData[row];
    row++;
    if (doesRowMatch(cw, matchingRow, rr)) {
      return false;
    }
    cw.log(`Couldn't match row: ${JSON.stringify(rr, null, 2)}`);
    return true;
  });

  expect(resultCopy).toHaveLength(0);
}

export function matchDataAtLeast(cw: PropsWorldLike, actual: unknown[], dt: DataTableLike) {
  const tableData = dt.hashes();

  for (const expectedRow of tableData) {
    const found = actual.some(item => doesRowMatch(cw, expectedRow, item));
    if (!found) {
      cw.log(`Expected row not found: ${JSON.stringify(expectedRow, null, 2)}`);
      expect(found).toBeTruthy();
    }
  }
}

export function matchDataDoesntContain(cw: PropsWorldLike, actual: unknown[], dt: DataTableLike) {
  const tableData = dt.hashes();

  for (const unwantedRow of tableData) {
    const found = actual.some(item => doesRowMatch(cw, unwantedRow, item));
    if (found) {
      cw.log(`Unwanted row found: ${JSON.stringify(unwantedRow, null, 2)}`);
      expect(found).toBeFalsy();
    }
  }
}
