import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configApi } from '../api/configApi';
import { useToast } from '@/shared/lib';

export const CONFIGS_QUERY_KEY = ['configs'] as const;

export function useConfigsQuery() {
  return useQuery({
    queryKey: CONFIGS_QUERY_KEY,
    queryFn: configApi.getConfigs,
  });
}

export function useCreateConfigMutation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (name?: string) => configApi.createConfig(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONFIGS_QUERY_KEY });
      showToast('Конфиг успешно создан!', 'success');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Не удалось создать конфиг';
      showToast(message, 'error');
    },
  });
}

export function useDeleteConfigMutation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => configApi.deleteConfig(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONFIGS_QUERY_KEY });
      showToast('Конфиг удалён!', 'success');
    },
    onError: () => {
      showToast('Не удалось удалить конфиг', 'error');
    },
  });
}

export function useDownloadConfigMutation() {
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      configApi.downloadConfig(id, name),
    onSuccess: () => {
      showToast('Конфиг скачан!', 'success');
    },
    onError: () => {
      showToast('Не удалось скачать конфиг', 'error');
    },
  });
}
