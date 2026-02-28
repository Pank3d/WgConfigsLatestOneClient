import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTelegram } from './hooks/useTelegram';
import { useAuthStore } from './stores/useAuthStore';
import HomePage from './pages/HomePage';
import Toast from './components/ui/Toast';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppContent() {
  const { user, initData, isReady, webApp } = useTelegram();
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

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: webApp?.themeParams?.bg_color || '#ffffff',
        color: webApp?.themeParams?.text_color || '#000000',
      }}
    >
      <HomePage />
      <Toast />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
