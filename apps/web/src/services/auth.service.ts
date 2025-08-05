import { authHttpService } from "../http";
import { API_CONFIG } from "../http/config";
import type {
	AuthResponse,
	AuthUser,
	LoginDto,
	RegisterDto,
} from "../types/auth";

class AuthService {
	async login(data: LoginDto): Promise<AuthResponse> {
		return authHttpService.login(data);
	}

	async register(data: RegisterDto): Promise<AuthResponse> {
		return authHttpService.register(data);
	}

	async getProfile(token: string): Promise<AuthUser> {
		// Armazena temporariamente o token para a requisição
		const previousToken = localStorage.getItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
		localStorage.setItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
		
		try {
			return await authHttpService.getProfile();
		} finally {
			// Restaura o token anterior ou remove se não existia
			if (previousToken) {
				localStorage.setItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN, previousToken);
			} else {
				localStorage.removeItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
			}
		}
	}
}

export const authService = new AuthService();
