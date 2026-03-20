import { ForbiddenException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { BadRequestException, ConflictException, UnauthorizedException } from "../common/exceptions";
import { PrismaService } from "../prisma.service";
import type { AuthResponseDto } from "./dto";
import type {
	AuthenticatedUser,
	JwtPayload,
} from "./interfaces/auth.interface";
import type { LoginDto, RegisterDto } from "./schemas";

@Injectable()
export class AuthService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly prisma: PrismaService,
	) {}

	async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
		console.log('AuthService received:', registerDto);
		const { username, email, password, displayName, phoneNumber } = registerDto;
		console.log('Destructured values:', { username, email, password, displayName, phoneNumber });

		// Validate required fields
		if (!username || !email || !password) {
			throw new BadRequestException('Username, email, and password are required');
		}

		// Check if user exists
		const existingUser = await this.prisma.user.findFirst({
			where: {
				OR: [
					{ normalizedemail: email.toLowerCase() },
					{ normalizedusername: username.toLowerCase() },
				],
			},
		});

		if (existingUser) {
			throw new ConflictException(
				"User with this email or username already exists",
			);
		}

		// Hash password
		const saltRounds = 12;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		// Generate user ID (using UUID-like string)
		const userId = this.generateUserId();

		// Create user
		const user = await this.prisma.user.create({
			data: {
				id: userId,
				username,
				normalizedusername: username.toLowerCase(),
				email,
				normalizedemail: email.toLowerCase(),
				emailconfirmed: false,
				passwordhash: hashedPassword,
				securitystamp: this.generateSecurityStamp(),
				concurrencystamp: this.generateConcurrencyStamp(),
				phonenumber: phoneNumber,
				phonenumberconfirmed: false,
				twofactorenabled: false,
				lockoutenabled: true,
				accessfailedcount: 0,
				displayname: displayName || username,
				type: 0, // Default user type
				flags: 0, // Default flags
				createddate: new Date(),
				lastmodifieddate: new Date(),
			},
		});

		// Get user roles
		const roles = await this.getUserRoles(user.id);

		// Generate JWT token
		const payload: JwtPayload = {
			sub: user.id,
			username: user.username,
			email: user.email,
			roles,
		};

		const accessToken = this.jwtService.sign(payload);

		return {
			accessToken,
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				displayName: user.displayname,
				roles,
				isadmin: false, // new users are never admin
			},
		};
	}

	async login(loginDto: LoginDto): Promise<AuthResponseDto> {
		const { emailOrUsername, password } = loginDto;

		// Find user by email or username
		const user = await this.prisma.user.findFirst({
			where: {
				OR: [
					{ normalizedemail: emailOrUsername.toLowerCase() },
					{ normalizedusername: emailOrUsername.toLowerCase() },
				],
			},
		});

		if (!user || !user.passwordhash) {
			throw new UnauthorizedException("Invalid credentials");
		}

		// Check if account is locked
		if (
			user.lockoutenabled &&
			user.lockoutend &&
			user.lockoutend > new Date()
		) {
			throw new UnauthorizedException("Account is locked");
		}

		// Verify password
		const isPasswordValid = await bcrypt.compare(password, user.passwordhash);
		if (!isPasswordValid) {
			// Increment failed login attempts
			await this.handleFailedLogin(user.id);
			throw new UnauthorizedException("Invalid credentials");
		}

		// Reset failed login attempts on successful login
		if (user.accessfailedcount > 0) {
			await this.prisma.user.update({
				where: { id: user.id },
				data: { accessfailedcount: 0, lockoutend: null },
			});
		}

		// Get user roles
		const roles = await this.getUserRoles(user.id);

		// Generate JWT token
		const payload: JwtPayload = {
			sub: user.id,
			username: user.username,
			email: user.email,
			roles,
		};

		const accessToken = this.jwtService.sign(payload);

		return {
			accessToken,
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				displayName: user.displayname,
				roles,
				isadmin: user.isadmin,
			},
		};
	}

	async validateUserById(userId: string): Promise<AuthenticatedUser | null> {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			return null;
		}

		// Check if account is locked
		if (
			user.lockoutenabled &&
			user.lockoutend &&
			user.lockoutend > new Date()
		) {
			return null;
		}

		const roles = await this.getUserRoles(user.id);

		return {
			id: user.id,
			username: user.username,
			email: user.email,
			displayName: user.displayname,
			roles,
			emailConfirmed: user.emailconfirmed,
			lockoutEnd: user.lockoutend,
			lockoutEnabled: user.lockoutenabled,
			accessFailedCount: user.accessfailedcount,
		};
	}

	private async getUserRoles(userId: string): Promise<string[]> {
		const userRoles = await this.prisma.aspnetuserroles.findMany({
			where: { userid: userId },
			include: {
				aspnetroles: true,
			},
		});

		return userRoles.map((ur) => ur.aspnetroles.name).filter(Boolean);
	}

	private async handleFailedLogin(userId: string): Promise<void> {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) return;

		const newFailedCount = user.accessfailedcount + 1;
		const maxFailedAttempts = 5;

		let lockoutEnd: Date | null = null;
		if (newFailedCount >= maxFailedAttempts) {
			// Lock account for 30 minutes
			lockoutEnd = new Date(Date.now() + 30 * 60 * 1000);
		}

		await this.prisma.user.update({
			where: { id: userId },
			data: {
				accessfailedcount: newFailedCount,
				lockoutend: lockoutEnd,
			},
		});
	}

	private generateUserId(): string {
		// Generate a UUID-like string
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
			const r = (Math.random() * 16) | 0;
			const v = c === "x" ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	}

	private generateSecurityStamp(): string {
		return Math.random().toString(36).substring(2, 15);
	}

	private generateConcurrencyStamp(): string {
		return Math.random().toString(36).substring(2, 15);
	}

	async listUsers(requestingUserId: string) {
		const requester = await this.prisma.users.findUnique({
			where: { id: requestingUserId },
			select: { isadmin: true },
		});
		if (!requester?.isadmin) {
			throw new ForbiddenException('Admin access required');
		}

		const users = await this.prisma.users.findMany({
			select: {
				id: true,
				username: true,
				email: true,
				displayname: true,
				isadmin: true,
				createddate: true,
				players: {
					select: { id: true, name: true },
					take: 1,
				},
			},
			orderBy: { createddate: 'desc' },
		});

		return users.map((u) => ({
			id: u.id,
			username: u.username,
			email: u.email,
			displayName: u.displayname,
			isadmin: u.isadmin,
			createddate: u.createddate,
			player: u.players[0] ?? null,
		}));
	}

	async changePassword(userId: string, currentPassword: string, newPassword: string) {
		const user = await this.prisma.users.findUnique({
			where: { id: userId },
			select: { passwordhash: true },
		});

		if (!user?.passwordhash) {
			throw new BadRequestException('User not found');
		}

		const isValid = await bcrypt.compare(currentPassword, user.passwordhash);
		if (!isValid) {
			throw new BadRequestException('Senha atual incorreta');
		}

		if (!newPassword || newPassword.length < 6) {
			throw new BadRequestException('Nova senha deve ter pelo menos 6 caracteres');
		}

		const newHash = await bcrypt.hash(newPassword, 12);
		await this.prisma.users.update({
			where: { id: userId },
			data: {
				passwordhash: newHash,
				securitystamp: this.generateSecurityStamp(),
				lastmodifieddate: new Date(),
			},
		});

		return { success: true };
	}

	async setUserRole(requestingUserId: string, targetUserId: string, isadmin: boolean) {
		const requester = await this.prisma.users.findUnique({
			where: { id: requestingUserId },
			select: { isadmin: true },
		});
		if (!requester?.isadmin) {
			throw new ForbiddenException('Admin access required');
		}

		if (requestingUserId === targetUserId && !isadmin) {
			throw new BadRequestException('Cannot remove your own admin status');
		}

		const updated = await this.prisma.users.update({
			where: { id: targetUserId },
			data: { isadmin, lastmodifieddate: new Date() },
			select: { id: true, username: true, isadmin: true },
		});

		return { success: true, data: updated };
	}

	async onModuleDestroy() {
		await this.prisma.$disconnect();
	}
}
