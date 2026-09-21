import { readFileSync } from "node:fs";
import { expect } from "vitest";

export interface Case<I = Record<string, any>, E = Record<string, any>> {
  id: string;
  input: I;
  expected: E;
  tolerance?: number;
  source: string;
}

const casesUrl = new URL("../../shared-tests/cases.json", import.meta.url);
const allCases = JSON.parse(readFileSync(casesUrl, "utf-8")) as Record<string, Case[]>;

export function loadCases(section: string): Case[] {
  const cases = allCases[section];
  if (!cases || cases.length === 0) {
    throw new Error(`shared-tests/cases.json: sección "${section}" vacía o inexistente`);
  }
  return cases;
}

/** Tolerancia por defecto cuando el caso no declara `tolerance`. */
export const DEFAULT_TOLERANCE = 1e-9;

export function expectClose(actual: number, expected: number, tolerance = DEFAULT_TOLERANCE): void {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
}
