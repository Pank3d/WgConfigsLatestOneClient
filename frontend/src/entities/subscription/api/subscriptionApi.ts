import { api } from '@/shared/api';
import type { SubscriptionInfo, PlansResponse, CreatePaymentResponse, SubscriptionPlan } from '../model/types';

export const subscriptionApi = {
  getSubscription: async (): Promise<SubscriptionInfo> => {
    const response = await api.get<SubscriptionInfo>('/payments/subscription');
    return response.data;
  },

  getPlans: async (): Promise<PlansResponse> => {
    const response = await api.get<PlansResponse>('/payments/plans');
    return response.data;
  },

  createPayment: async (plan: SubscriptionPlan): Promise<CreatePaymentResponse> => {
    const response = await api.post<CreatePaymentResponse>('/payments/create', {
      plan,
      type: 'SUBSCRIPTION',
    });
    return response.data;
  },

  createExtraConfigPayment: async (): Promise<CreatePaymentResponse> => {
    const response = await api.post<CreatePaymentResponse>('/payments/create', {
      type: 'EXTRA_CONFIG',
    });
    return response.data;
  },
};
