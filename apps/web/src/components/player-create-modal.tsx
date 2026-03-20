import { useState } from 'react';
import { Button, Input, Card, CardContent } from '@skillers/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@skillers/ui';
import { AlertCircle, Loader, Plus, X } from 'lucide-react';
import { Modal } from './modal';
import { playerHttpService } from '../http/player.service';

interface PlayerCreateModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
	userid: string;
}

export function PlayerCreateModal({ isOpen, onClose, onSuccess, userid }: PlayerCreateModalProps) {
	const [formData, setFormData] = useState({ name: '', imageurl: '', isactive: false });
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSave = async () => {
		if (!formData.name.trim()) {
			setError('Nome não pode estar vazio');
			return;
		}

		try {
			setSaving(true);
			setError(null);
			await playerHttpService.createPlayer({
				name: formData.name,
				imageurl: formData.imageurl || undefined,
				isactive: formData.isactive,
				userid: userid,
			});
			setFormData({ name: '', imageurl: '', isactive: false });
			onSuccess?.();
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erro ao criar jogador');
		} finally {
			setSaving(false);
		}
	};

	const getUserInitials = (name: string) => {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	if (!isOpen) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Adicionar Novo Jogador"
			maxWidth="max-w-2xl"
		>
			{error && (
				<div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md flex items-start gap-3 mb-6">
					<AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
					<div>
						<h3 className="font-semibold text-red-900 dark:text-red-200">Erro</h3>
						<p className="text-sm text-red-800 dark:text-red-300">{error}</p>
					</div>
				</div>
			)}

			<div className="space-y-6">
				{/* Avatar Preview */}
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-4">
							<Avatar className="h-16 w-16">
								<AvatarImage
									src={formData.imageurl || `https://api.dicebear.com/7.x/initials/svg?seed=${formData.name || 'Novo'}&backgroundColor=EC681B`}
									alt={formData.name}
								/>
								<AvatarFallback className="bg-primary text-primary-foreground text-lg">
									{getUserInitials(formData.name || 'NJ')}
								</AvatarFallback>
							</Avatar>
							<div>
								<p className="text-sm text-muted-foreground">Pré-visualização do Avatar</p>
								<p className="font-medium">{formData.name || 'Nome do Jogador'}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Form Fields */}
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium mb-2">Nome do Jogador *</label>
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
							Ativar Jogador Imediatamente
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
								Criando...
							</>
						) : (
							<>
								<Plus className="w-4 h-4" />
								Adicionar Jogador
							</>
						)}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
