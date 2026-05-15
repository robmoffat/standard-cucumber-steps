/** Step registrars from the consumer's quickpickle instance (avoids duplicate module registries). */
export interface QuickpickleBindings {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Given: (pattern: string, fn: (...args: any[]) => any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  When: (pattern: string, fn: (...args: any[]) => any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Then: (pattern: string, fn: (...args: any[]) => any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DataTable: new (...args: any[]) => any;
}

export function defaultQuickpickleBindings(): QuickpickleBindings {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const qp = require('quickpickle') as QuickpickleBindings;
  return qp;
}
