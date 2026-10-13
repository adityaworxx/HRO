'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '@/features/notifications/hooks';
import { useUiStore } from '@/lib/store';
import { formatCompactTime } from '@/lib/format';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { Users, Briefcase, Bell, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NotificationsPopover() {
  const { role } = useUiStore();
  const { data: notifications = [] } = useNotifications(role);
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllAsRead.mutate(role);
  };

  const getNotificationIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('shortlist') || lower.includes('candidate')) {
      return <Users className="h-4 w-4 shrink-0 stroke-[1.75]" />;
    }
    if (lower.includes('opening') || lower.includes('requisition') || lower.includes('job')) {
      return <Briefcase className="h-4 w-4 shrink-0 stroke-[1.75]" />;
    }
    return <Bell className="h-4 w-4 shrink-0 stroke-[1.75]" />;
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
          <Bell className="h-4 w-4 stroke-[1.75]" />
          {unreadCount > 0 && (
            <span className="bg-accent ring-surface-1 absolute top-2 right-2 h-1.5 w-1.5 rounded-full ring-2" />
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[320px] p-0"
      >
        {/* Header with full-width divider */}
        <div className="border-border flex h-10 items-center justify-between border-b px-3.5">
          <span className="text-text-subtle text-[12px] leading-[16px] font-medium select-none">
            Notifications
          </span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="text-text-subtle hover:text-text text-[12px] leading-[16px] font-medium transition-colors cursor-pointer"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Clean, single-line notification items matching Row Anatomy */}
        <div className="max-h-[300px] overflow-y-auto p-1.5 space-y-0.5">
          {notifications.length === 0 ? (
            <div className="py-8 px-4 text-center">
              <CheckCircle2 className="text-text-subtle mx-auto mb-1.5 h-5 w-5 opacity-40 stroke-[1.75]" />
              <p className="text-text-muted text-[13px]">All caught up</p>
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                title={n.message}
                onClick={() => {
                  if (!n.read) {
                    markAsRead.mutate(n.id);
                  }
                }}
                className={cn(
                  'group flex h-9 w-full cursor-pointer items-center gap-3 rounded-[8px] px-3 text-left transition-colors select-none outline-none hover:bg-surface-2',
                  n.read && 'opacity-60 hover:opacity-100'
                )}
              >
                <span className="text-text-subtle group-hover:text-text shrink-0 transition-colors">
                  {getNotificationIcon(n.title)}
                </span>
                <span
                  className={cn(
                    'min-w-0 flex-1 truncate text-[14px] leading-[20px] text-text',
                    n.read ? 'font-normal' : 'font-medium'
                  )}
                >
                  {n.title}
                </span>
                <span className="text-text-subtle shrink-0 text-[12px] leading-[16px] font-normal">
                  {formatCompactTime(n.timestamp)}
                </span>
              </button>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
