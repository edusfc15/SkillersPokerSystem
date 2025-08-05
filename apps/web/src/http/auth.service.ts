import type { AuthResponse, AuthUser, LoginDto, RegisterDto } from "../types/auth";
import { apiClient, extractApiError, publicApiClient } from "./api-client";

export class AuthHttpService {
	/**
	 * Registra um novo usuário
	 */
	async register(data: RegisterDto): Promise<AuthResponse> {
		try {
			const response = await publicApiClient
				.post("auth/register", {
					json: data,
				})
				.json<AuthResponse>();

			return response;
		} catch (error) {
			const message = await extractApiError(error);
			throw new Error(message);
		}
	}

	/**
	 * Faz login do usuário
	 */
	async login(data: LoginDto): Promise<AuthResponse> {
		try {
			const response = await publicApiClient
				.post("auth/login", {
					json: data,
				})
				.json<AuthResponse>();

			return response;
		} catch (error) {
			const message = await extractApiError(error);
			throw new Error(message);
		}
	}

	/**
	 * Busca o perfil do usuário autenticado
	 */
	async getProfile(): Promise<AuthUser> {
		try {
			const response = await apiClient.get("auth/profile").json<AuthUser>();
			return response;
		} catch (error) {
			const message = await extractApiError(error);
			throw new Error(message);
		}
	}

	/**
	 * Refresh do token (se implementado no futuro)
	 */
	async refreshToken(refreshToken: string): Promise<AuthResponse> {
		try {
			const response = await publicApiClient
				.post("auth/refresh", {
					json: { refreshToken },
				})
				.json<AuthResponse>();

			return response;
		} catch (error) {
			const message = await extractApiError(error);
			throw new Error(message);
		}
	}

	/**
	 * Logout (se implementado no futuro)
	 */
	async logout(): Promise<void> {
		try {
			await apiClient.post("auth/logout");
		} catch (error) {
			const message = await extractApiError(error);
			throw new Error(message);
		}
	}
}

// Instância singleton do serviço
export const authHttpService = new AuthHttpService();
