import api from './api';
import type { Config } from '../stores/useConfigStore';

export interface ConfigsResponse {
  configs: Config[];
  count: number;
  maxCount: number;
}

export interface CreateConfigResponse {
  success: boolean;
  config: {
    id: string;
    name: string;
    configData: string;
  };
}

export const configService = {
  /**
   * Получить список конфигов пользователя
   */
  async getConfigs(): Promise<ConfigsResponse> {
    const response = await api.get<ConfigsResponse>('/configs');
    return response.data;
  },

  /**
   * Создать новый конфиг
   */
  async createConfig(name?: string): Promise<CreateConfigResponse> {
    const response = await api.post<CreateConfigResponse>('/configs', { name });
    return response.data;
  },

  /**
   * Скачать конфиг файл
   */
  async downloadConfig(id: string, configName: string): Promise<void> {
    const response = await api.get(`/configs/${id}/download`, {
      responseType: 'blob',
    });

    // Создаем blob URL и скачиваем файл
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${configName}.conf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Удалить конфиг
   */
  async deleteConfig(id: string): Promise<void> {
    await api.delete(`/configs/${id}`);
  },

  /**
   * Деактивировать конфиг
   */
  async disableConfig(id: string): Promise<void> {
    await api.post(`/configs/${id}/disable`);
  },
};
