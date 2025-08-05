import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RegisterForm } from "../components/register-form";
import { useAuth } from "../contexts/auth-context";

export function RegisterPage() {
	const { user, isLoading } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		// Se o usuário já estiver logado, redirecionar para a home
		if (user && !isLoading) {
			navigate("/");
		}
	}, [user, isLoading, navigate]);

	// Mostrar um loading enquanto verifica o estado de autenticação
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background p-4">
				<div className="text-center">
					<div className="text-2xl">🔄</div>
					<p className="text-muted-foreground mt-2">Verificando autenticação...</p>
				</div>
			</div>
		);
	}

	// Se o usuário já estiver logado, não mostrar o formulário
	if (user) {
		return null;
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<RegisterForm />
		</div>
	);
}