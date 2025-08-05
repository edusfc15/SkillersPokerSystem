import { HttpException, HttpStatus } from '@nestjs/common';

export class ConflictException extends HttpException {
  constructor(message: string = 'Conflict', details?: unknown) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message,
        error: 'Conflict',
        details,
      },
      HttpStatus.CONFLICT,
    );
  }
}
