import axios from 'axios';
import { useAuthStore } from '@/entities/user';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - добавляем Telegram initData в каждый запрос
api.interceptors.request.use(
  (config) => {
    const initData = useAuthStore.getState().initData;

    if (initData) {
      config.headers['X-Init-Data'] = initData;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - обработка ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Невалидная авторизация - выходим
      useAuthStore.getState().logout();
      console.error('Unauthorized - invalid Telegram data');
    }

    return Promise.reject(error);
  }
);

export { api };
