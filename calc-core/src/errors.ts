/**
 * Error de validación de entrada. Su forma (`code`, `message`, `field`) coincide
 * con el formato de error de la API (`definicion-inicial.md` §4.7), de modo que
 * el backend y el frontend pueden traducirlo sin transformaciones.
 */
export class InvalidInputError extends Error {
  readonly code = "INVALID_INPUT" as const;

  constructor(
    message: string,
    readonly field: string,
  ) {
    super(message);
    this.name = "InvalidInputError";
  }
}

export function assertPositiveInteger(value: unknown, field: string): asserts value is number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    throw new InvalidInputError(`${field} must be a positive integer`, field);
  }
}

export function assertPositiveNumber(value: unknown, field: string): asserts value is number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new InvalidInputError(`${field} must be a positive number`, field);
  }
}

export function assertFiniteNumber(value: unknown, field: string): asserts value is number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new InvalidInputError(`${field} must be a finite number`, field);
  }
}
