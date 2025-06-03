import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
    variant?: 'default' | 'card' | 'overlay' | 'inline';
    text?: string;
    className?: string;
}

export function LoadingState({ variant = 'default', text, className }: LoadingStateProps) {
    switch (variant) {
        case 'card':
            return (
                <div className={cn(
                    "flex flex-col items-center justify-center p-6 bg-card rounded-lg border shadow-sm space-y-2",
                    className
                )}>
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    {text && <p className="text-sm text-muted-foreground">{text}</p>}
                </div>
            );

        case 'overlay':
            return (
                <div className={cn(
                    "fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50",
                    className
                )}>
                    <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        {text && <p className="text-lg font-medium">{text}</p>}
                    </div>
                </div>
            );

        case 'inline':
            return (
                <div className={cn("flex items-center space-x-2", className)}>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {text && <span className="text-sm">{text}</span>}
                </div>
            );

        default:
            return (
                <div className={cn(
                    "flex flex-col items-center justify-center min-h-[200px] space-y-4",
                    className
                )}>
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    {text && <p className="text-muted-foreground">{text}</p>}
                </div>
            );
    }
} 