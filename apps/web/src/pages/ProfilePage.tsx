import { Card, CardContent, CardHeader, CardTitle } from "@skillers/ui";
import { useAuth } from "../contexts/auth-context";

export function ProfilePage() {
	const { user } = useAuth();

	if (!user) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<p className="text-muted-foreground">Você precisa estar logado para ver o perfil.</p>
			</div>
		);
	}

	return (
		<div className="max-w-2xl mx-auto space-y-6">
			<h1 className="text-3xl font-bold">Perfil do Usuário</h1>

			<Card>
				<CardHeader>
					<CardTitle>Informações Pessoais</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<div className="text-sm font-medium text-muted-foreground">
								Nome de Usuário
							</div>
							<p className="text-lg">{user.username}</p>
						</div>
						
						<div>
							<div className="text-sm font-medium text-muted-foreground">
								Nome de Exibição
							</div>
							<p className="text-lg">{user.displayName || "Não informado"}</p>
						</div>
						
						<div>
							<div className="text-sm font-medium text-muted-foreground">
								Email
							</div>
							<p className="text-lg">{user.email}</p>
						</div>
						
						<div>
							<div className="text-sm font-medium text-muted-foreground">
								Email Confirmado
							</div>
							<p className="text-lg">
								{user.emailConfirmed ? (
									<span className="text-success">✓ Confirmado</span>
								) : (
									<span className="text-warning">⚠ Não confirmado</span>
								)}
							</p>
						</div>
					</div>

					<div>
						<div className="text-sm font-medium text-muted-foreground">
							Funções do Sistema
						</div>
						<div className="flex flex-wrap gap-2 mt-1">
							{user.roles && user.roles.length > 0 ? (
								user.roles.map((role) => (
									<span
										key={role}
										className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
									>
										{role}
									</span>
								))
							) : (
								<span className="text-muted-foreground">Nenhuma função atribuída</span>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
