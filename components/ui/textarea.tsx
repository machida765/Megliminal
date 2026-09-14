import { TextareaHTMLAttributes, forwardRef } from 'react';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = '', ...props }, ref) => (
  <textarea
    ref={ref}
    className={`flex min-h-[80px] w-full rounded-[14px] border border-line bg-surface px-3 py-2 text-base sm:text-sm text-ink placeholder:text-quiet focus:outline-none focus:border-brand focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
));

Textarea.displayName = 'Textarea';
