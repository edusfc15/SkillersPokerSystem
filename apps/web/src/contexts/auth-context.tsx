import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/auth.service";
import type {
	AuthContextType,
	AuthUser,
	LoginDto,
	RegisterDto,
} from "../types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
	children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Verificar se existe token no localStorage na inicialização
	useEffect(() => {
		const savedToken = localStorage.getItem("skillers-auth-token");
		const savedUser = localStorage.getItem("skillers-auth-user");

		if (savedToken && savedUser) {
			try {
				setToken(savedToken);
				setUser(JSON.parse(savedUser));
			} catch (error) {
				console.error("Erro ao recuperar dados de autenticação:", error);
				localStorage.removeItem("skillers-auth-token");
				localStorage.removeItem("skillers-auth-user");
			}
		}
		setIsLoading(false);
	}, []);

	const login = async (data: LoginDto) => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await authService.login(data);

			setToken(response.accessToken);
			setUser(response.user);

			// Salvar no localStorage
			localStorage.setItem("skillers-auth-token", response.accessToken);
			localStorage.setItem("skillers-auth-user", JSON.stringify(response.user));
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Erro desconhecido";
			setError(errorMessage);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const register = async (data: RegisterDto) => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await authService.register(data);

			setToken(response.accessToken);
			setUser(response.user);

			// Salvar no localStorage
			localStorage.setItem("skillers-auth-token", response.accessToken);
			localStorage.setItem("skillers-auth-user", JSON.stringify(response.user));
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Erro desconhecido";
			setError(errorMessage);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		setError(null);
		localStorage.removeItem("skillers-auth-token");
		localStorage.removeItem("skillers-auth-user");
	};

	const value: AuthContextType = {
		user,
		token,
		login,
		register,
		logout,
		isLoading,
		error,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
