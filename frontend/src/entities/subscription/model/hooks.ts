import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi } from '../api/subscriptionApi';
import { useToast } from '@/shared/lib';
import type { SubscriptionPlan } from './types';

export const SUBSCRIPTION_QUERY_KEY = ['subscription'] as const;
export const PLANS_QUERY_KEY = ['plans'] as const;

export function useSubscriptionQuery() {
  return useQuery({
    queryKey: SUBSCRIPTION_QUERY_KEY,
    queryFn: subscriptionApi.getSubscription,
  });
}

export function usePlansQuery() {
  return useQuery({
    queryKey: PLANS_QUERY_KEY,
    queryFn: subscriptionApi.getPlans,
  });
}

function openPaymentUrl(url: string) {
  // В Telegram Mini App нужно использовать WebApp.openLink
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.openLink) {
    tg.openLink(url);
  } else {
    window.open(url, '_blank');
  }
}

export function useCreatePaymentMutation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (plan: SubscriptionPlan) => subscriptionApi.createPayment(plan),
    onSuccess: (data) => {
      if (data.confirmationUrl) {
        openPaymentUrl(data.confirmationUrl);
      }
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEY });
    },
    onError: () => {
      showToast('Не удалось создать платёж', 'error');
    },
  });
}

export function useCreateExtraConfigPaymentMutation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: () => subscriptionApi.createExtraConfigPayment(),
    onSuccess: (data) => {
      if (data.confirmationUrl) {
        openPaymentUrl(data.confirmationUrl);
      }
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEY });
    },
    onError: () => {
      showToast('Не удалось создать платёж', 'error');
    },
  });
}

export function useCreateExtraAntigluschConfigPaymentMutation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: () => subscriptionApi.createExtraAntigluschConfigPayment(),
    onSuccess: (data) => {
      if (data.confirmationUrl) {
        openPaymentUrl(data.confirmationUrl);
      }
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEY });
    },
    onError: () => {
      showToast('Не удалось создать платёж', 'error');
    },
  });
}
