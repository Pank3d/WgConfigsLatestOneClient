import axios from 'axios';
import { config } from '../config/env.js';

/**
 * Сервис для работы с Telegram Bot API
 */
class TelegramService {
  constructor() {
    this.botToken = config.telegram.botToken;
    this.apiURL = `https://api.telegram.org/bot${this.botToken}`;
  }

  /**
   * Проверяет подписку пользователя на канал
   * @param {number} userId - ID пользователя
   * @param {string} channelId - ID канала (например, @wireguardvpntop)
   * @returns {Promise<boolean>} true если пользователь подписан
   */
  async checkChannelSubscription(userId, channelId) {
    try {
      const response = await axios.get(`${this.apiURL}/getChatMember`, {
        params: {
          chat_id: channelId,
          user_id: userId,
        },
      });

      const status = response.data.result.status;
      return ['member', 'administrator', 'creator'].includes(status);
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  }

  /**
   * Отправляет сообщение пользователю
   * @param {number} chatId - ID чата
   * @param {string} text - Текст сообщения
   * @param {Object} options - Дополнительные опции
   * @returns {Promise<Object>} Результат отправки
   */
  async sendMessage(chatId, text, options = {}) {
    try {
      const response = await axios.post(`${this.apiURL}/sendMessage`, {
        chat_id: chatId,
        text,
        ...options,
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
}

export default new TelegramService();
