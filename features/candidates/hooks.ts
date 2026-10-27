import { notificationsKeys } from '@/features/notifications/hooks';
import { openingsKeys } from '@/features/openings/hooks';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services';
import type { Candidate } from '@/types/entities';
import type { CandidateStage } from '@/lib/domain/status-transitions';

export const candidatesKeys = {
  all: ['candidates'] as const,
  lists: () => [...candidatesKeys.all, 'list'] as const,
  list: (filter?: {
    openingId?: string;
    stage?: CandidateStage;
    source?: string;
    search?: string;
  }) => [...candidatesKeys.lists(), filter] as const,
  details: () => [...candidatesKeys.all, 'detail'] as const,
  detail: (id: string) => [...candidatesKeys.details(), id] as const,
};

export function useCandidates(filter?: {
  openingId?: string;
  stage?: CandidateStage;
  source?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: candidatesKeys.list(filter),
    queryFn: () => api.candidates.list(filter),
  });
}

export function useCandidate(id: string) {
  return useQuery({
    queryKey: candidatesKeys.detail(id),
    queryFn: () => api.candidates.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Candidate, 'id'>) => api.candidates.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: candidatesKeys.lists() });
    },
  });
}

export function useShareWithManager() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ candidateIds, note }: { candidateIds: string[]; note?: string }) =>
      api.candidates.shareWithManager(candidateIds, note),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: candidatesKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
    },
  });
}

export function useRecordManagerDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      decision,
      comment,
    }: {
      id: string;
      decision: 'Shortlisted' | 'Rejected';
      comment?: string;
    }) => api.candidates.recordDecision(id, decision, comment),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: candidatesKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: candidatesKeys.detail(variables.id) });
      void queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
    },
  });
}

export function useScheduleInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      date,
      mode,
    }: {
      id: string;
      date: string;
      mode: 'Video' | 'Phone' | 'Onsite';
    }) => api.candidates.scheduleInterview(id, date, mode),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: candidatesKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: candidatesKeys.detail(variables.id) });
    },
  });
}

export function useRecordInterviewOutcome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      outcome,
      note,
    }: {
      id: string;
      outcome: 'Selected' | 'Rejected' | 'On Hold';
      note?: string;
    }) => api.candidates.recordInterviewOutcome(id, outcome, note),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: candidatesKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: candidatesKeys.detail(variables.id) });
    },
  });
}

export function useUpdateCandidateStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: CandidateStage }) =>
      api.candidates.updateStage(id, stage),
    onMutate: async ({ id, stage }) => {
      // Cancel outgoing refetches so they don't overwrite optimistic data
      await queryClient.cancelQueries({ queryKey: candidatesKeys.lists() });

      // Snapshot previous candidate lists
      const previousCandidates = queryClient.getQueryData<Candidate[]>(candidatesKeys.list());

      // Optimistically update all candidate lists in cache
      queryClient.setQueriesData<Candidate[]>({ queryKey: candidatesKeys.lists() }, (old) => {
        if (!old) return [];
        return old.map((c) => (c.id === id ? { ...c, stage } : c));
      });

      return { previousCandidates };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousCandidates) {
        queryClient.setQueriesData({ queryKey: candidatesKeys.lists() }, context.previousCandidates);
      }
    },
    onSettled: (_, __, variables) => {
      void queryClient.invalidateQueries({ queryKey: candidatesKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: candidatesKeys.detail(variables.id) });
      void queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
    },
  });
}

export function useAssignCandidateToOpening() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      candidateId,
      openingId,
      stage,
      notes,
    }: {
      candidateId: string;
      openingId: string;
      stage?: CandidateStage;
      notes?: string;
    }) => api.candidates.assignToOpening(candidateId, openingId, stage, notes),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: candidatesKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: candidatesKeys.detail(variables.candidateId) });
      void queryClient.invalidateQueries({ queryKey: openingsKeys.all });
      void queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
    },
  });
}
