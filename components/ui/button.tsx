import { ButtonHTMLAttributes, cloneElement, forwardRef, isValidElement, ReactElement } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[14px] text-sm font-semibold transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand',
  {
    variants: {
      variant: {
        default:
          'bg-brand text-brand-ink hover:bg-brand/90 focus-visible:ring-brand',
        outline:
          'border border-line bg-surface text-ink hover:bg-soft/60 focus-visible:ring-brand',
        ghost:
          'bg-transparent text-quiet hover:bg-soft/50 hover:text-brand focus-visible:ring-brand',
        soft:
          'bg-soft text-brand hover:bg-soft/80 focus-visible:ring-brand',
        flat:
          'bg-brand text-brand-ink hover:bg-brand/90 focus-visible:ring-brand shadow-none',
        'flat-outline':
          'border border-line bg-surface text-ink hover:bg-soft/50 focus-visible:ring-brand shadow-none',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-7 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** trueの場合、button要素ではなく子要素（例: Link）にスタイルを適用する */
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size }), className);

    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<{ className?: string }>;
      return cloneElement(child, {
        className: cn(classes, child.props.className),
      });
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
