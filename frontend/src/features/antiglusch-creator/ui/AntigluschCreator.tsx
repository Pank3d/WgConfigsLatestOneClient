import { Button, Card } from '@/shared/ui';
import { useAntigluschConfigsQuery, useCreateAntigluschConfigMutation } from '@/entities/antiglusch';

export function AntigluschCreator() {
  const { data, isLoading } = useAntigluschConfigsQuery();
  const createMutation = useCreateAntigluschConfigMutation();

  const count = data?.count || 0;
  const maxCount = data?.maxCount || 1;
  const canCreateMore = count < maxCount;
  const isCreating = createMutation.isPending;

  const handleCreate = () => {
    createMutation.mutate(undefined);
  };

  if (isLoading) {
    return null;
  }

  return (
    <Card className="mb-4">
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold mb-1 text-gray-900">Создать AntiGlusch конфиг</h2>
          <p className="text-sm text-gray-600">
            Использовано: {count} из {maxCount}
          </p>
        </div>
        <Button
          onClick={handleCreate}
          disabled={!canCreateMore || isCreating}
          isLoading={isCreating}
          className="w-full"
        >
          {canCreateMore ? 'Создать AntiGlusch конфиг' : 'Лимит достигнут'}
        </Button>
      </div>
      {!canCreateMore && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Вы достигли лимита AntiGlusch конфигов ({maxCount}). Удалите существующий или докупите дополнительный.
          </p>
        </div>
      )}
    </Card>
  );
}
