import { Injectable, PipeTransform } from "@nestjs/common";
import { ZodError, ZodSchema } from "zod";
import { ValidationException } from "../exceptions";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
	constructor(private schema: ZodSchema) {}

	transform(value: unknown) {
		try {
			return this.schema.parse(value);
		} catch (error) {
			if (error instanceof ZodError) {
				throw new ValidationException(error);
			}
			throw error;
		}
	}
}
