import { Card, CardContent, CardHeader, CardTitle } from "@skillers/ui";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/auth-context";
import type { LoginDto } from "../types/auth";

export function LoginForm() {
	const { login, isLoading, error } = useAuth();
	const navigate = useNavigate();
	const [formData, setFormData] = useState<LoginDto>({
		emailOrUsername: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await login(formData);
			// Redirecionar para a home após login bem-sucedido
			navigate("/");
		} catch (error) {
			// Erro já tratado no context
			console.error("Erro no login:", error);
		}
	};

	const handleChange =
		(field: keyof LoginDto) => (e: React.ChangeEvent<HTMLInputElement>) => {
			setFormData((prev) => ({
				...prev,
				[field]: e.target.value,
			}));
		};

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle className="text-2xl text-center">
					Login
				</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					{error && (
						<div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm">
							{error}
						</div>
					)}

					<div className="space-y-2">
						<label
							htmlFor="emailOrUsername"
							className="text-sm font-medium text-foreground"
						>
							Email ou Username
						</label>
						<input
							id="emailOrUsername"
							type="text"
							value={formData.emailOrUsername}
							onChange={handleChange("emailOrUsername")}
							className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
							placeholder="Digite seu email ou username"
							required
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="password"
							className="text-sm font-medium text-foreground"
						>
							Senha
						</label>
						<div className="relative">
							<input
								id="password"
								type={showPassword ? "text" : "password"}
								value={formData.password}
								onChange={handleChange("password")}
								className="w-full px-3 py-2 pr-10 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
								placeholder="Digite sua senha"
								required
								minLength={6}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
							>
								{showPassword ? "🙈" : "👁️"}
							</button>
						</div>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
					>
						{isLoading ? "🔄 Entrando..." : "🚀 Entrar"}
					</button>
				</form>
				
				<div className="mt-4 text-center">
					<p className="text-sm text-muted-foreground">
						Não tem uma conta?{" "}
						<Link to="/register" className="text-primary hover:text-primary/80 transition-colors font-medium">
							Cadastre-se aqui
						</Link>
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
