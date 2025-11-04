'use client';

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onViewCart: () => void;
    children?: React.ReactNode;
};

const AddToCartDModal = ({ isOpen, onClose, onViewCart, children }: Props) => {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add to Cart</DialogTitle>
                </DialogHeader>
                <div className="p-5 text-gray-700 dark:text-gray-300">
                    {children}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Continue Shopping
                    </Button>
                    <Button onClick={onViewCart}>View Cart</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddToCartDModal;
