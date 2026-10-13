'use client';

import * as React from 'react';
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
import { Users, Briefcase, Bell, CheckCircle2 } from 'lucide-react';
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
        className="w-[340px] p-0"
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

        {/* List of notification items: inset 8px, 8px radius, 3 levels of text hierarchy */}
        <div className="max-h-[320px] overflow-y-auto p-2 space-y-1">
          {notifications.length === 0 ? (
            <div className="py-8 px-4 text-center">
              <CheckCircle2 className="text-text-subtle mx-auto mb-1.5 h-5 w-5 opacity-40 stroke-[1.75]" />
              <p className="text-text-muted text-[13px]">All caught up</p>
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
                className={`group flex cursor-pointer items-start gap-3 rounded-[8px] px-3 py-2 transition-colors select-none ${
                  n.read ? 'hover:bg-surface-2 opacity-70 hover:opacity-100' : 'hover:bg-surface-2'
                }`}
              >
                <div className="text-text-subtle group-hover:text-text mt-0.5 shrink-0 transition-colors">
                  {getNotificationIcon(n.title)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p
                      className={`text-[14px] leading-[20px] truncate ${
                        n.read ? 'text-text font-normal' : 'text-text font-medium'
                      }`}
                    >
                      {n.title}
                    </p>
                    <span className="text-text-subtle text-[12px] leading-[16px] shrink-0 font-normal">
                      {formatRelativeTime(n.timestamp)}
                    </span>
                  </div>
                  <p className="text-text-muted mt-0.5 text-[12px] leading-[16px] truncate">
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
