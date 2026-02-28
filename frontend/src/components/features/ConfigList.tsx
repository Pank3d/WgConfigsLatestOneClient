import Card from '../ui/Card';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { useConfigs } from '../../hooks/useConfigs';

export default function ConfigList() {
  const { configs, isLoading, downloadConfig, deleteConfig, isDeleting } = useConfigs();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (configs.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-semibold mb-2">Нет конфигов</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Создайте свой первый конфиг для использования VPN
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {configs.map((config) => (
        <Card key={config.id}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{config.name}</h3>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  {config.enabled ? (
                    <>
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                      Активен
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-gray-400 rounded-full" />
                      Неактивен
                    </>
                  )}
                </span>
                <span>•</span>
                <span>
                  {new Date(config.created).toLocaleDateString('ru-RU')}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => downloadConfig(config.id, config.name)}
              >
                Скачать
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  if (window.confirm('Вы уверены, что хотите удалить этот конфиг?')) {
                    deleteConfig(config.id);
                  }
                }}
                disabled={isDeleting}
              >
                Удалить
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
