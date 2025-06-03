import React from 'react';
import {
    Tooltip as TooltipRoot,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./tooltip-primitive";
import { cn } from '@/lib/utils';

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    variant?: 'default' | 'info' | 'warning';
    delayDuration?: number;
    className?: string;
}

export function Tooltip({
    content,
    children,
    side = 'top',
    align = 'center',
    variant = 'default',
    delayDuration = 200,
    className
}: TooltipProps) {
    const variantStyles = {
        default: 'bg-popover text-popover-foreground',
        info: 'bg-blue-500 text-white',
        warning: 'bg-yellow-500 text-white'
    };

    return (
        <TooltipProvider delayDuration={delayDuration}>
            <TooltipRoot>
                <TooltipTrigger asChild>
                    {children}
                </TooltipTrigger>
                <TooltipContent
                    side={side}
                    align={align}
                    className={cn(
                        'rounded-md px-3 py-1.5 text-sm shadow-md animate-in fade-in-0 zoom-in-95',
                        variantStyles[variant],
                        className
                    )}
                >
                    {content}
                </TooltipContent>
            </TooltipRoot>
        </TooltipProvider>
    );
} 