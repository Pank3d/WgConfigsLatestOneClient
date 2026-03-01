import { api } from '@/shared/api';
import type { Config, ConfigsResponse } from '../model/types';

export const configApi = {
  getConfigs: async (): Promise<ConfigsResponse> => {
    const response = await api.get<ConfigsResponse>('/configs');
    return response.data;
  },

  createConfig: async (name?: string): Promise<Config> => {
    const response = await api.post<Config>('/configs', name ? { name } : {});
    return response.data;
  },

  deleteConfig: async (id: string): Promise<void> => {
    await api.delete(`/configs/${id}`);
  },

  downloadConfig: async (id: string, name: string): Promise<void> => {
    const response = await api.get(`/configs/${id}/download`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${name}.conf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
