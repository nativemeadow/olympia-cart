import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AlertDialogComponentProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onClose: () => void;
}

const AlertDialogComponent: React.FC<AlertDialogComponentProps> = ({
    open,
    onOpenChange,
    title,
    description,
    onClose,
}) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={onClose}>
                        Close
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default AlertDialogComponent;
