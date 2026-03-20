import { useState } from 'react';
import { Button, Input } from '@skillers/ui';
import { Modal } from './modal';
import type { CreateGameDto } from '../types/game';

interface CreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateGameDto) => Promise<void>;
}

export function CreateGameModal({ isOpen, onClose, onSubmit }: CreateGameModalProps) {
  const [formData, setFormData] = useState<CreateGameDto>({
    rakeId: 1, // Default rake ID - you might want to load this from an API
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      await onSubmit(formData);
      // Reset form
      setFormData({ rakeId: 1 });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ rakeId: 1 });
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Game"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="rakeId" className="block text-sm font-medium text-gray-700 mb-1">
            Rake Configuration ID
          </label>
          <Input
            id="rakeId"
            type="number"
            value={formData.rakeId}
            onChange={(e) => setFormData(prev => ({ ...prev, rakeId: Number(e.target.value) }))}
            required
            min="1"
            className="w-full"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Select the rake configuration for this game
          </p>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Game Name (Optional)
          </label>
          <Input
            id="name"
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter game name"
            className="w-full"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter game description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Creating...' : 'Create Game'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
