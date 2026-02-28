import Card from '../ui/Card';

export default function DownloadLinks() {
  const links = [
    {
      name: 'iPhone (App Store)',
      url: 'https://apps.apple.com/ru/app/wireguard/id1441195209',
      icon: '📱',
    },
    {
      name: 'Android (Google Play)',
      url: 'https://play.google.com/store/apps/details?id=com.wireguard.android',
      icon: '🤖',
    },
    {
      name: 'MacBook (App Store)',
      url: 'https://apps.apple.com/us/app/wireguard/id1451685025?ls=1&mt=12',
      icon: '💻',
    },
    {
      name: 'Windows',
      url: 'https://www.wireguard.com/install/',
      icon: '🪟',
    },
  ];

  return (
    <Card className="mb-6">
      <h2 className="text-lg font-semibold mb-4">Скачать WireGuard</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Перед использованием конфига скачайте приложение WireGuard для вашей платформы:
      </p>
      <div className="space-y-2">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{link.icon}</span>
              <span className="font-medium">{link.name}</span>
            </div>
            <span className="text-blue-500">→</span>
          </a>
        ))}
      </div>
    </Card>
  );
}
