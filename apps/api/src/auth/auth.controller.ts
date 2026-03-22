import { Body, Controller, Get, HttpStatus, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ZodValidationPipe } from "../common/pipes";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { AuthResponseDto } from "./dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AdminGuard } from "./guards/admin.guard";
import { AuthenticatedUser } from "./interfaces/auth.interface";
import { type LoginDto, loginSchema, type RegisterDto, registerSchema } from "./schemas";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	@UseGuards(JwtAuthGuard, AdminGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Register a new user (admin only)' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'User registered successfully',
		type: AuthResponseDto,
	})
	async register(@Body(new ZodValidationPipe(registerSchema)) registerDto: RegisterDto): Promise<AuthResponseDto> {
		console.log('Received registration data:', registerDto);
		return this.authService.register(registerDto);
	}

	@Post('login')
	@ApiOperation({ summary: 'Login user' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'User logged in successfully',
		type: AuthResponseDto,
	})
	async login(@Body(new ZodValidationPipe(loginSchema)) loginDto: LoginDto): Promise<AuthResponseDto> {
		return this.authService.login(loginDto);
	}

	@Get('profile')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get current user profile' })
	async getProfile(@CurrentUser() user: AuthenticatedUser) {
		return {
			id: user.id,
			username: user.username,
			email: user.email,
			displayName: user.displayName,
			roles: user.roles,
			emailConfirmed: user.emailConfirmed,
		};
	}

	@Get('users')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'List all users (admin only)' })
	async listUsers(@CurrentUser() user: AuthenticatedUser) {
		return this.authService.listUsers(user.id);
	}

	@Post('change-password')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Change current user password' })
	async changePassword(
		@CurrentUser() user: AuthenticatedUser,
		@Body() body: { currentPassword: string; newPassword: string },
	) {
		return this.authService.changePassword(user.id, body.currentPassword, body.newPassword);
	}

	@Put('users/:id/role')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Set admin role for a user (admin only)' })
	async setUserRole(
		@CurrentUser() user: AuthenticatedUser,
		@Param('id') targetId: string,
		@Body() body: { isadmin: boolean },
	) {
		return this.authService.setUserRole(user.id, targetId, body.isadmin);
	}

	@Put('users/:id/player')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Associate a player to a user (admin only)' })
	async setUserPlayer(
		@CurrentUser() user: AuthenticatedUser,
		@Param('id') targetId: string,
		@Body() body: { playerId: number | null },
	) {
		return this.authService.setUserPlayer(user.id, targetId, body.playerId);
	}

	@Get('players')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'List all active players (admin only)' })
	async listPlayers(@CurrentUser() user: AuthenticatedUser) {
		return this.authService.listPlayers();
	}
}
