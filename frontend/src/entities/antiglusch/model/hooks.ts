import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { antigluschApi } from '../api/antigluschApi';
import { useToast } from '@/shared/lib';

export const ANTIGLUSCH_QUERY_KEY = ['antiglusch'] as const;

export function useAntigluschConfigsQuery() {
  return useQuery({
    queryKey: ANTIGLUSCH_QUERY_KEY,
    queryFn: antigluschApi.getConfigs,
  });
}

export function useCreateAntigluschConfigMutation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (name?: string) => antigluschApi.createConfig(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANTIGLUSCH_QUERY_KEY });
      showToast('AntiGlusch конфиг создан!', 'success');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Не удалось создать конфиг';
      showToast(message, 'error');
    },
  });
}

export function useDeleteAntigluschConfigMutation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => antigluschApi.deleteConfig(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANTIGLUSCH_QUERY_KEY });
      showToast('AntiGlusch конфиг удалён!', 'success');
    },
    onError: () => {
      showToast('Не удалось удалить конфиг', 'error');
    },
  });
}

export function useCopyAntigluschLinkMutation() {
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const link = await antigluschApi.getLink(id);
      await navigator.clipboard.writeText(link);
      return link;
    },
    onSuccess: () => {
      showToast('Ссылка скопирована!', 'success');
    },
    onError: () => {
      showToast('Не удалось скопировать ссылку', 'error');
    },
  });
}
