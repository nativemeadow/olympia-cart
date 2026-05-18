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
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Attributes, Product, Category } from '@/types/model-types';
import { CategoryHierarchy } from '@/types';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { useProductTreeStore } from '@/zustand/product-tree-store';
import ProductForm from './product-form';
import classes from './product-form.module.css';
import {
    initialProduct,
    initialVariant,
    PrepareProductData,
    findCategory,
} from './product-form-helpers';

type ProductFormData = {
    product: Product;
};

export function AddProductAction({
    onSuccess,
    categoryId,
}: {
    onSuccess: (categoryId: number) => void;
    categoryId: number;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [attributes, setAttributes] = useState<Attributes[]>([]);
    const [allCategories, setAllCategories] = useState<CategoryHierarchy[]>([]);
    const useFormProps = useForm<ProductFormData>();
    const { setData } = useFormProps;

    useEffect(() => {
        if (isOpen) {
            // get the list of all price attributes and categories
            // then prepare the product data for the form and set it in state
            fetch(route('dashboard.price.attributes'))
                .then((response) => response.json())
                .then((data) => {
                    setAttributes(data.allAttributes);
                    setAllCategories(data.allCategories);
                    const initialData = {
                        ...initialProduct(),
                        variants: [initialVariant(data.allAttributes)],
                    };
                    const categoryToAdd = findCategory(
                        data.allCategories,
                        categoryId,
                    );
                    if (categoryToAdd) {
                        initialData.categories = [
                            ...(initialData.categories || []),
                            categoryToAdd,
                        ];
                    }
                    setData('product', initialData);
                });
        }
    }, [isOpen, categoryId, setData]);

    const handleSuccess = (categoryId: number) => {
        setIsOpen(false);
        onSuccess(categoryId);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={classes.action_icon}
                        >
                            <Plus className={classes.plus_icon} />
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Add Product</TooltipContent>
            </Tooltip>
            <DialogContent
                className={classes.form_dialog}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Add Product</DialogTitle>
                </DialogHeader>
                <div className={classes.scrollable_content}>
                    <ProductForm
                        attributes={attributes}
                        isEdit={false}
                        onSuccess={handleSuccess}
                        allCategories={allCategories}
                        useFormProps={useFormProps}
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" form="product-edit-form">
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function EditProductAction({
    product,
    onSuccess,
}: {
    product: Product;
    onSuccess: (categoryId: number) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [attributes, setAttributes] = useState<Attributes[]>([]);
    const [allCategories, setAllCategories] = useState<CategoryHierarchy[]>([]);
    const [preparedProduct, setPreparedProduct] = useState<Product | null>(
        null,
    );
    const useFormProps = useForm<ProductFormData>();
    const { setData } = useFormProps;

    useEffect(() => {
        if (isOpen) {
            // get the list of all price attributes and categories
            // then prepare the product data for the form and set it in state
            fetch(route('dashboard.price.attributes'))
                .then((response) => response.json())
                .then((data) => {
                    const prepared = PrepareProductData(
                        product,
                        data.allAttributes,
                    );
                    setAttributes(data.allAttributes);
                    setAllCategories(data.allCategories);
                    setPreparedProduct(prepared);
                    setData('product', prepared);
                });
        }
    }, [isOpen, product, setData]);

    const handleSuccess = (categoryId: number) => {
        setIsOpen(false);
        onSuccess(categoryId);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={classes.action_icon}
                        >
                            <Pencil className={classes.edit_icon} />
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Edit Product</TooltipContent>
            </Tooltip>
            <DialogContent
                className={classes.form_dialog}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Edit Product</DialogTitle>
                </DialogHeader>
                <div className={classes.scrollable_content}>
                    {preparedProduct && (
                        <ProductForm
                            product={preparedProduct}
                            attributes={attributes}
                            isEdit={true}
                            onSuccess={handleSuccess}
                            allCategories={allCategories}
                            useFormProps={useFormProps}
                        />
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" form="product-edit-form">
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function DeleteProductAction({
    product,
    onSuccess,
}: {
    product: Product;
    onSuccess: (categoryId: number) => void;
}) {
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setActiveCategoryId } = useProductTreeStore();

    const handleDelete = async () => {
        setProcessing(true);
        setError(null);
        try {
            await axios.delete(route('dashboard.products.destroy', product.id));

            const primaryCategoryId =
                product.categories && product.categories[0]
                    ? product.categories[0].id
                    : undefined;

            if (primaryCategoryId) {
                // 1. Set the active category in the store
                setActiveCategoryId(primaryCategoryId);

                // 2. Directly trigger the page reload
                router.visit(route('dashboard.products'), {
                    only: ['categories'],
                    preserveState: false,
                    preserveScroll: true,
                });
            }
        } catch (err: any) {
            setError(
                err.response?.data?.error ||
                    'An unexpected error occurred. Please try again.',
            );
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AlertDialog>
            <Tooltip>
                <AlertDialogTrigger asChild>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`${classes.text_destructive} ${classes.delete_icon}`}
                        >
                            <Trash2 className={classes.delete_icon} />
                        </Button>
                    </TooltipTrigger>
                </AlertDialogTrigger>
                <TooltipContent>Delete Product</TooltipContent>
            </Tooltip>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the product:
                        <br />
                        <strong>{product.title}</strong>
                        {error && (
                            <div className="mt-4 text-red-500">{error}</div>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={processing}
                    >
                        {processing ? 'Deleting...' : 'Continue'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
