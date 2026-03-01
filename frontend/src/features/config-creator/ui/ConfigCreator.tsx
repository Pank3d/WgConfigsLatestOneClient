import { Button, Card } from '@/shared/ui';
import { useConfigsQuery, useCreateConfigMutation } from '@/entities/config';

export function ConfigCreator() {
  const { data, isLoading } = useConfigsQuery();
  const createMutation = useCreateConfigMutation();

  const count = data?.count || 0;
  const maxCount = data?.maxCount || 3;
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
          <h2 className="text-base font-semibold mb-1 text-gray-900">Создать новый конфиг</h2>
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
          {canCreateMore ? 'Создать конфиг' : 'Лимит достигнут'}
        </Button>
      </div>
      {!canCreateMore && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Вы достигли максимального лимита конфигов ({maxCount}). Удалите один из существующих, чтобы создать новый.
          </p>
        </div>
      )}
    </Card>
  );
}
