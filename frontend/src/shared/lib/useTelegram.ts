import { useEffect, useState } from 'react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface WebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    [key: string]: any;
  };
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  MainButton: any;
  BackButton: any;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: WebApp;
    };
  }
}

export function useTelegram() {
  const [webApp, setWebApp] = useState<WebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [initData, setInitData] = useState<string>('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (tg) {
      tg.ready();
      tg.expand();

      setWebApp(tg);
      setUser(tg.initDataUnsafe?.user || null);
      setInitData(tg.initData || '');
      setIsReady(true);

      // Устанавливаем тему
      if (tg.colorScheme) {
        document.documentElement.classList.add(tg.colorScheme);
      }
    } else {
      // Если не в Telegram — редирект на бота
      if (import.meta.env.DEV) {
        console.warn('Telegram WebApp not available, using mock data');
        const mockUser = {
          id: 123456789,
          first_name: 'Test',
          last_name: 'User',
          username: 'testuser',
        };
        setUser(mockUser);
        setInitData('mock_init_data_for_development');
        setIsReady(true);
      } else {
        window.location.href = 'https://t.me/WgShopBot';
      }
    }
  }, []);

  return {
    webApp,
    user,
    initData,
    isReady,
    colorScheme: webApp?.colorScheme || 'light',
    themeParams: webApp?.themeParams || {},
  };
}
