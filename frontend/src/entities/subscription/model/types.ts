export type SubscriptionPlan = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface Plan {
  id: SubscriptionPlan;
  name: string;
  price: number;
  duration: number;
  configs: number;
}

export interface SubscriptionInfo {
  active: boolean;
  plan: SubscriptionPlan | null;
  endDate: string | null;
  maxConfigs: number;
  extraConfigs: number;
  maxAntigluschConfigs: number;
  extraAntigluschConfigs: number;
}

export interface PlansResponse {
  plans: Plan[];
  extraConfigPrice: number;
  extraAntigluschConfigPrice: number;
}

export interface CreatePaymentResponse {
  paymentId: string;
  confirmationUrl: string | null;
  amount: number;
  description: string;
}
