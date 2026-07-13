import { HttpError } from './http-error.js';

export function notFoundHandler(request, response) {
  response.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `No route matches ${request.method} ${request.originalUrl}.`,
    },
  });
}

export function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof HttpError) {
    response.status(error.status).json({
      error: { code: error.code, message: error.message },
    });
    return;
  }

  if (error?.code === 'ER_DUP_ENTRY') {
    response.status(409).json({
      error: {
        code: 'DUPLICATE_RECORD',
        message: 'A record with the same unique value already exists.',
      },
    });
    return;
  }

  console.error(error);
  response.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'The server could not complete the request.',
    },
  });
}
