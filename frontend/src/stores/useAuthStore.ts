import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  username?: string;
  firstName: string;
  lastName?: string;
}

interface AuthStore {
  user: User | null;
  initData: string;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setInitData: (data: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      initData: '',
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),
      setInitData: (data) => set({ initData: data }),
      logout: () => set({ user: null, initData: '', isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
