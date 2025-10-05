import { cn } from '@/lib/utils';
import React from 'react';

interface InputErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
    message?: string;
}

export function InputError({ message, className, ...props }: InputErrorProps) {
    if (!message) {
        return null;
    }

    return <p {...props} className={cn('text-sm font-medium text-destructive', className)}>{message}</p>;
}
