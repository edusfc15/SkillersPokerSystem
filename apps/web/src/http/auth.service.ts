import type { AuthResponse, AuthUser, LoginDto, RegisterDto } from "../types/auth";
import { apiClient, extractApiError, publicApiClient } from "./api-client";

export interface UserAdminEntry {
	id: string;
	username: string | null;
	email: string | null;
	displayName: string | null;
	isadmin: boolean;
	createddate: string;
	player: { id: string; name: string } | null;
}

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

	/**
	 * Lista todos os usuários (admin)
	 */
	async listUsers(): Promise<UserAdminEntry[]> {
		try {
			return await apiClient.get("auth/users").json<UserAdminEntry[]>();
		} catch (error) {
			const message = await extractApiError(error);
			throw new Error(message);
		}
	}

	/**
	 * Altera a senha do usuário autenticado
	 */
	async changePassword(currentPassword: string, newPassword: string): Promise<void> {
		try {
			await apiClient
				.post("auth/change-password", {
					json: { currentPassword, newPassword },
				})
				.json();
		} catch (error) {
			const message = await extractApiError(error);
			throw new Error(message);
		}
	}

	/**
	 * Define o papel (role) de um usuário (admin)
	 */
	async setUserRole(userId: string, isadmin: boolean): Promise<void> {
		try {
			await apiClient
				.put(`auth/users/${userId}/role`, { json: { isadmin } })
				.json();
		} catch (error) {
			const message = await extractApiError(error);
			throw new Error(message);
		}
	}
}

// Instância singleton do serviço
export const authHttpService = new AuthHttpService();
