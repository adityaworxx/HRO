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
import {
  Users,
  Briefcase,
  Calendar,
  Bell,
  CheckCheck,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export function NotificationsPopover() {
  const { role } = useUiStore();
  const { data: notifications = [] } = useNotifications(role);
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = React.useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((n) => !n.read);
    }
    return notifications;
  }, [notifications, filter]);

  const handleMarkAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllAsRead.mutate(role, {
      onSuccess: () => {
        toast.success('All notifications marked as read');
      },
    });
  };

  const getNotificationIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('shortlist') || lower.includes('candidate')) {
      return (
        <div className="bg-accent-subtle text-accent flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
          <Users className="h-4 w-4 stroke-[1.75]" />
        </div>
      );
    }
    if (lower.includes('opening') || lower.includes('requisition') || lower.includes('job')) {
      return (
        <div className="bg-surface-2 text-text-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
          <Briefcase className="h-4 w-4 stroke-[1.75]" />
        </div>
      );
    }
    if (lower.includes('interview') || lower.includes('schedule')) {
      return (
        <div className="bg-surface-2 text-text-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
          <Calendar className="h-4 w-4 stroke-[1.75]" />
        </div>
      );
    }
    return (
      <div className="bg-surface-2 text-text-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
        <Bell className="h-4 w-4 stroke-[1.75]" />
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
        className="border-border bg-surface-1 w-[380px] p-0 shadow-2xl rounded-[var(--radius-lg)] overflow-hidden"
      >
        {/* Header Block */}
        <div className="border-border flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-text text-[14px] font-semibold tracking-tight">Notifications</span>
            {unreadCount > 0 ? (
              <span className="bg-accent-subtle text-accent rounded-full px-2 py-0.5 text-[11px] font-semibold">
                {unreadCount} unread
              </span>
            ) : (
              <span className="bg-surface-2 text-text-subtle rounded-full px-2 py-0.5 text-[11px] font-medium">
                Caught up
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="text-text-muted hover:text-accent flex cursor-pointer items-center gap-1 text-[12px] font-medium transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5 stroke-[1.75]" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="border-border border-b px-3 py-2 bg-surface-1">
          <div className="bg-surface-2/60 flex rounded-[var(--radius-sm)] p-0.5 text-[12px]">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`flex-1 rounded-[calc(var(--radius-sm)-2px)] py-1 font-medium transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-surface-1 text-text shadow-2xs font-semibold'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`flex-1 rounded-[calc(var(--radius-sm)-2px)] py-1 font-medium transition-colors cursor-pointer ${
                filter === 'unread'
                  ? 'bg-surface-1 text-text shadow-2xs font-semibold'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-border max-h-[340px] divide-y overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="bg-surface-2 text-text-muted mb-2.5 flex h-10 w-10 items-center justify-center rounded-full">
                <CheckCircle2 className="text-success h-5 w-5 stroke-[1.75]" />
              </div>
              <p className="text-text text-[13px] font-semibold">All caught up</p>
              <p className="text-text-muted mt-0.5 text-[12px]">
                {filter === 'unread'
                  ? 'No unread notifications left.'
                  : 'You have no notifications right now.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.read) {
                    markAsRead.mutate(n.id);
                  }
                }}
                className={`hover:bg-surface-2 flex cursor-pointer items-start gap-3 p-3.5 transition-colors ${
                  !n.read ? 'bg-surface-1' : 'opacity-85'
                }`}
              >
                {getNotificationIcon(n.title)}

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={`text-[13px] leading-tight truncate ${!n.read ? 'font-semibold text-text' : 'font-medium text-text'}`}>
                      {n.title}
                    </p>
                    <span className="text-text-subtle text-[11px] shrink-0 font-normal">
                      {formatRelativeTime(n.timestamp)}
                    </span>
                  </div>
                  <p className="text-text-muted mt-1 text-[12px] leading-[18px]">
                    {n.message}
                  </p>
                </div>

                {!n.read && (
                  <span className="bg-accent ring-accent/20 mt-1.5 h-2 w-2 shrink-0 rounded-full ring-2" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Pinned Footer */}
        <div className="border-border bg-surface-2/30 flex items-center justify-between border-t px-3.5 py-2 text-[11px] text-text-subtle">
          <span>Real-time hiring updates</span>
          <span>Click any item to mark read</span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
