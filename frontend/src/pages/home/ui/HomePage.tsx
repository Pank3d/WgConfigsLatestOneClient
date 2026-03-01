import { useState } from 'react';
import { Tabs } from '@/shared/ui';
import { useAuthStore } from '@/entities/user';
import { ConfigCreator } from '@/features/config-creator';
import { ConfigList } from '@/features/config-list';
import { DownloadLinks } from '@/features/download-links';
import { Instructions } from '@/features/instructions';

const tabs = [
  { id: 'configs', label: 'Конфиги' },
  { id: 'payment', label: 'Оплата' },
  { id: 'instructions', label: 'Инструкция' },
];

type TabId = 'configs' | 'payment' | 'instructions';

export function HomePage() {
  const [activeTab, setActiveTab] = useState<TabId>('configs');
  const user = useAuthStore((state) => state.user);

  return (
    <div className="container mx-auto px-3 py-4 max-w-2xl">
      <header className="mb-4">
        <h1 className="text-xl font-bold mb-1">WireGuard VPN</h1>
        {user && (
          <p className="text-sm opacity-70">
            Привет, {user.firstName}! 👋
          </p>
        )}
      </header>

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as TabId)}
      />

      {activeTab === 'configs' && (
        <>
          <ConfigCreator />
          <ConfigList />
        </>
      )}

      {activeTab === 'payment' && (
        <div className="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Оплата</h2>
          <p className="text-sm text-gray-600 mb-4">
            Выберите подходящий тариф для продления подписки
          </p>
          <div className="text-center py-8 text-gray-500">
            Функционал оплаты в разработке
          </div>
        </div>
      )}

      {activeTab === 'instructions' && (
        <>
          <DownloadLinks />
          <Instructions />
        </>
      )}
    </div>
  );
}
