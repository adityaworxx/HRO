'use client';

import * as React from 'react';
import { MessageNotificationIcon } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '@/features/notifications/hooks';
import { useUiStore } from '@/lib/store';
import { formatRelativeTime } from '@/lib/format';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { Users, Briefcase, Bell } from 'lucide-react';
import { toast } from 'sonner';

export function NotificationsPopover() {
  const { role } = useUiStore();
  const { data: notifications = [] } = useNotifications(role);
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllAsRead.mutate(role, {
      onSuccess: () => {
        toast.success('All marked as read');
      },
    });
  };

  const getNotificationIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('shortlist') || lower.includes('candidate')) {
      return (
        <div className="bg-surface-2 text-text-muted flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
          <Users className="h-3.5 w-3.5 stroke-[1.75]" />
        </div>
      );
    }
    if (lower.includes('opening') || lower.includes('requisition') || lower.includes('job')) {
      return (
        <div className="bg-surface-2 text-text-muted flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
          <Briefcase className="h-3.5 w-3.5 stroke-[1.75]" />
        </div>
      );
    }
    return (
      <div className="bg-surface-2 text-text-muted flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
        <Bell className="h-3.5 w-3.5 stroke-[1.75]" />
      </div>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-text-subtle hover:text-text hover:bg-surface-2 relative h-9 w-9 cursor-pointer"
          title="Notifications"
          aria-label="Notifications"
        >
          <MessageNotificationIcon className="h-4.5 w-4.5" />
          {unreadCount > 0 && (
            <span className="bg-accent ring-surface-1 absolute top-2 right-2 h-2 w-2 rounded-full ring-2" />
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="border-border bg-surface-1 w-[300px] p-0 shadow-xl rounded-[var(--radius-lg)] overflow-hidden"
      >
        {/* Header: Clean title and optional mark all read */}
        <div className="border-border flex items-center justify-between border-b px-3.5 py-2.5">
          <span className="text-text text-[13px] font-semibold tracking-tight">Notifications</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="text-text-muted hover:text-accent text-[11px] font-medium transition-colors cursor-pointer"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* List: Slim, compact divider rows without orange dots or bulky sections */}
        <div className="divide-border max-h-[300px] divide-y overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-6 px-3 text-center">
              <p className="text-text-muted text-[12px]">No new notifications</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.read) {
                    markAsRead.mutate(n.id);
                  }
                }}
                className="hover:bg-surface-2 flex cursor-pointer items-start gap-2.5 px-3.5 py-2.5 transition-colors"
              >
                {getNotificationIcon(n.title)}

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-1.5">
                    <p className="text-text text-[12px] font-semibold truncate leading-tight">
                      {n.title}
                    </p>
                    <span className="text-text-subtle text-[10px] shrink-0 font-normal">
                      {formatRelativeTime(n.timestamp)}
                    </span>
                  </div>
                  <p className="text-text-muted mt-0.5 text-[11px] leading-[15px] truncate">
                    {n.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
