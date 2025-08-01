import React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border bg-[hsl(var(--input-bg-hsl))] px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring-hsl))] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        'text-white border-violet-500 placeholder:text-violet-300',
        'disabled:bg-muted/50 disabled:border-muted-foreground/30',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };