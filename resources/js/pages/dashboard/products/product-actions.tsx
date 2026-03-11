import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Attributes, Product } from '@/types/model-types';
import { useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
    FormEventHandler,
    PropsWithChildren,
    useEffect,
    useState,
} from 'react';

import ProductForm from './product-form';
import styles from '../categories/categories.module.css';
import classes from './products.module.css';

type ProductFormData = {
    name: string;
    // Add other product fields here
};

function AddEditProductForm({
    product,
    isEdit = false,
    onSuccess,
}: {
    product?: Product;
    isEdit?: boolean;
    onSuccess: () => void;
}) {
    const { data, setData, post, put, processing, errors, reset } =
        useForm<ProductFormData>({
            name: product?.title || '',
            // Initialize other product fields here
        });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                reset();
                onSuccess();
            },
        };
        if (isEdit && product) {
            put(route('dashboard.products.update', product.id), options);
        } else {
            post(route('dashboard.products.store'), options);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                        Name
                    </Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="col-span-3"
                    />
                    {errors.name && (
                        <p className="col-span-4 text-center text-sm text-red-600">
                            {errors.name}
                        </p>
                    )}
                </div>
                {/* Add other product form fields here */}
            </div>
            <DialogFooter>
                <Button type="submit" disabled={processing}>
                    {processing ? 'Saving...' : 'Save'}
                </Button>
            </DialogFooter>
        </form>
    );
}

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
            <DialogDescription>
                Are you sure you want to delete the product "{product.title}"?
                This action cannot be undone.
            </DialogDescription>
            <DialogFooter className="mt-4">
                <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={processing}
                    className={classes.delete_button}
                >
                    {processing ? 'Deleting...' : 'Delete'}
                </Button>
            </DialogFooter>
        </>
    );
}

export function AddProductAction({ onSuccess }: { onSuccess: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [attributes, setAttributes] = useState<Attributes[]>([]);

    const handleSuccess = () => {
        onSuccess();
        setIsOpen(false);
    };

    const handleOpenAdd = () => {
        setIsOpen(true);
        fetch(route('dashboard.price.attributes'))
            .then((response) => response.json())
            .then((data) => {
                setAttributes(data.allAttributes);
                console.log(
                    'Fetching price attributes for add:',
                    data.allAttributes,
                );
            });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleOpenAdd}
                    className={classes.action_icon}
                >
                    <Plus className={styles.plus_icon} />
                </Button>
            </DialogTrigger>
            <DialogContent className={classes.form_dialog}>
                <DialogHeader>
                    <DialogTitle>Add Product</DialogTitle>
                </DialogHeader>
                <ProductForm
                    attributes={attributes}
                    isEdit={false}
                    onSuccess={handleSuccess}
                />
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
                console.log('Fetching product data for edit:', data.product);
            });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleOpen}
                    className={classes.action_icon}
                >
                    <Pencil className={styles.action_icon} />
                </Button>
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
                    <Trash2 className={styles.action_icon} />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Product</DialogTitle>
                </DialogHeader>
                <DeleteProductForm
                    product={product}
                    onSuccess={handleSuccess}
                />
            </DialogContent>
        </Dialog>
    );
}
