import { Body, Controller, Get, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ZodValidationPipe } from "../common/pipes";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { AuthResponseDto } from "./dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AuthenticatedUser } from "./interfaces/auth.interface";
import { type LoginDto, loginSchema, type RegisterDto, registerSchema } from "./schemas";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	@ApiOperation({ summary: 'Register a new user' })
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
}
