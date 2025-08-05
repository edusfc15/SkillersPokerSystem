import { HttpException, HttpStatus } from '@nestjs/common';
import { ZodError } from 'zod';

export class ValidationException extends HttpException {
  constructor(zodError: ZodError) {
    const errors = zodError.issues.map((error) => ({
      field: error.path.join('.'),
      message: error.message,
      code: error.code,
    }));

    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        error: 'Bad Request',
        details: errors,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
