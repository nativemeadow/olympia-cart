import React, { FormEventHandler, useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
    Product,
    Attributes,
    Category,
    Media,
    ProductVariant,
} from '@/types/model-types';
import { CategoryHierarchy } from '@/types';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { slugify } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ImSpinner } from 'react-icons/im';
import { useProductTreeStore } from '@/zustand/product-tree-store';
import {
    useProductsAdminStore,
    CurrentProduct,
} from '@/zustand/product-admin-store';
import { CategoryExpandedProvider } from '@/context/CategoryExpandedContext';
import CategoryManagement from '../CategoryManagement';
import MediaSelectionModal from '../../media/media-selection-modal';
import EditorComponent from '@/components/text-editor/Editor';
import AlertDialogComponent from '@/components/AlertDialog';
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from '@/components/ui/tooltip';
import { Plus } from 'lucide-react';
import classes from './product-form.module.css';
import cx from 'classnames';
import { initialVariant, PrepareProductData } from './product-form-helpers';

type ProductFormData = {
    product: Product;
};

type FieldWrapperProps = {
    children: React.ReactNode;
    error?: string;
};

const FieldWrapper: React.FC<FieldWrapperProps> = ({ children, error }) => {
    return (
        <div className={classes.error_container}>
            {children}
            {error && <div className={classes.input_error_bubble}>{error}</div>}
        </div>
    );
};

