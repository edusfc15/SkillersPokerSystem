import { HttpException, HttpStatus } from '@nestjs/common';

export class BadRequestException extends HttpException {
  constructor(message: string = 'Bad Request', details?: unknown) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        error: 'Bad Request',
        details,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
