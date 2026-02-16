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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CategoryHierarchy } from '@/types';
import { useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { FormEventHandler, PropsWithChildren, useState } from 'react';
import styles from './categories.module.css';

type CategoryFormData = {
    title: string;
    parent_id: number | null;
};

function AddEditCategoryForm({
    category,
    isEdit = false,
    onSuccess,
}: {
    category?: CategoryHierarchy;
    isEdit?: boolean;
    onSuccess: () => void;
}) {
    const { data, setData, post, put, processing, errors, reset } =
        useForm<CategoryFormData>({
            title: category?.title || '',
            parent_id: isEdit
                ? category?.parent_id || null
                : category?.id || null,
        });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                reset();
                onSuccess();
            },
        };
        if (isEdit && category) {
            put(route('dashboard.categories.update', category.id), options);
        } else {
            post(route('dashboard.categories.store'), options);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                        Title
                    </Label>
                    <Input
                        id="title"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        className="col-span-3"
                    />
                    {errors.title && (
                        <p className="col-span-4 text-center text-sm text-red-600">
                            {errors.title}
                        </p>
                    )}
                </div>
            </div>
            <DialogFooter>
                <Button type="submit" disabled={processing}>
                    {processing ? 'Saving...' : 'Save'}
                </Button>
            </DialogFooter>
        </form>
    );
}

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

function CategoryActionDialog({
    children,
    title,
    open,
    onOpenChange,
}: PropsWithChildren<{
    title: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}>) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {children}
        </Dialog>
    );
}

export function AddCategoryAction({
    category,
    onSuccess,
}: {
    category?: CategoryHierarchy;
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
                <Button variant="ghost" size="icon">
                    <Plus className={styles.action_icon} />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Child to "{category?.title}"</DialogTitle>
                </DialogHeader>
                <AddEditCategoryForm
                    category={category}
                    onSuccess={handleSuccess}
                />
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
    const handleSuccess = () => {
        onSuccess();
        setIsOpen(false);
    };
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Pencil className={styles.action_icon} />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit "{category.title}"</DialogTitle>
                </DialogHeader>
                <AddEditCategoryForm
                    category={category}
                    isEdit
                    onSuccess={handleSuccess}
                />
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
                    className="text-destructive"
                >
                    <Trash2 className={styles.action_icon} />
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
