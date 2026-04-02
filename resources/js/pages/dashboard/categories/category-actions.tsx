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
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { CategoryHierarchy } from '@/types';
import { useForm } from '@inertiajs/react';
import CategoryForm from './category-form';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import classes from './categories.module.css';
import { useCategoryExpanded } from '@/context/CategoryExpandedContext';

function DeleteCategoryForm({
    category,
    onSuccess,
}: {
    category: CategoryHierarchy;
    onSuccess: () => void;
}) {
    const { delete: destroy, processing } = useForm({});

    const handleDelete = () => {
        destroy(route('dashboard.categories.destroy', category.id), {
            onSuccess,
            preserveScroll: true,
        });
    };

    return (
        <>
            <AlertDialogHeader>
                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                <AlertDialogDescription>
                    Are you sure you want to delete the category "
                    {category.title}"? This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    onClick={handleDelete}
                    disabled={processing}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                    {processing ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </>
    );
}

export function AddCategoryAction({
    category,
    onSuccess,
}: {
    category: CategoryHierarchy;
    onSuccess: () => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const { expand } = useCategoryExpanded();

    const handleSuccess = () => {
        expand(category.id);
        onSuccess();
        setIsOpen(false);
    };
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={classes.plus_icon}
                >
                    <Plus className={classes.plus_icon} />
                </Button>
            </DialogTrigger>
            <DialogContent
                className={classes.form_dialog}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Add Child to "{category.title}"</DialogTitle>
                </DialogHeader>
                <div className={classes.formContainer}>
                    <CategoryForm
                        category={category}
                        isEdit={false}
                        onSuccess={handleSuccess}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function EditCategoryAction({
    category,
    onSuccess,
}: {
    category: CategoryHierarchy;
    onSuccess: () => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const { expandAll } = useCategoryExpanded();

    const handleSuccess = () => {
        const idsToExpand = [category.id];
        if (category.parent_id) {
            idsToExpand.push(category.parent_id);
        }
        expandAll(idsToExpand);
        onSuccess();
        setIsOpen(false);
    };
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={classes.pencil_icon}
                >
                    <Pencil className={classes.action_icon} />
                </Button>
            </DialogTrigger>
            <DialogContent
                className={classes.form_dialog}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Edit "{category.title}"</DialogTitle>
                </DialogHeader>
                <div className={classes.formContainer}>
                    <CategoryForm
                        category={category}
                        isEdit={true}
                        onSuccess={handleSuccess}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function DeleteCategoryAction({
    category,
    onSuccess,
}: {
    category: CategoryHierarchy;
    onSuccess: () => void;
}) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`${classes.text_destructive} ${classes.delete_icon}`}
                >
                    <Trash2 className={classes.delete_icon} />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <DeleteCategoryForm category={category} onSuccess={onSuccess} />
            </AlertDialogContent>
        </AlertDialog>
    );
}
