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
    onMutate: async ({ id, done }) => {
      await queryClient.cancelQueries({ queryKey: onboardingKeys.all });
      const previousLists = queryClient.getQueryData<OnboardingItem[]>(onboardingKeys.lists());

      queryClient.setQueriesData<OnboardingItem[]>({ queryKey: onboardingKeys.all }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((item) =>
          item.id === id ? { ...item, done, status: done ? 'Done' : 'Pending' } : item
        );
      });

      return { previousLists };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousLists) {
        queryClient.setQueryData(onboardingKeys.lists(), context.previousLists);
      }
    },
    onSettled: () => {
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
