'use client';

import * as React from 'react';
import { MessageNotificationIcon } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { useNotifications, useMarkNotificationAsRead } from '@/features/notifications/hooks';
import { useUiStore } from '@/lib/store';
import { formatRelativeTime } from '@/lib/format';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';

export function NotificationsPopover() {
  const { role } = useUiStore();
  const { data: notifications = [] } = useNotifications(role);
  const markAsRead = useMarkNotificationAsRead();

  const unreadCount = notifications.filter((n) => !n.read).length;

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
      <DropdownMenuContent align="end" className="border-border bg-surface-1 w-80 p-0 shadow-xl">
        <div className="border-border flex items-center justify-between border-b p-3">
          <span className="text-text text-[13px] font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-accent-subtle text-accent rounded px-1.5 py-0.5 text-[11px] font-medium">
              {unreadCount} unread
            </span>
          )}
        </div>

        <div className="divide-border max-h-[320px] divide-y overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-text-muted py-6 text-center text-[12px]">
              No new notifications.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markAsRead.mutate(n.id)}
                className="hover:bg-surface-2 flex cursor-pointer flex-col gap-1 p-3 transition-colors"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-text text-[12px] font-semibold">{n.title}</span>
                  <span className="text-text-subtle text-[11px]">
                    {formatRelativeTime(n.timestamp)}
                  </span>
                </div>
                <p className="text-text-muted text-[12px] leading-relaxed">{n.message}</p>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
