import { JSONPath } from 'jsonpath-plus';
import { PropsWorld } from '../world';
import expect from 'expect';
import { DataTable } from '@cucumber/cucumber';

export function doesRowMatch(cw: PropsWorld, t: Record<string, string>, data: any): boolean {
  for (const [field, actual] of Object.entries(t)) {
    const found = JSONPath({ path: field, json: data })[0];
    const resolved = handleResolve(actual, cw);

    if (found != resolved) {
      try {
        cw.log(
          `Comparing Validation failed: ${JSON.stringify(data, null, 2)} \n Match failed on ${field} '${found}' vs '${resolved}'`
        );
      } catch (e) {
        cw.log('Match failed on ' + field + " '" + found + "' vs '" + resolved + "'");
      }
      return false;
    }
  }

  return true;
}

export function indexOf(cw: PropsWorld, rows: Record<string, string>[], data: any): number {
  for (var i = 0; i < rows.length; i++) {
    if (doesRowMatch(cw, rows[i], data)) {
      return i;
    }
  }

  return -1;
}

function isNumeric(n: string) {
  return !isNaN(parseFloat(n)) && isFinite(n as unknown as number);
}

export function handleResolve(name: string, on: PropsWorld): any {
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

export function matchData(cw: PropsWorld, actual: any[], dt: DataTable) {
  const tableData = dt.hashes();
  const rowCount = tableData.length;

  var resultCopy = JSON.parse(JSON.stringify(actual)) as any[];
  cw.log(`result ${JSON.stringify(resultCopy, null, 2)} length ${resultCopy.length}`);
  expect(resultCopy).toHaveLength(rowCount);
  var row = 0;

  resultCopy = resultCopy.filter(rr => {
    const matchingRow = tableData[row];
    row++;
    if (doesRowMatch(cw, matchingRow, rr)) {
      return false;
    } else {
      cw.log(`Couldn't match row: ${JSON.stringify(rr, null, 2)}`);
      return true;
    }
  });

  expect(resultCopy).toHaveLength(0);
}

export function matchDataAtLeast(cw: PropsWorld, actual: any[], dt: DataTable) {
  const tableData = dt.hashes();

  for (const expectedRow of tableData) {
    const found = actual.some(item => doesRowMatch(cw, expectedRow, item));
    if (!found) {
      cw.log(`Expected row not found: ${JSON.stringify(expectedRow, null, 2)}`);
      expect(found).toBeTruthy();
    }
  }
}

export function matchDataDoesntContain(cw: PropsWorld, actual: any[], dt: DataTable) {
  const tableData = dt.hashes();

  for (const unwantedRow of tableData) {
    const found = actual.some(item => doesRowMatch(cw, unwantedRow, item));
    if (found) {
      cw.log(`Unwanted row found: ${JSON.stringify(unwantedRow, null, 2)}`);
      expect(found).toBeFalsy();
    }
  }
}
