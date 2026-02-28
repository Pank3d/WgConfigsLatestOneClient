import Card from '../ui/Card';

export default function Instructions() {
  return (
    <Card>
      <h2 className="text-lg font-semibold mb-4">Инструкция по настройке</h2>
      <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
        <div>
          <h3 className="font-semibold mb-2">1. Скачайте приложение</h3>
          <p>Установите WireGuard для вашей платформы из списка выше.</p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">2. Создайте конфиг</h3>
          <p>Нажмите кнопку "Создать конфиг" на вкладке "Конфиги".</p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">3. Импортируйте конфиг</h3>
          <p>Откройте приложение WireGuard и импортируйте скачанный файл конфигурации.</p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">4. Подключитесь</h3>
          <p>Активируйте туннель в приложении WireGuard.</p>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-2">Подробная инструкция</h3>
          <a
            href="https://lastseenvpn.gitbook.io/vpn-setup-guide/tutorial/ustanovka-i-nastroika-vpn/wireguard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 underline"
          >
            Читать полную инструкцию →
          </a>
        </div>
      </div>
    </Card>
  );
}
