import { HttpException, HttpStatus } from '@nestjs/common';

export class UnauthorizedException extends HttpException {
  constructor(message: string = 'Unauthorized', details?: unknown) {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        message,
        error: 'Unauthorized',
        details,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
