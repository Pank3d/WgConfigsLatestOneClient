import { Card } from '@/shared/ui';
import { DOWNLOAD_LINKS } from '@/shared/config';

export function DownloadLinks() {
  return (
    <Card className="mb-6">
      <h2 className="text-lg font-semibold mb-4">Скачать WireGuard</h2>
      <p className="text-sm text-gray-600 mb-4">
        Перед использованием конфига скачайте приложение WireGuard для вашей платформы:
      </p>
      <div className="space-y-2">
        {DOWNLOAD_LINKS.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
