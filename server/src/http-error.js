export class HttpError extends Error {
  constructor(status, message, code = 'REQUEST_ERROR') {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
  }
}

export function requirePositiveInteger(value, fieldName) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new HttpError(400, `${fieldName} must be a positive integer.`, 'VALIDATION_ERROR');
  }

  return parsed;
}

export function requireText(value, fieldName, maxLength) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new HttpError(400, `${fieldName} is required.`, 'VALIDATION_ERROR');
  }

  const normalized = value.trim();

  if (normalized.length > maxLength) {
    throw new HttpError(
      400,
      `${fieldName} must be ${maxLength} characters or fewer.`,
      'VALIDATION_ERROR',
    );
  }

  return normalized;
}
