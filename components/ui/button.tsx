import { ButtonHTMLAttributes, cloneElement, forwardRef, isValidElement, ReactElement } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[6px] text-sm font-bold transition-transform duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 -rotate-[0.4deg] hover:rotate-1',
  {
    variants: {
      variant: {
        default:
          'bg-[#ef7d3b] text-white shadow-[3px_4px_0_rgba(90,50,20,0.18)] hover:bg-[#e06d2c] focus-visible:ring-orange-300',
        outline:
          'border-2 border-[#e8c9a4] bg-[#fffdf8] text-[#3b2a22] hover:bg-[#fff1e4] focus-visible:ring-orange-200',
        ghost:
          'bg-transparent text-[#6a4634] hover:bg-[#fff7d6] hover:text-[#c45c28] focus-visible:ring-orange-200 rotate-0 hover:rotate-0',
        soft:
          'bg-[#fff7d6] text-[#c45c28] hover:bg-[#ffe8d2] focus-visible:ring-orange-200',
        flat:
          'rotate-0 hover:rotate-0 bg-[#ef7d3b] text-white hover:bg-[#e06d2c] focus-visible:ring-orange-300 shadow-none',
        'flat-outline':
          'rotate-0 hover:rotate-0 border border-[#e4d2b8] bg-[#fffdf9] text-[#3b2a22] hover:bg-[#fff6ea] focus-visible:ring-orange-200 shadow-none',
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
