import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services';
import type { OnboardingItem } from '@/types/entities';

export const onboardingKeys = {
  all: ['onboarding'] as const,
  lists: () => [...onboardingKeys.all, 'list'] as const,
  byCandidate: (candidateId: string) => [...onboardingKeys.all, 'candidate', candidateId] as const,
};

export function useAllOnboarding() {
  return useQuery({
    queryKey: onboardingKeys.lists(),
    queryFn: () => api.onboarding.listAll(),
  });
}

export function useCandidateOnboarding(candidateId: string) {
  return useQuery({
    queryKey: onboardingKeys.byCandidate(candidateId),
    queryFn: () => api.onboarding.listByCandidate(candidateId),
    enabled: Boolean(candidateId),
  });
}

export function useToggleOnboardingTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, done }: { id: string; done: boolean }) =>
      api.onboarding.toggleTask(id, done),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: onboardingKeys.all });
    },
  });
}

export function useCreateOnboardingTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<OnboardingItem, 'id'>) => api.onboarding.createTask(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: onboardingKeys.all });
    },
  });
}
