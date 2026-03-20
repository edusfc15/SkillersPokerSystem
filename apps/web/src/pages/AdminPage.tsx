import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@skillers/ui";
import { authHttpService, type UserAdminEntry } from "../http/auth.service";
import { useAuth } from "../contexts/auth-context";

export function AdminPage() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [users, setUsers] = useState<UserAdminEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!user?.isadmin) {
			navigate("/app");
			return;
		}
		authHttpService
			.listUsers()
			.then(setUsers)
			.catch((e) => setError(e.message))
			.finally(() => setLoading(false));
	}, [user, navigate]);

	const toggleAdmin = async (targetUser: UserAdminEntry) => {
		try {
			await authHttpService.setUserRole(targetUser.id, !targetUser.isadmin);
			setUsers((prev) =>
				prev.map((u) => (u.id === targetUser.id ? { ...u, isadmin: !u.isadmin } : u))
			);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Erro ao atualizar");
		}
	};

	if (loading) return <div className="text-center py-12 text-muted-foreground">Carregando...</div>;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold mb-2">Administração</h1>
				<p className="text-muted-foreground">Gestão de usuários e permissões</p>
			</div>

			{error && (
				<div className="p-3 rounded-md bg-red-100 text-red-700 text-sm">{error}</div>
			)}

			<Card>
				<CardHeader>
					<CardTitle>Usuários ({users.length})</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					<div className="hidden md:block">
						<div className="grid grid-cols-4 gap-4 p-4 text-sm font-medium text-muted-foreground border-b">
							<div>Usuário</div>
							<div>Email</div>
							<div>Jogador</div>
							<div>Admin</div>
						</div>
						{users.map((u) => (
							<div key={u.id} className="grid grid-cols-4 gap-4 p-4 border-b last:border-b-0 hover:bg-muted/50">
								<div className="font-medium">{u.displayName || u.username || "—"}</div>
								<div className="text-sm text-muted-foreground">{u.email || "—"}</div>
								<div className="text-sm">{u.player?.name || "—"}</div>
								<div>
									<button
										type="button"
										onClick={() => toggleAdmin(u)}
										disabled={u.id === user?.id}
										className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
											u.isadmin
												? "bg-orange-100 text-orange-700 hover:bg-orange-200"
												: "bg-muted text-muted-foreground hover:bg-muted/80"
										} disabled:opacity-40 disabled:cursor-not-allowed`}
									>
										{u.isadmin ? "Admin" : "Usuário"}
									</button>
								</div>
							</div>
						))}
					</div>

					{/* Mobile */}
					<div className="md:hidden space-y-4 p-4">
						{users.map((u) => (
							<div key={u.id} className="border rounded-lg p-4 space-y-2">
								<div className="flex items-center justify-between">
									<div>
										<div className="font-medium">{u.displayName || u.username}</div>
										<div className="text-sm text-muted-foreground">{u.email}</div>
									</div>
									<button
										type="button"
										onClick={() => toggleAdmin(u)}
										disabled={u.id === user?.id}
										className={`px-3 py-1 text-xs rounded-full font-medium ${
											u.isadmin ? "bg-orange-100 text-orange-700" : "bg-muted text-muted-foreground"
										} disabled:opacity-40`}
									>
										{u.isadmin ? "Admin" : "Usuário"}
									</button>
								</div>
								{u.player && <div className="text-sm text-muted-foreground">Jogador: {u.player.name}</div>}
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
