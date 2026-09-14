'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { cn } from '@/lib/utils';
import {
  formatIsoAsSlash,
  getCalendarCells,
  getYearOptions,
  parseIsoDate,
  parseSlashDate,
  toIsoDate,
} from '@/lib/date';

type DatePickerProps = {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  'aria-label'?: string;
};

export function DatePicker({
  value,
  onChange,
  placeholder,
  'aria-label': ariaLabel,
}: DatePickerProps) {
  const { t, messages } = useTranslations();
  const placeholderText = placeholder ?? t('date.placeholder');
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const today = new Date();
  const initial = parseIsoDate(value ?? '') ?? {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
  };

  const [open, setOpen] = useState(false);
  const [text, setText] = useState(value ? formatIsoAsSlash(value) : '');
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);

  const [syncedValue, setSyncedValue] = useState(value ?? '');

  // 外から value が変わったときだけ表示テキストと表示月を合わせる
  if ((value ?? '') !== syncedValue) {
    setSyncedValue(value ?? '');
    setText(value ? formatIsoAsSlash(value) : '');
    const parts = value ? parseIsoDate(value) : null;
    if (parts) {
      setViewYear(parts.year);
      setViewMonth(parts.month);
    }
  }

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  const yearOptions = getYearOptions(viewYear);
  const cells = getCalendarCells(viewYear, viewMonth);
  const selected = value ? parseIsoDate(value) : null;

  const openPicker = () => {
    if (value) {
      const parts = parseIsoDate(value);
      if (parts) {
        setViewYear(parts.year);
        setViewMonth(parts.month);
      }
    }
    setOpen(true);
  };

  const selectDay = (day: number) => {
    const iso = toIsoDate(viewYear, viewMonth, day);
    onChange(iso);
    setText(formatIsoAsSlash(iso));
    setOpen(false);
  };

  const shiftMonth = (delta: number) => {
    const date = new Date(viewYear, viewMonth - 1 + delta, 1);
    setViewYear(date.getFullYear());
    setViewMonth(date.getMonth() + 1);
  };

  const commitText = () => {
    if (!text.trim()) {
      onChange(null);
      return;
    }
    const parsed = parseSlashDate(text);
    if (parsed) {
      onChange(parsed);
      setText(formatIsoAsSlash(parsed));
    } else if (value) {
      setText(formatIsoAsSlash(value));
    } else {
      setText('');
    }
  };

  return (
    <div ref={rootRef} className="relative flex-1 min-w-0">
      <Input
        type="text"
        inputMode="numeric"
        value={text}
        placeholder={placeholderText}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={listboxId}
        onFocus={openPicker}
        onClick={openPicker}
        onChange={(e) => setText(e.target.value)}
        onBlur={commitText}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commitText();
            setOpen(false);
          }
          if (e.key === 'Escape') setOpen(false);
        }}
        className="bg-white tabular-nums"
      />

      {open && (
        <div
          id={listboxId}
          role="dialog"
          aria-label={t('date.pickDate')}
          className="absolute left-0 top-full z-50 mt-1 w-[min(100vw-2rem,20rem)] border border-line bg-surface shadow-[0_8px_24px_rgba(41,41,31,0.12)]"
        >
          <div className="flex items-center gap-1 bg-brand px-2 py-2 text-brand-ink">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="inline-flex h-8 w-8 items-center justify-center hover:bg-white/15"
              aria-label={t('date.prevMonth')}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <select
              value={viewYear}
              onChange={(e) => setViewYear(Number(e.target.value))}
              className="h-8 min-w-0 flex-1 bg-surface px-2 text-sm font-bold text-ink border-0"
              aria-label={t('date.year')}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {t('date.yearOption', { year })}
                </option>
              ))}
            </select>

            <select
              value={viewMonth}
              onChange={(e) => setViewMonth(Number(e.target.value))}
              className="h-8 min-w-0 flex-1 bg-surface px-2 text-sm font-bold text-ink border-0"
              aria-label={t('date.month')}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {t('date.monthOption', { month })}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="inline-flex h-8 w-8 items-center justify-center hover:bg-white/15"
              aria-label={t('date.nextMonth')}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 border-b border-line bg-[#fffaf2]">
            {messages.date.weekdays.map((label, index) => (
              <div
                key={label}
                className={cn(
                  'py-2 text-center text-xs font-bold',
                  index === 0 ? 'text-brand' : index === 6 ? 'text-pop' : 'text-quiet'
                )}
              >
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-line p-px">
            {cells.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="h-9 bg-white" />;
              }

              const isSelected =
                selected?.year === viewYear &&
                selected?.month === viewMonth &&
                selected?.day === day;
              const isToday =
                today.getFullYear() === viewYear &&
                today.getMonth() + 1 === viewMonth &&
                today.getDate() === day;

              return (
                <button
                  key={`${viewYear}-${viewMonth}-${day}`}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectDay(day)}
                  className={cn(
                    'h-9 bg-surface text-sm font-bold transition-colors',
                    isSelected
                      ? 'bg-soft text-brand ring-2 ring-inset ring-brand'
                      : 'text-ink hover:bg-soft/50',
                    isToday && !isSelected && 'underline decoration-brand'
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end border-t border-line px-3 py-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm font-bold text-brand hover:text-brand"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
