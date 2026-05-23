import { useForm } from '@inertiajs/react';
import React, { FormEventHandler, memo, useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import cx from 'clsx';
import {
    Product,
    Category,
    Media,
    Attributes,
    ProductVariant,
    ExtendedProps,
} from '@/types/model-types';
import classes from './product-form.module.css';
import EditorComponent from '@/components/text-editor';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import MediaSelectionModal from '@/pages/dashboard/media/media-selection-modal';
import { generateSlug } from '@/utils/strings';
import '@/../css/errors.css';
import { DeleteVariantForm } from './delete-variant';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { ImSpinner } from 'react-icons/im';
import AlertDialogComponent from '@/components/AlertDialog';
import { CategoryHierarchy } from '@/types';
import CategoryManagement from './CategoryManagement';
import { useProductTreeStore } from '@/zustand/product-tree-store';
import { CategoryExpandedProvider } from '@/context/CategoryExpandedContext';
import ProductVariants from './components/product-variants';
import ProductDetails from './components/product-details';

const initialVariant = (attributes?: Attributes[]): ProductVariant => {
    const extended_properties: ExtendedProps = {};
    if (attributes) {
        attributes.forEach((attr) => {
            extended_properties[attr.name] = '';
        });
    }
    const defaultExtendedProps = {
        id: Date.now(), // Temporary unique ID
        product_id: 0,
        sku: '',
        price: 0,
        title: '',
        description: '',
        image: null,
        extended_properties: extended_properties,
    };
    return defaultExtendedProps;
};

type ProductFormData = {
    product: Product;
};

type FieldWrapperProps = {
    children: React.ReactNode;
    error?: string;
};

export const FieldWrapper: React.FC<FieldWrapperProps> = ({
    children,
    error,
}) => {
    return (
        <div className={classes.error_container}>
            {children}
            {error && <div className={classes.input_error_bubble}>{error}</div>}
        </div>
    );
};

type ProductFormProps = {
    product?: Product;
    categoryId?: number;
    attributes?: Attributes[];
    isEdit?: boolean;
    onSuccess: (categoryId: number) => void;
    allCategories: CategoryHierarchy[];
    useFormProps?: any;
};

const ProductForm = ({
    product,
    categoryId,
    attributes,
    isEdit = false,
    onSuccess,
    allCategories,
}: ProductFormProps) => {
    const { data, setData, errors, clearErrors, put, post, reset } =
        useForm<ProductFormData>({
            product: product as Product,
        });
    const [variantStrings, setVariantStrings] = useState<string[]>([]);
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(isEdit);
    const [isSaving, setIsSaving] = useState(false);
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [errorDialogMessage, setErrorDialogMessage] = useState('');
    const [isMainImageModalOpen, setIsMainImageModalOpen] = useState(false);
    const [openModalVariantId, setOpenModalVariantId] = useState<number | null>(
        null,
    );

    const { setActiveCategoryId } = useProductTreeStore(); // Get the action from the store

    console.log('ProductForm data:', data);

    const handleImageSelect = (image: Media, variantId?: number) => {
        if (variantId !== undefined) {
            if (!data.product.variants) return;
            const updatedVariants = data.product.variants.map(
                (variant: ProductVariant) => {
                    if (variant.id === variantId) {
                        return {
                            ...variant,
                            image: image,
                        };
                    }
                    return variant;
                },
            );

            setData('product.variants', updatedVariants);
            setOpenModalVariantId(null);
        } else {
            setData('product.media', [image]);
            setData('product.image', image.file_name);
            setIsMainImageModalOpen(false);
        }
    };

    const handleCategoriesChange = (categories: Category[]) => {
        setData('product.categories', categories);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        setIsSaving(true);
        const options = {
            onSuccess: () => {
                reset();
                const primaryCategoryId =
                    data.product.categories && data.product.categories[0]
                        ? data.product.categories[0].id
                        : categoryId;
                if (primaryCategoryId) {
                    // Set the active category in the store
                    setActiveCategoryId(primaryCategoryId);
                    // Then call the onSuccess prop to trigger the page reload
                    onSuccess(primaryCategoryId);
                }
                setIsSaving(false);
            },
            onError: (errorResponse: any) => {
                setIsSaving(false);
                let message = 'An unexpected error occurred.';
                if (typeof errorResponse === 'string') {
                    message = errorResponse;
                } else if (
                    typeof errorResponse === 'object' &&
                    errorResponse !== null
                ) {
                    // Check for a general error message from the backend
                    if (errorResponse.error) {
                        message = errorResponse.error;
                    } else if (errorResponse.message) {
                        message = errorResponse.message;
                    } else {
                        // Fallback for validation errors or other structures
                        const firstError = Object.values(errorResponse)[0];
                        message = Array.isArray(firstError)
                            ? firstError[0]
                            : JSON.stringify(errorResponse);
                    }
                }
                setErrorDialogMessage(message);
                setErrorDialogOpen(true);
                console.error('Failed to save product:', errorResponse);
            },
        };

        if (isEdit && product) {
            put(route('dashboard.products.update', product.id), options);
        } else {
            post(route('dashboard.products.store', categoryId), options);
        }
    };

    const addVariant = () => {
        const newVariant = {
            ...initialVariant(attributes),
            id: Date.now(), // Temporary ID for React key
        };
        setData(
            'product.variants',
            data.product?.variants
                ? [...data.product.variants, newVariant]
                : [newVariant],
        );
    };

    const removeVariant = (variantId: number) => {
        if (!data.product.variants) return;
        const updatedVariants = data.product.variants.filter(
            (variant: ProductVariant) => variant.id !== variantId,
        );
        setData('product.variants', updatedVariants);
    };

    const updateVariant = (
        e: React.ChangeEvent<HTMLInputElement>,
        index: number,
    ) => {
        clearErrors(`product.variants.${index}.price` as any);
        const newVariantStrings = {
            ...variantStrings,
            [index]: e.target.value,
        };
        setVariantStrings(newVariantStrings);

        const valueInCents = Math.round(parseFloat(e.target.value) * 100);
        if (!isNaN(valueInCents)) {
            setData(`product.variants.${index}.price` as any, valueInCents);
        }
    };

    if (!data.product) {
        return <div>Loading...</div>; // Or a spinner component
    }

    return (
        <>
            <AlertDialogComponent
                open={errorDialogOpen}
                onOpenChange={setErrorDialogOpen}
                title="Error"
                description={errorDialogMessage}
                onClose={() => setErrorDialogOpen(false)}
            />
            {isSaving && (
                <div className={classes.savingOverlay}>
                    <div className={classes.savingSpinner}>
                        <ImSpinner />
                    </div>
                    <div
                        style={{
                            fontSize: '2rem',
                            color: '#2563eb',
                            marginTop: '1rem',
                        }}
                    >
                        Saving product...
                    </div>
                </div>
            )}
            <form id="product-edit-form" onSubmit={handleSubmit}>
                <div className={classes.product_form}>
                    <div className={classes.center_column}>
                        {/* Product details section with image selection modal */}
                        <ProductDetails
                            product={data.product}
                            setData={setData}
                            errors={errors}
                            clearErrors={clearErrors}
                            isSlugManuallyEdited={isSlugManuallyEdited}
                            setIsSlugManuallyEdited={setIsSlugManuallyEdited}
                            handleImageSelect={handleImageSelect}
                            isMainImageModalOpen={isMainImageModalOpen}
                            setIsMainImageModalOpen={setIsMainImageModalOpen}
                        />
                    </div>
                    <div className={classes.right_column}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Categories</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CategoryExpandedProvider>
                                    <CategoryManagement
                                        allCategories={allCategories}
                                        associatedCategories={
                                            data.product.categories || []
                                        }
                                        onCategoriesChange={
                                            handleCategoriesChange
                                        }
                                    />
                                </CategoryExpandedProvider>
                            </CardContent>
                        </Card>
                        {/* Add fields for variants and categories here */}
                        <ProductVariants
                            variants={data.product.variants || []}
                            setData={setData}
                            errors={errors}
                            clearErrors={clearErrors}
                            addVariant={addVariant}
                            removeVariant={removeVariant}
                            handleImageSelect={handleImageSelect}
                            productId={data.product.id}
                        />
                    </div>
                </div>
            </form>

            <AlertDialogComponent
                open={errorDialogOpen}
                onOpenChange={setErrorDialogOpen}
                title="Error"
                description={errorDialogMessage}
                onClose={() => setErrorDialogOpen(false)}
            />
        </>
    );
};

export default memo(ProductForm);
