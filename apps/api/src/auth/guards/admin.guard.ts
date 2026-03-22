import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import type { AuthenticatedUser } from '../interfaces/auth.interface';

@Injectable()
export class AdminGuard implements CanActivate {
	constructor(private readonly prisma: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const user: AuthenticatedUser = request.user;

		if (!user?.id) {
			throw new ForbiddenException('Admin access required');
		}

		const dbUser = await this.prisma.users.findUnique({
			where: { id: user.id },
			select: { isadmin: true },
		});

		if (!dbUser?.isadmin) {
			throw new ForbiddenException('Admin access required');
		}

		return true;
	}
}
