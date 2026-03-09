import { Providers } from "./providers";
import { useTelegramInit } from "./init/telegramInit";
import { useAuthStore } from "@/entities/user";
import { HomePage } from "@/pages/home";
import { Toast, ConfirmDialog, Modal, Spinner } from "@/shared/ui";

import "./styles/index.css";

function TelegramRequired() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-6 text-center">
      <div className="text-6xl mb-6">🔒</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">Wgshoppr.ru</h1>
      <p className="text-gray-600 mb-8 max-w-sm">
        Это приложение работает только через Telegram. Откройте его в боте для
        доступа к VPN-конфигурациям.
      </p>
      <a
        href="https://t.me/WgShopBot"
        className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
      >
        Открыть в Telegram
      </a>
    </div>
  );
}

function AppContent() {
  const { isReady } = useTelegramInit();
  const user = useAuthStore((state) => state.user);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <TelegramRequired />;
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
