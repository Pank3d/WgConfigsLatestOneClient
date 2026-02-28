import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configService } from '../services/configService';
import { useConfigStore } from '../stores/useConfigStore';
import { useUIStore } from '../stores/useUIStore';

export function useConfigs() {
  const queryClient = useQueryClient();
  const { setConfigs, setMaxConfigs, setLoading, setError } = useConfigStore();
  const { showToast } = useUIStore();

  // Получение списка конфигов
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['configs'],
    queryFn: configService.getConfigs,
    onSuccess: (data) => {
      setConfigs(data.configs);
      setMaxConfigs(data.maxCount);
      setLoading(false);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to fetch configs');
      setLoading(false);
      showToast('Failed to load configs', 'error');
    },
  });

  // Создание конфига
  const createMutation = useMutation({
    mutationFn: (name?: string) => configService.createConfig(name),
    onSuccess: () => {
      queryClient.invalidateQueries(['configs']);
      showToast('Config created successfully!', 'success');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to create config';
      showToast(message, 'error');
    },
  });

  // Удаление конфига
  const deleteMutation = useMutation({
    mutationFn: (id: string) => configService.deleteConfig(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['configs']);
      showToast('Config deleted successfully!', 'success');
    },
    onError: () => {
      showToast('Failed to delete config', 'error');
    },
  });

  // Скачивание конфига
  const downloadConfig = async (id: string, name: string) => {
    try {
      await configService.downloadConfig(id, name);
      showToast('Config downloaded!', 'success');
    } catch (error) {
      showToast('Failed to download config', 'error');
    }
  };

  return {
    configs: data?.configs || [],
    count: data?.count || 0,
    maxCount: data?.maxCount || 3,
    isLoading,
    error,
    refetch,
    createConfig: createMutation.mutate,
    deleteConfig: deleteMutation.mutate,
    downloadConfig,
    isCreating: createMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    canCreateMore: (data?.count || 0) < (data?.maxCount || 3),
  };
}
