import { format, formatDistanceToNow, parseISO, isValid, differenceInDays } from 'date-fns';

export function formatDate(dateString: string | null | undefined, pattern = 'dd MMM yyyy'): string {
  if (!dateString) return '-';
  try {
    const parsed = parseISO(dateString);
    if (!isValid(parsed)) return '-';
    return format(parsed, pattern);
  } catch {
    return '-';
  }
}

export function formatInterviewDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const parsed = parseISO(dateString);
    if (!isValid(parsed)) return '-';
    return format(parsed, 'EEE, d MMM, hh:mm a');
  } catch {
    return '-';
  }
}

export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const parsed = parseISO(dateString);
    if (!isValid(parsed)) return '-';
    if (typeof window === 'undefined') {
      return format(parsed, 'dd MMM yyyy');
    }
    return formatDistanceToNow(parsed, { addSuffix: true });
  } catch {
    return '-';
  }
}

export function formatCompactTime(dateString: string | null | undefined): string {
  if (!dateString) return '';
  try {
    const parsed = parseISO(dateString);
    if (!isValid(parsed)) return '';
    const diffSec = Math.max(0, Math.floor((Date.now() - parsed.getTime()) / 1000));
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return '';
  }
}

export function formatCtcRange(min: number, max: number): string {
  return `₹${min} - ₹${max} LPA`;
}

export function formatCtc(amount: number): string {
  return `₹${amount} LPA`;
}

export function formatRoleTitle(title?: string | null): string {
  if (!title) return 'Requisition';
  return title.replace(/\s*-\s*Squad\s*\d+/gi, '').trim();
}

export function formatDaysOpen(createdAt: string): number {
  try {
    const created = parseISO(createdAt);
    if (!isValid(created)) return 0;
    return Math.max(0, differenceInDays(new Date(), created));
  } catch {
    return 0;
  }
}
