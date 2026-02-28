import Button from '../ui/Button';
import Card from '../ui/Card';
import { useConfigs } from '../../hooks/useConfigs';

export default function ConfigCreator() {
  const { count, maxCount, isCreating, canCreateMore, createConfig } = useConfigs();

  const handleCreate = () => {
    createConfig();
  };

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-1">Создать новый конфиг</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Использовано: {count} из {maxCount}
          </p>
        </div>
        <Button
          onClick={handleCreate}
          disabled={!canCreateMore}
          isLoading={isCreating}
        >
          {canCreateMore ? 'Создать конфиг' : 'Лимит достигнут'}
        </Button>
      </div>
      {!canCreateMore && (
        <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Вы достигли максимального лимита конфигов ({maxCount}). Удалите один из существующих, чтобы создать новый.
          </p>
        </div>
      )}
    </Card>
  );
}
