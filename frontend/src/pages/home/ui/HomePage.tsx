import { useState } from 'react';
import { Tabs } from '@/shared/ui';
import { useAuthStore } from '@/entities/user';
import { ConfigCreator } from '@/features/config-creator';
import { ConfigList } from '@/features/config-list';
import { DownloadLinks } from '@/features/download-links';
import { Instructions } from '@/features/instructions';
import { PaymentPlans, Paywall } from '@/features/payment';

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
        <h1 className="text-xl font-bold mb-1">Wgshoppr.ru</h1>
        {user && (
          <p className="text-sm opacity-70">Привет, {user.firstName}!</p>
        )}
      </header>

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as TabId)}
      />

      {activeTab === "configs" && (
        <Paywall onGoToPayment={() => setActiveTab("payment")}>
          <ConfigCreator />
          <ConfigList />
        </Paywall>
      )}

      {activeTab === "payment" && <PaymentPlans />}

      {activeTab === "instructions" && (
        <>
          <DownloadLinks />
          <Instructions />
        </>
      )}
    </div>
  );
}
