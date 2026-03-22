import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button, Input } from "@skillers/ui";
import { Plus, X } from "lucide-react";
import { authHttpService, type UserAdminEntry } from "../http/auth.service";
import { useAuth } from "../contexts/auth-context";

interface PlayerEntry {
	id: number;
	name: string;
	userid: string | null;
}

export function AdminPage() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [users, setUsers] = useState<UserAdminEntry[]>([]);
	const [players, setPlayers] = useState<PlayerEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [savingPlayer, setSavingPlayer] = useState<string | null>(null);
	const [showCreateUser, setShowCreateUser] = useState(false);
	const [newUser, setNewUser] = useState({ username: '', email: '', password: '', displayName: '' });
	const [creatingUser, setCreatingUser] = useState(false);

	useEffect(() => {
		if (!user?.isadmin) {
			navigate("/app");
			return;
		}
		Promise.all([authHttpService.listUsers(), authHttpService.listPlayers()])
			.then(([u, p]) => {
				setUsers(u);
				setPlayers(p);
			})
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

	const handlePlayerChange = async (targetUser: UserAdminEntry, value: string) => {
		const playerId = value === "none" ? null : Number(value);
		setSavingPlayer(targetUser.id);
		try {
			await authHttpService.setUserPlayer(targetUser.id, playerId);
			const newPlayer = playerId !== null
				? players.find((p) => p.id === playerId) ?? null
				: null;
			setUsers((prev) =>
				prev.map((u) =>
					u.id === targetUser.id
						? { ...u, player: newPlayer ? { id: String(newPlayer.id), name: newPlayer.name } : null }
						: u
				)
			);
			// Update players list to reflect new userid associations
			setPlayers((prev) =>
				prev.map((p) => {
					if (p.userid === targetUser.id) return { ...p, userid: null };
					if (p.id === playerId) return { ...p, userid: targetUser.id };
					return p;
				})
			);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Erro ao associar jogador");
		} finally {
			setSavingPlayer(null);
		}
	};

	const handleCreateUser = async (e: React.FormEvent) => {
		e.preventDefault();
		setCreatingUser(true);
		try {
			const created = await authHttpService.createUser({
				username: newUser.username,
				email: newUser.email,
				password: newUser.password,
				displayName: newUser.displayName || undefined,
			});
			setUsers((prev) => [{ ...created, createddate: new Date().toISOString(), player: null }, ...prev]);
			setShowCreateUser(false);
			setNewUser({ username: '', email: '', password: '', displayName: '' });
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Erro ao criar usuário');
		} finally {
			setCreatingUser(false);
		}
	};

	const getPlayerValue = (u: UserAdminEntry) =>
		u.player ? String(players.find((p) => p.name === u.player?.name)?.id ?? "none") : "none";

	const getAvailablePlayers = (u: UserAdminEntry) =>
		players.filter((p) => p.userid === null || p.userid === u.id);

	if (loading) return <div className="text-center py-12 text-muted-foreground">Carregando...</div>;

	return (
		<div className="space-y-6">
			<div className="flex items-start justify-between">
				<div>
					<h1 className="text-3xl font-bold mb-2">Administração</h1>
					<p className="text-muted-foreground">Gestão de usuários e permissões</p>
				</div>
				<Button onClick={() => setShowCreateUser(true)} className="flex items-center gap-2">
					<Plus className="w-4 h-4" />
					Novo Usuário
				</Button>
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
							<div key={u.id} className="grid grid-cols-4 gap-4 p-4 border-b last:border-b-0 hover:bg-muted/50 items-center">
								<div className="font-medium">{u.displayName || u.username || "—"}</div>
								<div className="text-sm text-muted-foreground">{u.email || "—"}</div>
								<div>
									<Select
										value={getPlayerValue(u)}
										onValueChange={(val) => handlePlayerChange(u, val)}
										disabled={savingPlayer === u.id}
									>
										<SelectTrigger className="h-8 text-sm">
											<SelectValue placeholder="Sem jogador" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">— Nenhum —</SelectItem>
											{getAvailablePlayers(u).map((p) => (
												<SelectItem key={p.id} value={String(p.id)}>
													{p.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
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
							<div key={u.id} className="border rounded-lg p-4 space-y-3">
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
								<div>
									<p className="text-xs text-muted-foreground mb-1">Jogador associado</p>
									<Select
										value={getPlayerValue(u)}
										onValueChange={(val) => handlePlayerChange(u, val)}
										disabled={savingPlayer === u.id}
									>
										<SelectTrigger className="h-8 text-sm">
											<SelectValue placeholder="Sem jogador" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">— Nenhum —</SelectItem>
											{getAvailablePlayers(u).map((p) => (
												<SelectItem key={p.id} value={String(p.id)}>
													{p.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
			{showCreateUser && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4 space-y-4">
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-semibold">Novo Usuário</h2>
							<button type="button" onClick={() => setShowCreateUser(false)} className="p-1 rounded hover:bg-muted">
								<X className="w-4 h-4" />
							</button>
						</div>
						<form onSubmit={handleCreateUser} className="space-y-3">
							<div>
								<label className="block text-sm font-medium mb-1">Username</label>
								<Input
									value={newUser.username}
									onChange={(e) => setNewUser((p) => ({ ...p, username: e.target.value }))}
									placeholder="username"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Email</label>
								<Input
									type="email"
									value={newUser.email}
									onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
									placeholder="email@exemplo.com"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Senha</label>
								<Input
									type="password"
									value={newUser.password}
									onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
									placeholder="Mínimo 6 caracteres"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Nome de exibição (opcional)</label>
								<Input
									value={newUser.displayName}
									onChange={(e) => setNewUser((p) => ({ ...p, displayName: e.target.value }))}
									placeholder="Nome completo"
								/>
							</div>
							<div className="flex gap-2 pt-2">
								<Button type="button" variant="outline" onClick={() => setShowCreateUser(false)} className="flex-1" disabled={creatingUser}>
									Cancelar
								</Button>
								<Button type="submit" className="flex-1" disabled={creatingUser}>
									{creatingUser ? 'Criando...' : 'Criar Usuário'}
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
