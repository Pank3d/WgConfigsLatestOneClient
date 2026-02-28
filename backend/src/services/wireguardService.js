import apiClient from '../utils/apiClient.js';
import { getUserIdentifier } from '../utils/userIdentifier.js';

/**
 * Сервис для работы с WireGuard API
 */
class WireguardService {
  constructor() {
    // Кеш для списка клиентов
    this.clientsCache = null;
    this.cacheTimestamp = null;
    this.cacheTTL = 30000; // 30 секунд
  }

  /**
   * Проверяет актуальность кеша
   * @returns {boolean}
   */
  isCacheValid() {
    if (!this.clientsCache || !this.cacheTimestamp) {
      return false;
    }
    const now = Date.now();
    return now - this.cacheTimestamp < this.cacheTTL;
  }

  /**
   * Инвалидирует кеш
   */
  invalidateCache() {
    this.clientsCache = null;
    this.cacheTimestamp = null;
  }

  /**
   * Получает список всех клиентов WireGuard (с кешированием)
   * @param {boolean} forceRefresh - Принудительное обновление кеша
   * @returns {Promise<Array>} Список клиентов
   */
  async getClients(forceRefresh = false) {
    try {
      if (!forceRefresh && this.isCacheValid()) {
        console.log('Returning clients from cache');
        return this.clientsCache;
      }

      console.log('Fetching clients from API');
      const response = await apiClient.get('/api/wireguard/client');

      // Обновляем кеш
      this.clientsCache = response.data;
      this.cacheTimestamp = Date.now();

      return response.data;
    } catch (error) {
      console.error('Error fetching clients:', error);

      // Если есть старый кеш, возвращаем его в случае ошибки
      if (this.clientsCache) {
        console.warn('API failed, returning stale cache');
        return this.clientsCache;
      }

      throw error;
    }
  }

  /**
   * Создает нового клиента WireGuard
   * @param {string} name - Имя клиента
   * @returns {Promise<Object>} Результат создания клиента
   */
  async createClient(name) {
    try {
      const response = await apiClient.post('/api/wireguard/clientCreateTg', {
        name,
      });

      // Инвалидируем кеш после создания нового клиента
      this.invalidateCache();

      return response.data;
    } catch (error) {
      console.error('Error creating WireGuard client:', error);
      throw error;
    }
  }

  /**
   * Получает конфигурацию клиента по ID
   * @param {string} clientId - ID клиента
   * @returns {Promise<string>} Конфигурация клиента
   */
  async getClientConfiguration(clientId) {
    try {
      const response = await apiClient.get(
        `/api/wireguard/client/${clientId}/configuration`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching configuration for client ${clientId}:`, error);
      throw error;
    }
  }

  /**
   * Удаляет клиента
   * @param {string} clientId - ID клиента
   * @returns {Promise<Object>} Результат удаления
   */
  async deleteClient(clientId) {
    try {
      const response = await apiClient.delete(`/api/wireguard/client/${clientId}`);

      // Инвалидируем кеш после удаления
      this.invalidateCache();

      return response.data;
    } catch (error) {
      console.error(`Error deleting client ${clientId}:`, error);
      throw error;
    }
  }

  /**
   * Деактивирует клиента
   * @param {string} clientId - ID клиента
   * @returns {Promise<Object>} Результат деактивации
   */
  async disableClient(clientId) {
    try {
      const response = await apiClient.post(
        `/api/wireguard/client/${clientId}/disable`
      );

      // Инвалидируем кеш после деактивации
      this.invalidateCache();

      return response.data;
    } catch (error) {
      console.error(`Error disabling client ${clientId}:`, error);
      throw error;
    }
  }

  /**
   * Находит клиента по имени
   * @param {string} name - Имя клиента
   * @returns {Promise<Object|null>} Найденный клиент или null
   */
  async findClientByName(name) {
    try {
      const clients = await this.getClients();
      return clients.find((client) => client.name === name) || null;
    } catch (error) {
      console.error('Error finding client by name:', error);
      throw error;
    }
  }

  /**
   * Получает все конфиги пользователя
   * @param {Object} user - Объект пользователя
   * @returns {Promise<Array>} Список конфигов пользователя
   */
  async getUserConfigs(user) {
    try {
      const clients = await this.getClients();
      const identifier = getUserIdentifier(user);

      return clients.filter(
        (client) => client.name && client.name.startsWith(identifier)
      );
    } catch (error) {
      console.error('Error getting user configs:', error);
      throw error;
    }
  }
}

export default new WireguardService();
