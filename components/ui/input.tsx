import { InputHTMLAttributes, forwardRef } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={`flex h-10 w-full rounded-[4px] border-2 border-[#e8c9a4] bg-[#fffdf8] px-3 py-2 text-sm placeholder:text-[#b89a7a] focus:outline-none focus:border-[#ef7d3b] focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
);

Input.displayName = 'Input';
