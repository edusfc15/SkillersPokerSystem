import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from "@nestjs/common";
import { Response } from "express";
import { ZodError } from "zod";
import { ValidationException } from "../exceptions";

interface ErrorResponse {
	statusCode: number;
	message: string;
	error: string;
	details?: unknown;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(GlobalExceptionFilter.name);

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest();

		let status: number;
		let message: string;
		let error: string;
		let details: unknown;

		if (exception instanceof ZodError) {
			// Convert Zod error to our custom ValidationException
			const validationException = new ValidationException(exception);
			const errorResponse = validationException.getResponse() as ErrorResponse;

			status = validationException.getStatus();
			message = errorResponse.message;
			error = errorResponse.error;
			details = errorResponse.details;
		} else if (exception instanceof HttpException) {
			status = exception.getStatus();
			const errorResponse = exception.getResponse();

			if (typeof errorResponse === "string") {
				message = errorResponse;
				error = "Error";
			} else {
				const errorObj = errorResponse as ErrorResponse;
				message = errorObj.message || "An error occurred";
				error = errorObj.error || "Error";
				details = errorObj.details;
			}
		} else {
			// Unknown error
			status = HttpStatus.INTERNAL_SERVER_ERROR;
			message = "Internal server error";
			error = "Internal Server Error";

			this.logger.error(
				`Unhandled exception: ${exception}`,
				exception instanceof Error ? exception.stack : undefined,
			);
		}

		const errorResponse = {
			statusCode: status,
			timestamp: new Date().toISOString(),
			path: request.url,
			method: request.method,
			message,
			error,
			...(details && { details }),
		};

		this.logger.error(`${request.method} ${request.url} - ${status} - ${message}`);

		response.status(status).json(errorResponse);
	}
}
