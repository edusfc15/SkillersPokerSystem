import {
	type CanActivate,
	type ExecutionContext,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthenticatedUser } from "../interfaces/auth.interface";

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.getAllAndOverride<string[]>("roles", [
			context.getHandler(),
			context.getClass(),
		]);

		if (!requiredRoles) {
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const user: AuthenticatedUser = request.user;

		if (!user) {
			throw new ForbiddenException("User not authenticated");
		}

		const hasRole = requiredRoles.some((role) => user.roles?.includes(role));
		if (!hasRole) {
			throw new ForbiddenException("Insufficient permissions");
		}

		return true;
	}
}
