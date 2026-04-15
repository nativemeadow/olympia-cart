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
import { Attributes, Product, Category } from '@/types/model-types';
import { CategoryHierarchy } from '@/types';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { ImSpinner } from 'react-icons/im';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { useProductTreeStore } from '@/zustand/product-tree-store';

import axios from 'axios';

import ProductForm from './product-form';
import classes from './product-form.module.css';

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

    const handleSuccess = (categoryId: number) => {
        setIsOpen(false);
        onSuccess(categoryId);
    };

    const handleOpenAdd = () => {
        setIsOpen(true);
        fetch(route('dashboard.price.attributes'))
            .then((response) => response.json())
            .then((data) => {
                setAttributes(data.allAttributes);
                setAllCategories(data.allCategories);
                console.log(
                    'Fetching price attributes for add:',
                    data.allAttributes,
                );
            });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleOpenAdd}
                            className={classes.action_icon}
                        >
                            <Plus className={classes.plus_icon} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add Product</TooltipContent>
                </Tooltip>
            </DialogTrigger>
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
    const [productData, setProductData] = useState<Product | null>(null);
    const [attributes, setAttributes] = useState<Attributes[]>([]);
    const [allCategories, setAllCategories] = useState<CategoryHierarchy[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSuccess = (categoryId: number) => {
        onSuccess(categoryId);
        setIsOpen(false);
    };

    const handleOpen = () => {
        setIsOpen(true);
        setIsLoading(true);
        fetch(route('dashboard.product.show', { product_id: product.id }))
            .then((response) => response.json())
            .then((data) => {
                setProductData(data.product);
                setAttributes(data.allAttributes);
                setAllCategories(data.allCategories);
                console.log('Fetching product data for edit:', data.product);
            })
            .finally(() => setIsLoading(false));
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleOpen}
                            className={classes.action_icon}
                        >
                            <Pencil className={classes.action_icon} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit Product</TooltipContent>
                </Tooltip>
            </DialogTrigger>
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
                            {productData && (
                                <ProductForm
                                    product={productData}
                                    categoryId={
                                        productData.categories &&
                                        productData.categories[0]
                                            ? productData.categories[0].id
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
                <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`${classes.text_destructive} ${classes.delete_icon}`}
                        >
                            <Trash2 className={classes.delete_icon} />
                        </Button>
                    </AlertDialogTrigger>
                </TooltipTrigger>
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
