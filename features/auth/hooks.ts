import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services';
import type { UserRole } from '@/lib/navigation';

export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'currentUser'] as const,
  users: () => [...authKeys.all, 'users'] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: () => api.auth.getCurrentUser(),
  });
}

export function useUsers() {
  return useQuery({
    queryKey: authKeys.users(),
    queryFn: () => api.auth.listUsers(),
  });
}

export function useSwitchRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (role: UserRole) => api.auth.switchRole(role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
    },
  });
}

export function useResetDemoData() {
  return useMutation({
    mutationFn: () => api.auth.resetDemoData(),
  });
}
