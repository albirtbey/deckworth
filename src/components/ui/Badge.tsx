import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
}

export function Badge({ className, variant = 'primary', children, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'badge',
        {
          'badge-primary': variant === 'primary',
          'badge-secondary': variant === 'secondary',
          'badge-accent': variant === 'accent',
          'bg-success-100 text-success-700': variant === 'success',
          'bg-warning-100 text-warning-700': variant === 'warning',
          'bg-error-100 text-error-700': variant === 'error',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}