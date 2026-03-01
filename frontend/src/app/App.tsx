import { Providers } from './providers';
import { useTelegramInit } from './init/telegramInit';
import { HomePage } from '@/pages/home';
import { Toast, ConfirmDialog, Modal, Spinner } from '@/shared/ui';

import './styles/index.css';

function AppContent() {
  const { isReady } = useTelegramInit();

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <HomePage />
      <Toast />
      <ConfirmDialog />
      <Modal />
    </div>
  );
}

export function App() {
  return (
    <Providers>
      <AppContent />
    </Providers>
  );
}
