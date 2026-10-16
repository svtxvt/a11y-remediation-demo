// Minimal ambient types for jest-axe, so the tests do not pull in @types/jest globals.
declare module 'jest-axe' {
  export interface AxeViolation {
    id: string;
    impact?: string | null;
    help: string;
    nodes: Array<{ target: unknown[] }>;
  }

  export interface AxeResults {
    violations: AxeViolation[];
  }

  export function axe(html: Element | string, options?: Record<string, unknown>): Promise<AxeResults>;

  export function configureAxe(options?: Record<string, unknown>): typeof axe;

  export const toHaveNoViolations: {
    toHaveNoViolations(results: AxeResults): { pass: boolean; message(): string };
  };
}
