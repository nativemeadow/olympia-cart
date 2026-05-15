import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import classes from './product-form.module.css';

interface DeleteVariantFormProps {
    variantId: number;
    removeVariant: (variantId: number) => void;
}

export function DeleteVariantForm({
    variantId,
    removeVariant,
}: DeleteVariantFormProps) {
    const handleDelete = () => {
        removeVariant(variantId);
    };

    return (
        <AlertDialog>
            <Tooltip>
                <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            title="Remove price option"
                            className={classes.removePriceButton}
                            aria-label="Remove price option"
                        >
                            <Trash2 className={classes.trashIcon} />
                        </Button>
                    </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Remove Variant Option</TooltipContent>
            </Tooltip>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This will remove the price variant from the form. It
                        won't be deleted from the database until you save the
                        entire product.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
