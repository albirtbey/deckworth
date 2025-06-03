import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, AlertCircle, Inbox } from 'lucide-react';

interface FeedbackProps {
    type: 'success' | 'error' | 'warning' | 'empty';
    title: string;
    message?: string;
    className?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
}

const iconMap = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    empty: Inbox,
};

const variantStyles = {
    success: 'bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-300',
    error: 'bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-300',
    warning: 'bg-yellow-50 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-300',
    empty: 'bg-muted/20 text-muted-foreground',
};

const iconStyles = {
    success: 'text-green-500 dark:text-green-400',
    error: 'text-red-500 dark:text-red-400',
    warning: 'text-yellow-500 dark:text-yellow-400',
    empty: 'text-muted-foreground',
};

export function Feedback({ 
    type, 
    title, 
    message, 
    className,
    icon,
    action
}: FeedbackProps) {
    const Icon = icon ? () => <>{icon}</> : iconMap[type];

    return (
        <div className={cn(
            'rounded-lg p-4 flex flex-col items-center justify-center text-center space-y-3',
            variantStyles[type],
            className
        )}>
            <Icon className={cn('w-12 h-12', iconStyles[type])} />
            <div className="space-y-1">
                <h3 className="font-semibold">{title}</h3>
                {message && <p className="text-sm opacity-90">{message}</p>}
            </div>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
} 