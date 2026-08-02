import { ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'default' | 'outline' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  default:
    'bg-gray-900 text-white hover:bg-gray-800 border border-transparent',
  outline:
    'bg-white text-gray-900 hover:bg-gray-50 border border-gray-300',
  ghost: 'bg-transparent text-gray-900 hover:bg-gray-100 border border-transparent',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
);

Button.displayName = 'Button';
