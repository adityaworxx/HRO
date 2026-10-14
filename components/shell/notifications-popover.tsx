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
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Kbd } from '@/components/ui/kbd';
import { Users, Briefcase, Bell, CheckCircle2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NotificationsPopover() {
  const [open, setOpen] = React.useState(false);
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all');
  const { role } = useUiStore();
  const { data: notifications = [] } = useNotifications(role);
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = React.useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((n) => !n.read);
    }
    return notifications;
  }, [notifications, filter]);

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
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
      </DialogTrigger>

      <DialogContent className="max-w-xl p-0 overflow-hidden border-border bg-surface-1 shadow-2xl rounded-[12px] gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Notifications</DialogTitle>
          <DialogDescription>Role-targeted activity and notifications</DialogDescription>
        </DialogHeader>

        {/* Modal Header */}
        <div className="border-border flex h-14 items-center justify-between border-b px-5 pr-12">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-surface-2 text-text">
              <Bell className="h-4 w-4 stroke-[1.75]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text text-[15px] font-semibold select-none">Notifications</span>
              {unreadCount > 0 ? (
                <span className="border-border bg-surface-2 text-text rounded-[var(--radius-sm)] border px-1.5 py-0.5 text-[11px] font-medium tabular-nums select-none">
                  {unreadCount} unread
                </span>
              ) : null}
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="text-text-muted hover:text-text flex items-center gap-1.5 text-[12px] font-medium transition-colors cursor-pointer select-none"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Sub-header Filter Tabs */}
        <div className="border-border bg-surface-2/40 flex items-center justify-between border-b px-5 py-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={cn(
                'px-2.5 py-1 text-[12px] font-medium rounded-[var(--radius-sm)] transition-colors select-none cursor-pointer',
                filter === 'all'
                  ? 'bg-surface-1 text-text shadow-xs border border-border'
                  : 'text-text-muted hover:text-text'
              )}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={cn(
                'px-2.5 py-1 text-[12px] font-medium rounded-[var(--radius-sm)] transition-colors select-none cursor-pointer',
                filter === 'unread'
                  ? 'bg-surface-1 text-text shadow-xs border border-border'
                  : 'text-text-muted hover:text-text'
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>
          <span className="text-text-subtle text-[11px] select-none">Click to mark as read</span>
        </div>

        {/* Notifications List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/60 p-2 space-y-1">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 px-4 text-center select-none">
              <CheckCircle2 className="text-text-subtle mx-auto mb-2 h-7 w-7 opacity-50 stroke-[1.5]" />
              <p className="text-text text-[14px] font-medium">All caught up</p>
              <p className="text-text-muted text-[12px] mt-0.5">
                {filter === 'unread'
                  ? 'No unread notifications right now.'
                  : 'No activity notifications for your current role.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (!n.read) markAsRead.mutate(n.id);
                }}
                className={cn(
                  'group flex items-start gap-3.5 p-3 rounded-[8px] text-left transition-colors cursor-pointer select-none',
                  n.read
                    ? 'opacity-70 hover:opacity-100 hover:bg-surface-2/60'
                    : 'bg-surface-2/40 hover:bg-surface-2'
                )}
              >
                <div
                  className={cn(
                    'h-8 w-8 shrink-0 rounded-[8px] flex items-center justify-center transition-colors',
                    n.read ? 'bg-surface-2 text-text-subtle' : 'bg-surface-3 text-text'
                  )}
                >
                  {getNotificationIcon(n.title)}
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        'text-[13px] leading-[18px] truncate',
                        n.read ? 'text-text font-normal' : 'text-text font-semibold'
                      )}
                    >
                      {n.title}
                    </span>
                    <span className="text-text-subtle shrink-0 text-[11px] tabular-nums font-mono">
                      {formatCompactTime(n.timestamp)}
                    </span>
                  </div>
                  <p className="text-text-muted text-[12px] leading-[18px] line-clamp-2">
                    {n.message}
                  </p>
                </div>

                {!n.read && (
                  <span
                    className="bg-accent h-1.5 w-1.5 shrink-0 rounded-full mt-2"
                    title="Unread"
                  />
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-border bg-surface-2/40 flex h-10 items-center justify-between border-t px-4 text-[11px] text-text-subtle select-none">
          <span>Active Role: {role === 'manager' ? 'Hiring Manager' : 'HR Specialist'}</span>
          <div className="flex items-center gap-1.5">
            <Kbd>Esc</Kbd>
            <span>to close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
