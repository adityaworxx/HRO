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
  setHours,
  setMinutes,
  parseISO,
  isValid,
  startOfDay,
  isBefore,
} from 'date-fns';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface DateTimePickerProps {
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
}

const COMMON_TIME_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
  '05:30 PM',
  '06:00 PM',
  '06:30 PM',
  '07:00 PM',
  '07:30 PM',
  '08:00 PM',
];

function parseSlotToTime(slot: string): { hours: number; minutes: number } {
  const parts = slot.split(' ');
  const timeStr = parts[0] ?? '09:00';
  const modifier = parts[1] ?? 'AM';
  const timeParts = timeStr.split(':');
  let hours = parseInt(timeParts[0] ?? '9', 10);
  const minutes = parseInt(timeParts[1] ?? '0', 10);

  if (modifier === 'PM' && hours < 12) {
    hours += 12;
  }
  if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
}

function formatToInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Select date & time',
  className,
  disabled = false,
  minDate,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  const effectiveMinDate = React.useMemo(() => {
    return minDate ?? startOfDay(new Date());
  }, [minDate]);

  const parsedDate = React.useMemo(() => {
    if (!value) return new Date();
    const d = new Date(value);
    if (!isValid(d)) return new Date();
    return isBefore(startOfDay(d), effectiveMinDate) ? new Date() : d;
  }, [value, effectiveMinDate]);

  const [selectedDate, setSelectedDate] = React.useState<Date>(parsedDate);
  const [viewMonth, setViewMonth] = React.useState<Date>(parsedDate);

  // Sync internal state when prop changes
  React.useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (isValid(d)) {
        const adjustedDate = isBefore(startOfDay(d), effectiveMinDate) ? new Date() : d;
        setSelectedDate(adjustedDate);
        setViewMonth(adjustedDate);
      }
    }
  }, [value, effectiveMinDate]);

  // Calendar days grid calculation
  const calendarDays = React.useMemo(() => {
    const monthStart = startOfMonth(viewMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [viewMonth]);

  const isPrevMonthDisabled = React.useMemo(() => {
    const prevMonthEnd = endOfMonth(subMonths(viewMonth, 1));
    return isBefore(prevMonthEnd, effectiveMinDate);
  }, [viewMonth, effectiveMinDate]);

  const handleSelectDate = (day: Date) => {
    const updated = new Date(selectedDate);
    updated.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    setSelectedDate(updated);
    onChange?.(formatToInputValue(updated));
  };

  const handleSelectSlot = (slot: string) => {
    const { hours, minutes } = parseSlotToTime(slot);
    const updated = setMinutes(setHours(new Date(selectedDate), hours), minutes);
    setSelectedDate(updated);
    onChange?.(formatToInputValue(updated));
    setOpen(false);
  };

  const currentFormattedTime = React.useMemo(() => {
    return format(selectedDate, 'hh:mm a');
  }, [selectedDate]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'border-border bg-surface-2 hover:bg-surface-3 text-text focus:border-border-strong flex h-9 w-full items-center justify-between rounded-[var(--radius-sm)] border px-3 text-[13px] font-medium outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50 select-none cursor-pointer',
            className
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <CalendarIcon className="text-text-muted h-3.5 w-3.5 shrink-0" />
            <span className="truncate tabular-nums">
              {value && isValid(new Date(value))
                ? format(new Date(value), 'EEE, dd MMM yyyy · hh:mm a')
                : placeholder}
            </span>
          </span>
          <ChevronDown className="text-text-muted h-3.5 w-3.5 shrink-0 opacity-70" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-auto p-0 border-border bg-surface-1 shadow-xl"
      >
        <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border">
          {/* Calendar Left Column */}
          <div className="p-3 w-[270px]">
            {/* Header: Month name & navigation arrows */}
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[13px] font-semibold text-text select-none">
                {format(viewMonth, 'MMMM yyyy')}
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  disabled={isPrevMonthDisabled}
                  onClick={() => setViewMonth(subMonths(viewMonth, 1))}
                  className={cn(
                    'h-7 w-7 rounded-[6px] flex items-center justify-center transition-colors',
                    isPrevMonthDisabled
                      ? 'text-text-subtle/25 cursor-not-allowed pointer-events-none'
                      : 'hover:bg-surface-2 text-text-muted hover:text-text cursor-pointer'
                  )}
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMonth(addMonths(viewMonth, 1))}
                  className="h-7 w-7 rounded-[6px] hover:bg-surface-2 text-text-muted hover:text-text flex items-center justify-center transition-colors cursor-pointer"
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
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, viewMonth);
                const isCurrentDay = isToday(day);
                const isPast = isBefore(startOfDay(day), effectiveMinDate);

                // Dates before minDate (e.g. today) or outside current month are not shown
                if (isPast || !isCurrentMonth) {
                  return (
                    <div
                      key={day.toISOString()}
                      className="h-8 w-8 pointer-events-none"
                      aria-hidden="true"
                    />
                  );
                }

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => handleSelectDate(day)}
                    className={cn(
                      'h-8 w-8 text-[12px] rounded-[6px] font-medium transition-colors flex items-center justify-center tabular-nums select-none cursor-pointer',
                      !isSelected && 'text-text hover:bg-surface-2',
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
                  const today = new Date();
                  setViewMonth(today);
                  handleSelectDate(today);
                }}
                className="text-text-muted hover:text-text font-medium px-2 py-0.5 rounded hover:bg-surface-2 transition-colors select-none"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setViewMonth(tomorrow);
                  handleSelectDate(tomorrow);
                }}
                className="text-text-muted hover:text-text font-medium px-2 py-0.5 rounded hover:bg-surface-2 transition-colors select-none"
              >
                Tomorrow
              </button>
            </div>
          </div>

          {/* Time Right Column */}
          <div className="p-3 w-[155px] flex flex-col">
            <div className="flex items-center gap-1.5 px-1 mb-2 text-text-subtle select-none">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-[12px] font-medium">Time Slot</span>
            </div>

            {/* Scrollable Slots */}
            <div className="max-h-[230px] overflow-y-auto space-y-0.5 pr-1">
              {COMMON_TIME_SLOTS.map((slot) => {
                const isSelected = currentFormattedTime === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => handleSelectSlot(slot)}
                    className={cn(
                      'w-full text-left px-2.5 py-1.5 rounded-[6px] text-[12px] font-medium tabular-nums transition-colors select-none',
                      isSelected
                        ? 'bg-accent text-bg font-semibold'
                        : 'text-text hover:bg-surface-2'
                    )}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
