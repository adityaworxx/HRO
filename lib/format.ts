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

export function formatCtcRange(min: number, max: number): string {
  return `₹${min} - ₹${max} LPA`;
}

export function formatCtc(amount: number): string {
  return `₹${amount} LPA`;
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
