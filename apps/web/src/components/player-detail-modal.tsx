import { useEffect, useState } from 'react';
import { Card, CardContent } from '@skillers/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@skillers/ui';
import {
	DollarSign,
	Gamepad2,
	TrendingUp,
	Calendar,
	User,
	Eye,
	AlertCircle,
	Loader,
} from 'lucide-react';
import { Modal } from './modal';
import { playerHttpService } from '../http/player.service';
import type { PlayerDetails } from '../http/player.service';

interface PlayerDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	playerId: string | null;
}

export function PlayerDetailModal({ isOpen, onClose, playerId }: PlayerDetailModalProps) {
	const [details, setDetails] = useState<PlayerDetails | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (isOpen && playerId) {
			loadPlayerDetails(playerId);
		}
	}, [isOpen, playerId]);

	const loadPlayerDetails = async (id: string) => {
		try {
			setLoading(true);
			setError(null);
			const data = await playerHttpService.getPlayerDetails(id);
			setDetails(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erro ao carregar detalhes do jogador');
			console.error('Erro ao carregar detalhes:', err);
		} finally {
			setLoading(false);
		}
	};

	const getUserInitials = (name: string) => {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase();
	};

	const formatDate = (date: string | Date) => {
		return new Date(date).toLocaleDateString('pt-BR', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'BRL',
		}).format(value);
	};

	if (!playerId || !isOpen) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Detalhes do Jogador"
			maxWidth="max-w-3xl"
		>
			{loading && (
				<div className="flex items-center justify-center py-12">
					<div className="text-center space-y-4">
						<Loader className="w-8 h-8 animate-spin" />
						<p className="text-muted-foreground">Carregando detalhes...</p>
					</div>
				</div>
			)}

			{error && (
				<div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md flex items-start gap-3">
					<AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
					<div>
						<h3 className="font-semibold text-red-900 dark:text-red-200">Erro</h3>
						<p className="text-sm text-red-800 dark:text-red-300">{error}</p>
					</div>
				</div>
			)}

			{details && !loading && (
				<div className="space-y-6">
					{/* Player Header */}
					<div className="flex items-start gap-4 pb-6 border-b">
						<Avatar className="h-20 w-20 flex-shrink-0">
							<AvatarImage
								src={details.imageurl || `https://api.dicebear.com/7.x/initials/svg?seed=${details.name}&backgroundColor=EC681B`}
								alt={details.name}
							/>
							<AvatarFallback className="bg-primary text-primary-foreground text-2xl">
								{getUserInitials(details.name)}
							</AvatarFallback>
						</Avatar>

						<div className="flex-1">
							<div className="flex items-center gap-2 mb-1">
								<h1 className="text-2xl font-bold">{details.name}</h1>
								<span
									className={`px-2 py-1 text-xs font-medium rounded-full ${
										details.isactive
											? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
											: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
									}`}
								>
									{details.isactive ? 'Ativo' : 'Inativo'}
								</span>
							</div>
							<p className="text-sm text-muted-foreground">ID: {playerId}</p>
						</div>
					</div>

					{/* Stats Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<Card>
							<CardContent className="p-4">
								<div className="flex items-start justify-between">
									<div>
										<p className="text-sm text-muted-foreground mb-1">Total Buy-In</p>
										<p className="text-2xl font-bold">
											{formatCurrency(details.totalBuyIn)}
										</p>
									</div>
									<DollarSign className="w-5 h-5 text-blue-500 flex-shrink-0" />
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="p-4">
								<div className="flex items-start justify-between">
									<div>
										<p className="text-sm text-muted-foreground mb-1">Total Cash-Out</p>
										<p className="text-2xl font-bold">
											{formatCurrency(details.totalCashout)}
										</p>
									</div>
									<DollarSign className="w-5 h-5 text-orange-500 flex-shrink-0" />
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="p-4">
								<div className="flex items-start justify-between">
									<div>
										<p className="text-sm text-muted-foreground mb-1">Lucro Total</p>
										<p
											className={`text-2xl font-bold ${
												details.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
											}`}
										>
											{formatCurrency(details.totalProfit)}
										</p>
									</div>
									<TrendingUp
										className={`w-5 h-5 flex-shrink-0 ${
											details.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
										}`}
									/>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="p-4">
								<div className="flex items-start justify-between">
									<div>
										<p className="text-sm text-muted-foreground mb-1">Taxas</p>
										<p className="text-2xl font-bold">
											{formatCurrency(details.totalTip)}
										</p>
									</div>
									<User className="w-5 h-5 text-yellow-500 flex-shrink-0" />
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Additional Stats */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<Card>
							<CardContent className="p-4">
								<div className="flex items-start justify-between">
									<div>
										<p className="text-sm text-muted-foreground mb-1">Partidas Jogadas</p>
										<p className="text-3xl font-bold">{details.gamesPlayed}</p>
									</div>
									<Gamepad2 className="w-5 h-5 text-purple-500 flex-shrink-0" />
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="p-4">
								<div className="flex items-start justify-between">
									<div>
										<p className="text-sm text-muted-foreground mb-1">Visualizações</p>
										<p className="text-3xl font-bold">{details.viewCount}</p>
									</div>
									<Eye className="w-5 h-5 text-cyan-500 flex-shrink-0" />
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="p-4">
								<div>
									<p className="text-sm text-muted-foreground mb-1">Lucro Médio</p>
									<p className="text-3xl font-bold">
										{details.gamesPlayed > 0
											? formatCurrency(details.totalProfit / details.gamesPlayed)
											: formatCurrency(0)}
									</p>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Dates Section */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
						<div>
							<div className="flex items-center gap-2 mb-2">
								<Calendar className="w-4 h-4 text-muted-foreground" />
								<label className="text-sm font-medium">Primeira Partida</label>
							</div>
							<p className="text-sm text-muted-foreground">
								{formatDate(details.firstgamedate)}
							</p>
						</div>
						<div>
							<div className="flex items-center gap-2 mb-2">
								<Calendar className="w-4 h-4 text-muted-foreground" />
								<label className="text-sm font-medium">Última Atualização</label>
							</div>
							<p className="text-sm text-muted-foreground">
								{formatDate(details.lastmodifieddate)}
							</p>
						</div>
					</div>
				</div>
			)}
		</Modal>
	);
}
