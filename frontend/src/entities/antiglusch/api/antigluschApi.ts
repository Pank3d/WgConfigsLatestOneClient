import { api } from '@/shared/api';
import type { AntigluschConfigsResponse, AntigluschLinkResponse, CreateAntigluschResponse } from '../model/types';

export const antigluschApi = {
  getConfigs: async (): Promise<AntigluschConfigsResponse> => {
    const response = await api.get<AntigluschConfigsResponse>('/antiglusch');
    return response.data;
  },

  createConfig: async (name?: string): Promise<CreateAntigluschResponse> => {
    const response = await api.post<CreateAntigluschResponse>('/antiglusch', name ? { name } : {});
    return response.data;
  },

  deleteConfig: async (id: string): Promise<void> => {
    await api.delete(`/antiglusch/${id}`);
  },

  getLink: async (id: string): Promise<string> => {
    const response = await api.get<AntigluschLinkResponse>(`/antiglusch/${id}/link`);
    return response.data.link;
  },
};
