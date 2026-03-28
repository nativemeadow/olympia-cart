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
import { useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import ProductForm from './product-form';
import styles from '../categories/categories.module.css';
import classes from './products.module.css';

function DeleteProductForm({
    product,
    onSuccess,
}: {
    product: Product;
    onSuccess: () => void;
}) {
    const { delete: destroy, processing } = useForm({});

    const handleDelete = () => {
        destroy(route('dashboard.products.destroy', product.id), {
            onSuccess,
            preserveScroll: true,
        });
    };

    return (
        <>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    Are you sure you want to delete the product "{product.title}
                    "? This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    onClick={handleDelete}
                    disabled={processing}
                    className={classes.delete_button}
                >
                    {processing ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </>
    );
}

export function AddProductAction({
    onSuccess,
    categoryId,
}: {
    onSuccess: () => void;
    categoryId: number;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [attributes, setAttributes] = useState<Attributes[]>([]);
    const [allCategories, setAllCategories] = useState<CategoryHierarchy[]>([]);

    const handleSuccess = () => {
        setIsOpen(false);
        onSuccess();
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
                            <Plus className={styles.plus_icon} />
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
    onSuccess: () => void;
}) {
    const [productData, setProductData] = useState<Product | null>(null);
    const [attributes, setAttributes] = useState<Attributes[]>([]);
    const [allCategories, setAllCategories] = useState<CategoryHierarchy[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const handleSuccess = () => {
        onSuccess();
        setIsOpen(false);
    };

    const handleOpen = () => {
        setIsOpen(true);
        fetch(route('dashboard.product.show', { product_id: product.id }))
            .then((response) => response.json())
            .then((data) => {
                setProductData(data.product);
                setAttributes(data.allAttributes);
                setAllCategories(data.allCategories);
                console.log('Fetching product data for edit:', data.product);
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
                            onClick={handleOpen}
                            className={classes.action_icon}
                        >
                            <Pencil className={styles.action_icon} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit Product</TooltipContent>
                </Tooltip>
            </DialogTrigger>
            <DialogContent
                className={classes.form_dialog}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Edit "{product.title}"</DialogTitle>
                </DialogHeader>
                <div className={classes.scrollable_content}>
                    {productData ? (
                        <ProductForm
                            product={productData}
                            attributes={attributes}
                            isEdit={true}
                            onSuccess={handleSuccess}
                            allCategories={allCategories}
                        />
                    ) : (
                        <p>Loading...</p>
                    )}
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

export function DeleteProductAction({
    product,
    onSuccess,
}: {
    product: Product;
    onSuccess: () => void;
}) {
    return (
        <AlertDialog>
            <Tooltip>
                <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`text-destructive ${classes.action_icon}`}
                        >
                            <Trash2 className={styles.action_icon} />
                        </Button>
                    </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Delete Product</TooltipContent>
            </Tooltip>
            <AlertDialogContent>
                <DeleteProductForm product={product} onSuccess={onSuccess} />
            </AlertDialogContent>
        </AlertDialog>
    );
}
