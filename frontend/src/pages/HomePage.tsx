import { useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import ConfigCreator from '../components/features/ConfigCreator';
import ConfigList from '../components/features/ConfigList';
import DownloadLinks from '../components/features/DownloadLinks';
import Instructions from '../components/features/Instructions';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'configs' | 'instructions'>('configs');
  const user = useAuthStore((state) => state.user);

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-2">WireGuard VPN</h1>
        {user && (
          <p className="text-sm opacity-70">
            Привет, {user.firstName}! 👋
          </p>
        )}
      </header>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('configs')}
          className={`flex-1 py-2 px-4 rounded-lg transition-colors font-medium ${
            activeTab === 'configs'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          Конфиги
        </button>
        <button
          onClick={() => setActiveTab('instructions')}
          className={`flex-1 py-2 px-4 rounded-lg transition-colors font-medium ${
            activeTab === 'instructions'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          Инструкция
        </button>
      </div>

      {activeTab === 'configs' ? (
        <>
          <ConfigCreator />
          <ConfigList />
        </>
      ) : (
        <>
          <DownloadLinks />
          <Instructions />
        </>
      )}
    </div>
  );
}
