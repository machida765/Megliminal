import { InputHTMLAttributes, forwardRef } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={`flex h-11 sm:h-10 w-full rounded-[14px] border border-line bg-surface px-3 py-2 text-base sm:text-sm text-ink placeholder:text-quiet focus:outline-none focus:border-brand focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
);

Input.displayName = 'Input';
