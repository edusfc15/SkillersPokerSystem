import { useEffect, useState } from 'react';
import { Button, Input, Card, CardContent } from '@skillers/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@skillers/ui';
import { AlertCircle, Loader, Save, X } from 'lucide-react';
import { Modal } from './modal';
import { playerHttpService, PlayerDetails } from '../http/player.service';

interface PlayerEditModalProps {
	isOpen: boolean;
	onClose: () => void;
	playerId: string | null;
	onSuccess?: () => void;
}

export function PlayerEditModal({ isOpen, onClose, playerId, onSuccess }: PlayerEditModalProps) {
	const [details, setDetails] = useState<PlayerDetails | null>(null);
	const [formData, setFormData] = useState({ name: '', imageurl: '', isactive: true });
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
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
			setFormData({
				name: data.name,
				imageurl: data.imageurl || '',
				isactive: data.isactive,
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erro ao carregar dados do jogador');
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		if (!playerId || !formData.name.trim()) {
			setError('Nome não pode estar vazio');
			return;
		}

		try {
			setSaving(true);
			setError(null);
			await playerHttpService.updatePlayer(playerId, {
				name: formData.name,
				imageurl: formData.imageurl || undefined,
				isactive: formData.isactive,
			});
			onSuccess?.();
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erro ao salvar jogador');
		} finally {
			setSaving(false);
		}
	};

	const getUserInitials = (name: string) => {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase();
	};

	if (!playerId || !isOpen) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Editar Jogador"
			maxWidth="max-w-2xl"
		>
			{loading && (
				<div className="flex items-center justify-center py-12">
					<div className="text-center space-y-4">
						<Loader className="w-8 h-8 animate-spin" />
						<p className="text-muted-foreground">Carregando dados...</p>
					</div>
				</div>
			)}

			{error && (
				<div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md flex items-start gap-3 mb-6">
					<AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
					<div>
						<h3 className="font-semibold text-red-900 dark:text-red-200">Erro</h3>
						<p className="text-sm text-red-800 dark:text-red-300">{error}</p>
					</div>
				</div>
			)}

			{details && !loading && (
				<div className="space-y-6">
					{/* Avatar Preview */}
					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-4">
								<Avatar className="h-16 w-16">
									<AvatarImage
										src={formData.imageurl || `https://api.dicebear.com/7.x/initials/svg?seed=${formData.name}&backgroundColor=EC681B`}
										alt={formData.name}
									/>
									<AvatarFallback className="bg-primary text-primary-foreground text-lg">
										{getUserInitials(formData.name)}
									</AvatarFallback>
								</Avatar>
								<div>
									<p className="text-sm text-muted-foreground">Avatar Preview</p>
									<p className="font-medium">{formData.name || 'Nome do Jogador'}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Form Fields */}
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium mb-2">Nome do Jogador</label>
							<Input
								type="text"
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								placeholder="Digite o nome do jogador"
								className="w-full"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium mb-2">URL da Imagem</label>
							<Input
								type="url"
								value={formData.imageurl}
								onChange={(e) => setFormData({ ...formData, imageurl: e.target.value })}
								placeholder="https://example.com/image.jpg"
								className="w-full"
							/>
							<p className="text-xs text-muted-foreground mt-1">
								Deixe vazio para usar avatar padrão
							</p>
						</div>

						<div className="flex items-center gap-3 p-3 border border-input rounded-md bg-muted/50">
							<input
								type="checkbox"
								id="isactive"
								checked={formData.isactive}
								onChange={(e) => setFormData({ ...formData, isactive: e.target.checked })}
								className="rounded border-gray-300"
							/>
							<label htmlFor="isactive" className="text-sm font-medium cursor-pointer flex-1">
								Jogador Ativo
							</label>
							<span
								className={`text-xs px-2 py-1 rounded-full ${
									formData.isactive
										? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
										: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
								}`}
							>
								{formData.isactive ? 'Ativo' : 'Inativo'}
							</span>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-3 justify-end pt-6 border-t">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={saving}
							className="flex items-center gap-2"
						>
							<X className="w-4 h-4" />
							Cancelar
						</Button>
						<Button
							type="button"
							onClick={handleSave}
							disabled={saving || !formData.name.trim()}
							className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600"
						>
							{saving ? (
								<>
									<Loader className="w-4 h-4 animate-spin" />
									Salvando...
								</>
							) : (
								<>
									<Save className="w-4 h-4" />
									Salvar Alterações
								</>
							)}
						</Button>
					</div>
				</div>
			)}
		</Modal>
	);
}
