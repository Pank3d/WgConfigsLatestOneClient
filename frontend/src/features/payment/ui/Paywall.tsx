import { Card } from '@/shared/ui';
import { useSubscriptionQuery } from '@/entities/subscription';

interface PaywallProps {
  children: React.ReactNode;
  onGoToPayment: () => void;
}

export function Paywall({ children, onGoToPayment }: PaywallProps) {
  const { data: subscription, isLoading } = useSubscriptionQuery();

  if (isLoading) return null;

  if (subscription?.active) {
    return <>{children}</>;
  }

  return (
    <Card>
      <div className="text-center py-8">
        <div className="text-5xl mb-4">🔒</div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900">Требуется подписка</h3>
        <p className="text-sm text-gray-600 mb-4">
          Для создания и использования VPN-конфигов необходимо оформить подписку
        </p>
        <button
          onClick={onGoToPayment}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-blue-600 transition-colors"
        >
          Перейти к оплате
        </button>
      </div>
    </Card>
  );
}
