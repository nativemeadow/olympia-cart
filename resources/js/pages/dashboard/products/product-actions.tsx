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
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    initialProduct,
    initialVariant,
    PrepareProductData,
    findCategory,
} from './product-form-helpers';
import { Attributes, Product, Category } from '@/types/model-types';
import { CategoryHierarchy } from '@/types';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { ImSpinner } from 'react-icons/im';
import { useEffect, useState, useCallback } from 'react';
import { router, useForm } from '@inertiajs/react';
import { useProductTreeStore } from '@/zustand/product-tree-store';

import axios, { all } from 'axios';

import ProductForm from './product-form';
import classes from './product-form.module.css';

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

    const handleSuccess = (categoryId: number) => {
        setIsOpen(false);
        onSuccess(categoryId);
    };

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
                        categoryId={categoryId}
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
    const [attributes, setAttributes] = useState<Attributes[]>([]);
    const { allAttributes, allCategories, setAllCategories, setAllAttributes } =
        useProductTreeStore();
    const [preparedProduct, setPreparedProduct] = useState<Product | null>(
        null,
    );
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSuccess = useCallback(
        (categoryId: number) => {
            onSuccess(categoryId);
            setIsOpen(false);
        },
        [onSuccess],
    );

    useEffect(() => {
        if (isOpen) {
            const prepared = PrepareProductData(product, allAttributes);
            setPreparedProduct(prepared);
        }
    }, [isOpen, product, allAttributes]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTitle className="sr-only">Edit Product</DialogTitle>
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
                {isLoading ? (
                    <div className={classes.loadingContainer}>
                        <div className={classes.savingSpinner}>
                            <ImSpinner />
                        </div>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Edit: {product.title}</DialogTitle>
                        </DialogHeader>
                        <div className={classes.scrollable_content}>
                            {preparedProduct && (
                                <ProductForm
                                    product={preparedProduct}
                                    categoryId={
                                        preparedProduct.categories &&
                                        preparedProduct.categories[0]
                                            ? preparedProduct.categories[0].id
                                            : undefined
                                    }
                                    attributes={attributes}
                                    isEdit={true}
                                    onSuccess={handleSuccess}
                                    allCategories={allCategories}
                                />
                            )}
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                form="product-edit-form"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Loading...' : 'Save'}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
} // Memoize without dependencies to prevent re-renders

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
