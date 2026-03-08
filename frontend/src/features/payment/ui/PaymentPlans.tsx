import { Button, Card } from '@/shared/ui';
import { useSubscriptionQuery, usePlansQuery, useCreatePaymentMutation } from '@/entities/subscription';
import type { SubscriptionPlan } from '@/entities/subscription';

const PLAN_BADGES: Record<string, string> = {
  QUARTERLY: 'Выгодно',
  YEARLY: 'Лучшая цена',
};

const PLAN_DESCRIPTIONS: Record<string, string> = {
  MONTHLY: '150₽ / месяц',
  QUARTERLY: '167₽ / месяц',
  YEARLY: '125₽ / месяц',
};

export function PaymentPlans() {
  const { data: subscription } = useSubscriptionQuery();
  const { data: plansData, isLoading } = usePlansQuery();
  const createPayment = useCreatePaymentMutation();

  if (isLoading) return null;

  const plans = plansData?.plans || [];
  const extraConfigPrice = plansData?.extraConfigPrice || 50;

  const handlePay = (planId: SubscriptionPlan) => {
    createPayment.mutate(planId);
  };

  return (
    <div className="space-y-3">
      {subscription?.active && (
        <Card className="bg-green-50 border-green-200">
          <div className="text-center">
            <p className="text-sm font-semibold text-green-800">Подписка активна</p>
            <p className="text-xs text-green-600 mt-1">
              Тариф: {plans.find(p => p.id === subscription.plan)?.name || subscription.plan}
            </p>
            <p className="text-xs text-green-600">
              До: {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString('ru-RU') : '—'}
            </p>
          </div>
        </Card>
      )}

      <h3 className="text-base font-semibold text-gray-900">
        {subscription?.active ? 'Продлить подписку' : 'Выберите тариф'}
      </h3>

      {plans.map((plan) => {
        const badge = PLAN_BADGES[plan.id];
        const perMonth = PLAN_DESCRIPTIONS[plan.id];

        return (
          <Card key={plan.id} className={`relative ${plan.id === 'YEARLY' ? 'border-blue-400 border-2' : ''}`}>
            {badge && (
              <span className="absolute -top-2 right-3 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                {badge}
              </span>
            )}
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-gray-900">{plan.name}</h4>
                <p className="text-lg font-bold text-gray-900">{plan.price}₽</p>
                <p className="text-xs text-gray-500">{perMonth} • {plan.configs} конфига</p>
              </div>
              <Button
                onClick={() => handlePay(plan.id)}
                disabled={createPayment.isPending}
                isLoading={createPayment.isPending}
                className="shrink-0"
              >
                Оплатить
              </Button>
            </div>
          </Card>
        );
      })}

      <Card>
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-gray-900">Доп. конфиг</h4>
            <p className="text-lg font-bold text-gray-900">{extraConfigPrice}₽/мес</p>
            <p className="text-xs text-gray-500">+1 конфиг к подписке</p>
          </div>
          <Button
            onClick={() => createPayment.mutate('MONTHLY' as SubscriptionPlan)}
            disabled={!subscription?.active || createPayment.isPending}
            className="shrink-0"
          >
            Добавить
          </Button>
        </div>
      </Card>
    </div>
  );
}