const ProductForm = ({
    product,
    attributes,
    isEdit = false,
    onSuccess,
    allCategories,
    useFormProps,
}: {
    product?: Product;
    attributes?: Attributes[];
    isEdit?: boolean;
    onSuccess: (categoryId: number) => void;
    allCategories: CategoryHierarchy[];
    useFormProps: any;
}) => {
    const { data, setData, errors, clearErrors, put, post, reset } =
        useFormProps;
    console.log('ProductForm rendered with product:', product);
    const [variantStrings, setVariantStrings] = useState<string[]>([]);
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(isEdit);
    const [isSaving, setIsSaving] = useState(false);
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [errorDialogMessage, setErrorDialogMessage] = useState('');

    const { setCurrentProduct } = useProductsAdminStore();

    useEffect(() => {
        if (isEdit && product) {
            const currentProduct: CurrentProduct = {
                status: 'updated',
                product: PrepareProductData(product!, attributes),
                categoryId: product.categories?.[0]?.id || null,
            };
            setCurrentProduct(currentProduct);
        }
    }, [product, isEdit, attributes, setCurrentProduct]);

    const { setActiveCategoryId } = useProductTreeStore(); // Get the action from the store

    console.log('ProductForm data:', data);
    console.log('ProductForm attributes:', attributes);

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

            setData('product.variants', updatedVariants as any);
        } else {
            setData('product.image', image.file_name);
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
                        : product?.categories?.[0]?.id;
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
            post(
                route('dashboard.products.store', product?.categories?.[0]?.id),
                options,
            );
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
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Details</CardTitle>
                                <CardDescription>
                                    Manage Product details.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className={classes.card_content}>
                                <div>
                                    <Label
                                        htmlFor="title"
                                        className={classes.label}
                                    >
                                        Title
                                    </Label>
                                    <FieldWrapper
                                        error={errors['product.title']}
                                    >
                                        <Input
                                            id="title"
                                            type="text"
                                            value={data.product.title}
                                            onChange={(e) => {
                                                clearErrors('product.title');
                                                const newTitle = e.target.value;
                                                setData(
                                                    'product.title',
                                                    newTitle,
                                                );
                                                if (!isSlugManuallyEdited) {
                                                    setData(
                                                        'product.slug',
                                                        slugify(newTitle),
                                                    );
                                                }
                                            }}
                                            className={cx(classes.input, {
                                                'input-with-error':
                                                    errors['product.title'],
                                            })}
                                        />
                                    </FieldWrapper>
                                </div>
                                <div>
                                    <Label
                                        htmlFor="sku"
                                        className={classes.label}
                                    >
                                        SKU
                                    </Label>
                                    <FieldWrapper error={errors['product.sku']}>
                                        <Input
                                            id="sku"
                                            type="text"
                                            value={data.product.sku}
                                            onChange={(e) => {
                                                clearErrors('product.sku');
                                                setData(
                                                    'product.sku',
                                                    e.target.value,
                                                );
                                            }}
                                            className={cx(classes.input, {
                                                'input-with-error':
                                                    errors['product.sku'],
                                            })}
                                        />
                                    </FieldWrapper>
                                </div>
                                <div>
                                    <Label
                                        htmlFor="slug"
                                        className={classes.label}
                                    >
                                        Slug
                                    </Label>
                                    <FieldWrapper
                                        error={errors['product.slug']}
                                    >
                                        <Input
                                            id="slug"
                                            type="text"
                                            value={data.product.slug}
                                            onChange={(e) => {
                                                clearErrors('product.slug');
                                                setData(
                                                    'product.slug',
                                                    e.target.value,
                                                );
                                                setIsSlugManuallyEdited(true);
                                            }}
                                            className={cx(classes.input, {
                                                'input-with-error':
                                                    errors['product.slug'],
                                            })}
                                        />
                                    </FieldWrapper>
                                </div>
                                <div>
                                    <Label
                                        htmlFor="slug"
                                        className={classes.label}
                                    >
                                        Status
                                    </Label>
                                    <FieldWrapper
                                        error={errors['product.status']}
                                    >
                                        <RadioGroup
                                            onValueChange={(value) => {
                                                clearErrors('product.status');
                                                setData(
                                                    'product.status',
                                                    value === '1',
                                                );
                                            }}
                                            value={
                                                data.product.status ? '1' : '0'
                                            }
                                            className={cx(classes.radioGroup, {
                                                'input-with-error':
                                                    errors['product.status'],
                                            })}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem
                                                    value="1"
                                                    id="status-active"
                                                />
                                                <Label htmlFor="status-active">
                                                    Active
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem
                                                    value="0"
                                                    id="status-inactive"
                                                />
                                                <Label htmlFor="status-inactive">
                                                    Inactive
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </FieldWrapper>
                                </div>
                                <div>
                                    <Label
                                        htmlFor="description"
                                        className={classes.label}
                                    >
                                        Description
                                    </Label>
                                    <FieldWrapper
                                        error={errors['product.description']}
                                    >
                                        {data.product.description !==
                                            undefined && (
                                            <EditorComponent
                                                key={data.product.id}
                                                id="description"
                                                initialValue={
                                                    data.product.description ||
                                                    ''
                                                }
                                                handleEditorChange={(
                                                    content: string,
                                                ) => {
                                                    clearErrors(
                                                        'product.description',
                                                    );
                                                    setData(
                                                        'product.description',
                                                        content,
                                                    );
                                                }}
                                            />
                                        )}
                                    </FieldWrapper>
                                </div>
                                <Separator className="my-6" />
                                <div className={classes.imageContainer}>
                                    <h2>Image</h2>
                                    {data.product.image ? (
                                        <div className={classes.imagePreview}>
                                            <img
                                                src={`/storage/${data.product.image}`}
                                                alt={'Product image'}
                                            />
                                            <Button
                                                variant="destructive"
                                                onClick={() => {
                                                    setData(
                                                        'product.image',
                                                        null,
                                                    );
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ) : (
                                        <MediaSelectionModal
                                            onSelect={(image) =>
                                                handleImageSelect(image)
                                            }
                                            entityId={data.product.id}
                                            mediaType="product"
                                        >
                                            <div
                                                className={
                                                    classes.imagePlaceholder
                                                }
                                            >
                                                Click to select an image
                                            </div>
                                        </MediaSelectionModal>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
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
                        {data.product?.variants && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Variants</CardTitle>
                                    <CardDescription
                                        className={classes.cardDescription}
                                    >
                                        <span>
                                            Manage product variants and options.
                                        </span>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={addVariant}
                                                    className={
                                                        classes.addVariantButton
                                                    }
                                                >
                                                    <Plus />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Add Variant</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent
                                    className={cx(
                                        classes.card_content,
                                        classes.pricesCardContent,
                                    )}
                                >
                                    <>
                                        {data.product.variants.map(
                                            (
                                                variant: ProductVariant,
                                                index: number,
                                            ) => (
                                                <div
                                                    key={variant.id}
                                                    className={
                                                        classes.variant_row
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            classes.variant_fields
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                classes.variant_field_row
                                                            }
                                                        >
                                                            <div
                                                                className={
                                                                    classes.variant_field
                                                                }
                                                            >
                                                                <Label
                                                                    htmlFor={`variant-sku-${variant.id}`}
                                                                >
                                                                    SKU
                                                                </Label>
                                                                <FieldWrapper
                                                                    error={
                                                                        errors[
                                                                            `product.variants.${index}.sku`
                                                                        ]
                                                                    }
                                                                >
                                                                    <Input
                                                                        id={`variant-sku-${variant.id}`}
                                                                        type="text"
                                                                        value={
                                                                            variant.sku ||
                                                                            ''
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setData(
                                                                                `product.variants.${index}.sku` as any,
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                    />
                                                                </FieldWrapper>
                                                            </div>
                                                            <div
                                                                className={
                                                                    classes.variant_field
                                                                }
                                                            >
                                                                <Label
                                                                    htmlFor={`variant-price-${variant.id}`}
                                                                >
                                                                    Price
                                                                </Label>
                                                                <FieldWrapper
                                                                    error={
                                                                        errors[
                                                                            `product.variants.${index}.price`
                                                                        ]
                                                                    }
                                                                >
                                                                    <Input
                                                                        id={`variant-price-${variant.id}`}
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={
                                                                            variantStrings[
                                                                                index
                                                                            ] ??
                                                                            (
                                                                                variant.price /
                                                                                100
                                                                            ).toFixed(
                                                                                2,
                                                                            )
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            updateVariant(
                                                                                e,
                                                                                index,
                                                                            )
                                                                        }
                                                                    />
                                                                </FieldWrapper>
                                                            </div>
                                                        </div>
                                                        <div
                                                            className={
                                                                classes.variant_field_row
                                                            }
                                                        >
                                                            <div
                                                                className={
                                                                    classes.variant_field
                                                                }
                                                            >
                                                                <Label
                                                                    htmlFor={`variant-title-${variant.id}`}
                                                                >
                                                                    Price Label
                                                                </Label>
                                                                <FieldWrapper
                                                                    error={
                                                                        errors[
                                                                            `product.variants.${index}.title`
                                                                        ]
                                                                    }
                                                                >
                                                                    <Input
                                                                        id={`variant-title-${variant.id}`}
                                                                        type="text"
                                                                        value={
                                                                            variant.title ||
                                                                            ''
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setData(
                                                                                `product.variants.${index}.title` as any,
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                    />
                                                                </FieldWrapper>
                                                            </div>
                                                            <div
                                                                className={
                                                                    classes.variant_field
                                                                }
                                                            >
                                                                <Label
                                                                    htmlFor={`variant-description-${variant.id}`}
                                                                >
                                                                    Select Label
                                                                </Label>
                                                                <FieldWrapper
                                                                    error={
                                                                        errors[
                                                                            `product.variants.${index}.description`
                                                                        ]
                                                                    }
                                                                >
                                                                    <Input
                                                                        id={`variant-description-${variant.id}`}
                                                                        type="text"
                                                                        value={
                                                                            variant.description ||
                                                                            ''
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setData(
                                                                                `product.variants.${index}.description` as any,
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                    />
                                                                </FieldWrapper>
                                                            </div>
                                                        </div>
                                                        <div
                                                            className={
                                                                classes.variant_field_row
                                                            }
                                                        >
                                                            <div
                                                                className={
                                                                    classes.variant_field
                                                                }
                                                            >
                                                                <Label
                                                                    htmlFor={`variant-image-${variant.id}`}
                                                                >
                                                                    Image
                                                                </Label>
                                                                <div
                                                                    className={
                                                                        classes.variantImageContainer
                                                                    }
                                                                >
                                                                    {variant.image ? (
                                                                        <div
                                                                            className={
                                                                                classes.imagePreview
                                                                            }
                                                                        >
                                                                            <img
                                                                                src={`/storage/${variant.image.file_path}`}
                                                                                alt={
                                                                                    variant
                                                                                        .image
                                                                                        .alt_text ||
                                                                                    'Variant image'
                                                                                }
                                                                            />
                                                                            <Button
                                                                                variant="destructive"
                                                                                onClick={() =>
                                                                                    setData(
                                                                                        `product.variants.${index}.image` as any,
                                                                                        null,
                                                                                    )
                                                                                }
                                                                            >
                                                                                Remove
                                                                            </Button>
                                                                        </div>
                                                                    ) : (
                                                                        <MediaSelectionModal
                                                                            onSelect={(
                                                                                image,
                                                                            ) =>
                                                                                handleImageSelect(
                                                                                    image,
                                                                                    variant.id,
                                                                                )
                                                                            }
                                                                            entityId={
                                                                                data
                                                                                    .product
                                                                                    .id
                                                                            }
                                                                            mediaType="product"
                                                                        >
                                                                            <div
                                                                                className={
                                                                                    classes.imagePlaceholder
                                                                                }
                                                                            >
                                                                                Click
                                                                                to
                                                                                select
                                                                                an
                                                                                image
                                                                            </div>
                                                                        </MediaSelectionModal>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {variant.extended_properties &&
                                                            Object.keys(
                                                                variant.extended_properties,
                                                            ).map(
                                                                (attrName) => (
                                                                    <div
                                                                        key={
                                                                            attrName
                                                                        }
                                                                        className={
                                                                            classes.variant_field
                                                                        }
                                                                    >
                                                                        <Label
                                                                            htmlFor={`variant-${attrName}-${variant.id}`}
                                                                        >
                                                                            {attributes?.find(
                                                                                (
                                                                                    attr,
                                                                                ) =>
                                                                                    attr.name ===
                                                                                    attrName,
                                                                            )
                                                                                ?.name ||
                                                                                attrName}
                                                                        </Label>
                                                                        <Input
                                                                            id={`variant-${attrName}-${variant.id}`}
                                                                            type="text"
                                                                            value={
                                                                                variant.extended_properties?.[
                                                                                    attrName
                                                                                ]?.toString() ||
                                                                                ''
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setData(
                                                                                    `product.variants.${index}.extended_properties.${attrName}` as any,
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                ),
                                                            )}
                                                    </div>
                                                    <div
                                                        className={
                                                            classes.variant_actions
                                                        }
                                                    >
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            onClick={() =>
                                                                removeVariant(
                                                                    variant.id,
                                                                )
                                                            }
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </>
                                </CardContent>
                            </Card>
                        )}
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

export default ProductForm;
