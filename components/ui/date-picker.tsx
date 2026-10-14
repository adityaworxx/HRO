'use client';

import * as React from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  isValid,
} from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface DatePickerProps {
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function parseYMD(str?: string): Date {
  if (!str) return new Date();
  const datePart = str.split('T')[0] ?? '';
  const parts = datePart.split('-');
  if (parts.length === 3) {
    const yStr = parts[0];
    const mStr = parts[1];
    const dStr = parts[2];
    if (yStr && mStr && dStr) {
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10) - 1;
      const d = parseInt(dStr, 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m, d);
      }
    }
  }
  const fallback = new Date(str);
  return isValid(fallback) ? fallback : new Date();
}

function formatToYMD(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  className,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const selectedDate = React.useMemo(() => parseYMD(value), [value]);
  const [viewMonth, setViewMonth] = React.useState<Date>(selectedDate);

  React.useEffect(() => {
    if (value) {
      const d = parseYMD(value);
      if (isValid(d)) {
        setViewMonth(d);
      }
    }
  }, [value]);

  const calendarDays = React.useMemo(() => {
    const monthStart = startOfMonth(viewMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [viewMonth]);

  const handleSelectDate = (day: Date) => {
    const ymd = formatToYMD(day);
    onChange?.(ymd);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'border-border bg-surface-2 hover:bg-surface-3 text-text focus:border-border-strong flex h-9 w-full items-center justify-between rounded-[var(--radius-sm)] border px-3 text-[13px] font-medium outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50 select-none',
            className
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <CalendarIcon className="text-text-muted h-3.5 w-3.5 shrink-0" />
            <span className="truncate tabular-nums">
              {value ? format(selectedDate, 'dd-MM-yyyy') : placeholder}
            </span>
          </span>
          <ChevronDown className="text-text-muted h-3.5 w-3.5 shrink-0 opacity-70" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[280px] p-3 border-border bg-surface-1 shadow-xl"
      >
        {/* Header: Month name & navigation arrows */}
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-[13px] font-semibold text-text select-none">
            {format(viewMonth, 'MMMM yyyy')}
          </span>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setViewMonth(subMonths(viewMonth, 1))}
              className="h-7 w-7 rounded-[6px] hover:bg-surface-2 text-text-muted hover:text-text flex items-center justify-center transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMonth(addMonths(viewMonth, 1))}
              className="h-7 w-7 rounded-[6px] hover:bg-surface-2 text-text-muted hover:text-text flex items-center justify-center transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-1 mb-1 text-center">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="text-[11px] font-medium text-text-subtle py-0.5 select-none">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const isSelected = value ? isSameDay(day, selectedDate) : false;
            const isCurrentMonth = isSameMonth(day, viewMonth);
            const isCurrentDay = isToday(day);

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => handleSelectDate(day)}
                className={cn(
                  'h-8 w-8 text-[12px] rounded-[6px] font-medium transition-colors flex items-center justify-center tabular-nums select-none',
                  !isCurrentMonth && 'text-text-subtle/30',
                  isCurrentMonth && !isSelected && 'text-text hover:bg-surface-2',
                  isSelected && 'bg-accent text-bg font-semibold shadow-xs',
                  isCurrentDay && !isSelected && 'border border-border-strong font-bold'
                )}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>

        {/* Quick shortcuts */}
        <div className="mt-2.5 pt-2 border-t border-border flex items-center justify-between text-[11px]">
          <button
            type="button"
            onClick={() => {
              onChange?.('');
              setOpen(false);
            }}
            className="text-text-muted hover:text-text font-medium px-2 py-0.5 rounded hover:bg-surface-2 transition-colors select-none"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => {
              const today = new Date();
              setViewMonth(today);
              handleSelectDate(today);
            }}
            className="text-accent hover:text-accent-hover font-semibold px-2 py-0.5 rounded hover:bg-surface-2 transition-colors select-none"
          >
            Today
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
