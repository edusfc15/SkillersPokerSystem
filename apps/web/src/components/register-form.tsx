import { Card, CardContent, CardHeader, CardTitle } from "@skillers/ui";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/auth-context";
import type { RegisterDto } from "../types/auth";

export function RegisterForm() {
	const { register, isLoading, error } = useAuth();
	const navigate = useNavigate();
	const [formData, setFormData] = useState<RegisterDto>({
		username: "",
		email: "",
		password: "",
		displayName: "",
		phoneNumber: "",
	});
	const [showPassword, setShowPassword] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			// Remove campos vazios opcionais
			const cleanData = {
				username: formData.username,
				email: formData.email,
				password: formData.password,
				...(formData.displayName && { displayName: formData.displayName }),
				...(formData.phoneNumber && { phoneNumber: formData.phoneNumber }),
			};

			await register(cleanData);
			// Redirecionar para a home após registro bem-sucedido
			navigate("/");
		} catch (error) {
			console.error("Erro no registro:", error);
		}
	};

	const handleChange =
		(field: keyof RegisterDto) => (e: React.ChangeEvent<HTMLInputElement>) => {
			setFormData((prev) => ({
				...prev,
				[field]: e.target.value,
			}));
		};

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle className="text-2xl text-center">
					🎮 Registrar - Skillers Poker
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
							htmlFor="username"
							className="text-sm font-medium text-foreground"
						>
							Username *
						</label>
						<input
							id="username"
							type="text"
							value={formData.username}
							onChange={handleChange("username")}
							className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
							placeholder="Escolha um username"
							required
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="email"
							className="text-sm font-medium text-foreground"
						>
							Email *
						</label>
						<input
							id="email"
							type="email"
							value={formData.email}
							onChange={handleChange("email")}
							className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
							placeholder="Digite seu email"
							required
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="password"
							className="text-sm font-medium text-foreground"
						>
							Senha *
						</label>
						<div className="relative">
							<input
								id="password"
								type={showPassword ? "text" : "password"}
								value={formData.password}
								onChange={handleChange("password")}
								className="w-full px-3 py-2 pr-10 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
								placeholder="Mínimo 6 caracteres"
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

					<div className="space-y-2">
						<label
							htmlFor="displayName"
							className="text-sm font-medium text-foreground"
						>
							Nome de Exibição
						</label>
						<input
							id="displayName"
							type="text"
							value={formData.displayName}
							onChange={handleChange("displayName")}
							className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
							placeholder="Como você quer ser chamado (opcional)"
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="phoneNumber"
							className="text-sm font-medium text-foreground"
						>
							Telefone
						</label>
						<input
							id="phoneNumber"
							type="tel"
							value={formData.phoneNumber}
							onChange={handleChange("phoneNumber")}
							className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
							placeholder="+55 (11) 99999-9999 (opcional)"
						/>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
					>
						{isLoading ? "🔄 Registrando..." : "✨ Criar Conta"}
					</button>
				</form>
				
				<div className="mt-4 text-center">
					<p className="text-sm text-muted-foreground">
						Já tem uma conta?{" "}
						<Link to="/login" className="text-primary hover:text-primary/80 transition-colors font-medium">
							Faça login aqui
						</Link>
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
