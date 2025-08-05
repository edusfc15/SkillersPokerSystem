import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import { AuthenticatedUser } from "../interfaces/auth.interface";

export const CurrentUser = createParamDecorator(
	(data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
		const request = ctx.switchToHttp().getRequest();
		return request.user;
	},
);
