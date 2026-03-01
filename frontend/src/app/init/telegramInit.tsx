import { useEffect } from 'react';
import { useTelegram } from '@/shared/lib';
import { useAuthStore } from '@/entities/user';

export function useTelegramInit() {
  const { user, initData, isReady } = useTelegram();
  const setUser = useAuthStore((state) => state.setUser);
  const setInitData = useAuthStore((state) => state.setInitData);

  useEffect(() => {
    if (user && initData) {
      setUser({
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
      });
      setInitData(initData);
    }
  }, [user, initData, setUser, setInitData]);

  return { isReady };
}
