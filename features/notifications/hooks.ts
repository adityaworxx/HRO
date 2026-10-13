import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services';
import type { UserRole } from '@/lib/navigation';

export const notificationsKeys = {
  all: ['notifications'] as const,
  list: (role: UserRole) => [...notificationsKeys.all, role] as const,
};

export function useNotifications(role: UserRole) {
  return useQuery({
    queryKey: notificationsKeys.list(role),
    queryFn: () => api.notifications.list(role),
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.notifications.markAsRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
    },
  });
}
