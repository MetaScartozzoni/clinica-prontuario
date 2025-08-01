import { cn } from '@/lib/utils';
    import { Slot } from '@radix-ui/react-slot';
    import { cva } from 'class-variance-authority';
    import React from 'react';

    const buttonVariants = cva(
      'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      {
        variants: {
          variant: {
            default: 'bg-gradient-to-r from-[#A146D9] to-[#FF5D6C] text-white shadow-lg hover:opacity-90',
            destructive:
              'bg-red-600 text-destructive-foreground hover:bg-red-700/90 shadow-md hover:shadow-lg',
            outline:
              'border border-input bg-transparent hover:bg-accent/20 hover:text-accent-foreground text-violet-200',
            secondary:
              'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-md hover:shadow-lg',
            ghost: 'hover:bg-white/10 hover:text-white',
            link: 'text-primary underline-offset-4 hover:underline hover:text-primary/80',
          },
          size: {
            default: 'h-10 px-4 py-2',
            sm: 'h-9 rounded-md px-3',
            lg: 'h-11 rounded-md px-8',
            icon: 'h-10 w-10',
          },
        },
        defaultVariants: {
          variant: 'default',
          size: 'default',
        },
      },
    );

    const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
      const Comp = asChild ? Slot : 'button';
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        />
      );
    });
    Button.displayName = 'Button';

    export { Button, buttonVariants };