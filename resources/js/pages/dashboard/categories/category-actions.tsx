import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { CategoryHierarchy } from '@/types';
import { useForm } from '@inertiajs/react';
import CategoryForm from './category-form';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { PropsWithChildren, useState } from 'react';
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
            <DialogDescription>
                Are you sure you want to delete the category "{category.title}"?
                This action cannot be undone.
            </DialogDescription>
            <DialogFooter className="mt-4">
                <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={processing}
                >
                    {processing ? 'Deleting...' : 'Delete'}
                </Button>
            </DialogFooter>
        </>
    );
}

// function CategoryActionDialog({
//     children,
//     title,
//     open,
//     onOpenChange,
// }: PropsWithChildren<{
//     title: string;
//     open: boolean;
//     onOpenChange: (open: boolean) => void;
// }>) {
//     return (
//         <Dialog open={open} onOpenChange={onOpenChange}>
//             {children}
//         </Dialog>
//     );
// }

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
            <DialogContent onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Add Child to "{category.title}"</DialogTitle>
                </DialogHeader>
                <div className={classes.formContainer}>
                    <CategoryForm
                        category={category}
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
            <DialogContent onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Edit "{category.title}"</DialogTitle>
                </DialogHeader>
                <div className={classes.formContainer}>
                    <CategoryForm
                        category={category}
                        isEdit
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
    const [isOpen, setIsOpen] = useState(false);
    const handleSuccess = () => {
        onSuccess();
        setIsOpen(false);
    };
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`text-destructive ${classes.delete_icon}`}
                >
                    <Trash2 className={classes.delete_icon} />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Category</DialogTitle>
                </DialogHeader>
                <DeleteCategoryForm
                    category={category}
                    onSuccess={handleSuccess}
                />
            </DialogContent>
        </Dialog>
    );
}
