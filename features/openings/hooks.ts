import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services';
import type { Opening } from '@/types/entities';
import type { OpeningStatus } from '@/lib/domain/status-transitions';

export const openingsKeys = {
  all: ['openings'] as const,
  lists: () => [...openingsKeys.all, 'list'] as const,
  list: (filter?: { status?: OpeningStatus; department?: string; search?: string }) =>
    [...openingsKeys.lists(), filter] as const,
  details: () => [...openingsKeys.all, 'detail'] as const,
  detail: (id: string) => [...openingsKeys.details(), id] as const,
};

export function useOpenings(filter?: {
  status?: OpeningStatus;
  department?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: openingsKeys.list(filter),
    queryFn: () => api.openings.list(filter),
  });
}

export function useOpening(id: string) {
  return useQuery({
    queryKey: openingsKeys.detail(id),
    queryFn: () => api.openings.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateOpening() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Opening, 'id' | 'createdAt'>) => api.openings.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: openingsKeys.lists() });
    },
  });
}

export function useUpdateOpeningStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OpeningStatus }) =>
      api.openings.updateStatus(id, status),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: openingsKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: openingsKeys.detail(variables.id) });
    },
  });
}
