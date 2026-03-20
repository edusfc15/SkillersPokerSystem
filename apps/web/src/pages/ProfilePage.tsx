import { Card, CardContent, CardHeader, CardTitle } from "@skillers/ui";
import { useAuth } from "../contexts/auth-context";
import { authHttpService } from "../http/auth.service";
import { useState } from "react";

export function ProfilePage() {
	const { user } = useAuth();
	const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
	const [pwLoading, setPwLoading] = useState(false);
	const [pwError, setPwError] = useState<string | null>(null);
	const [pwSuccess, setPwSuccess] = useState(false);

	const handleChangePassword = async (e: React.FormEvent) => {
		e.preventDefault();
		if (pwForm.newPw !== pwForm.confirm) {
			setPwError("As senhas não coincidem");
			return;
		}
		if (pwForm.newPw.length < 6) {
			setPwError("Nova senha deve ter pelo menos 6 caracteres");
			return;
		}
		try {
			setPwLoading(true);
			setPwError(null);
			await authHttpService.changePassword(pwForm.current, pwForm.newPw);
			setPwSuccess(true);
			setPwForm({ current: "", newPw: "", confirm: "" });
			setTimeout(() => setPwSuccess(false), 3000);
		} catch (e) {
			setPwError(e instanceof Error ? e.message : "Erro ao alterar senha");
		} finally {
			setPwLoading(false);
		}
	};

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

			<Card>
				<CardHeader>
					<CardTitle>Alterar Senha</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleChangePassword} className="space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Senha Atual</label>
							<input
								type="password"
								value={pwForm.current}
								onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
								className="w-full px-3 py-2 border rounded-md text-sm bg-background"
								required
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Nova Senha</label>
							<input
								type="password"
								value={pwForm.newPw}
								onChange={(e) => setPwForm((f) => ({ ...f, newPw: e.target.value }))}
								className="w-full px-3 py-2 border rounded-md text-sm bg-background"
								required
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Confirmar Nova Senha</label>
							<input
								type="password"
								value={pwForm.confirm}
								onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
								className="w-full px-3 py-2 border rounded-md text-sm bg-background"
								required
							/>
						</div>
						{pwError && <p className="text-sm text-red-500">{pwError}</p>}
						{pwSuccess && <p className="text-sm text-green-500">Senha alterada com sucesso!</p>}
						<button
							type="submit"
							disabled={pwLoading}
							className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
						>
							{pwLoading ? "Salvando..." : "Alterar Senha"}
						</button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
