import React, { FormEventHandler, useState } from 'react';
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

const excludeKeys = ['Title', 'Description', 'Image'];

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
    categoryId,
    attributes,
    isEdit = false,
    onSuccess,
    allCategories,
    useFormProps,
}: {
    product?: Product;
    categoryId?: number;
    attributes?: Attributes[];
    isEdit?: boolean;
    onSuccess: (categoryId: number) => void;
    allCategories: CategoryHierarchy[];
    useFormProps: any;
}) => {
    const { data, setData, errors, clearErrors, put, post, reset } =
        useFormProps;
    const [variantStrings, setVariantStrings] = useState<string[]>([]);
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(isEdit);
    const [isSaving, setIsSaving] = useState(false);
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [errorDialogMessage, setErrorDialogMessage] = useState('');

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
        } else {
            setData('product.media', [image]);
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
                                                    clearErrors('product.slug');
                                                    setData(
                                                        'product.slug',
                                                        generateSlug(newTitle),
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
                                            <div className={classes.radioItem}>
                                                <RadioGroupItem
                                                    value="1"
                                                    id="status-active"
                                                />
                                                <Label htmlFor="status-active">
                                                    Active
                                                </Label>
                                            </div>
                                            <div className={classes.radioItem}>
                                                <RadioGroupItem
                                                    value="0"
                                                    id="status-draft"
                                                />
                                                <Label htmlFor="status-draft">
                                                    Draft
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
                                        <EditorComponent
                                            id="description"
                                            initialValue={
                                                data.product.description || ''
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
                                    </FieldWrapper>
                                </div>
                                <Separator className="my-6" />
                                <div className={classes.imageContainer}>
                                    <h2>Image</h2>
                                    {data.product.media &&
                                    data.product.media.length > 0 ? (
                                        <>
                                            {data.product.media.map(
                                                (mediaItem: Media) => (
                                                    <div
                                                        key={mediaItem.id}
                                                        className={
                                                            classes.mediaItem
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                classes.mediaCard
                                                            }
                                                        >
                                                            <figure
                                                                className={
                                                                    classes.mediaFigure
                                                                }
                                                            >
                                                                <img
                                                                    src={
                                                                        '/' +
                                                                        mediaItem.file_path +
                                                                        mediaItem.file_name
                                                                    }
                                                                    alt={
                                                                        mediaItem.alt_text ||
                                                                        mediaItem.title
                                                                    }
                                                                    className={
                                                                        classes.product_image_preview
                                                                    }
                                                                />
                                                            </figure>

                                                            <div>
                                                                <MediaSelectionModal
                                                                    onSelect={
                                                                        handleImageSelect
                                                                    }
                                                                    entityId={
                                                                        data
                                                                            .product
                                                                            .id
                                                                    }
                                                                    mediaType="product"
                                                                >
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className={
                                                                            classes.changeImageButton
                                                                        }
                                                                    >
                                                                        Change
                                                                        Image
                                                                    </Button>
                                                                </MediaSelectionModal>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </>
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
                                                    classes.addImagePlaceholder
                                                }
                                            >
                                                <p>Add image</p>
                                            </div>
                                        </MediaSelectionModal>
                                    )}
                                </div>

                                {data.product.media ? (
                                    <div>
                                        <Label
                                            htmlFor="image"
                                            className={classes.label}
                                        >
                                            Image File
                                        </Label>
                                        <FieldWrapper
                                            error={errors['product.image']}
                                        >
                                            <Input
                                                id="image"
                                                name="image"
                                                type="text"
                                                disabled
                                                value={data.product.image || ''}
                                                onChange={(e) =>
                                                    setData(
                                                        'product.image',
                                                        e.target.value,
                                                    )
                                                }
                                                className={cx(classes.input, {
                                                    'input-with-error':
                                                        errors['product.image'],
                                                })}
                                            />
                                        </FieldWrapper>
                                    </div>
                                ) : null}
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
                                                    variant="outline"
                                                    size="icon"
                                                    title="Add new variant option"
                                                    className={
                                                        classes.addPriceButton
                                                    }
                                                    aria-label="Add new variant option"
                                                    onClick={addVariant}
                                                >
                                                    <Plus
                                                        className={
                                                            classes.plusIcon
                                                        }
                                                    />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Add new variant option
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
                                        {data.product?.variants?.map(
                                            (
                                                variant: ProductVariant,
                                                index: number,
                                            ) => (
                                                <div key={variant.id || index}>
                                                    <div
                                                        className={
                                                            classes.inputSkuPrice
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                classes.priceFields
                                                            }
                                                        >
                                                            <div
                                                                className={
                                                                    classes.inputItem
                                                                }
                                                            >
                                                                <Label
                                                                    htmlFor="sku"
                                                                    className={
                                                                        classes.label
                                                                    }
                                                                >
                                                                    Sku
                                                                </Label>
                                                                <FieldWrapper
                                                                    error={
                                                                        (
                                                                            errors as any
                                                                        )[
                                                                            `product.variants.${index}.sku`
                                                                        ]
                                                                    }
                                                                >
                                                                    <Input
                                                                        id={`sku-${variant.id}`}
                                                                        type="text"
                                                                        value={
                                                                            variant.sku ||
                                                                            ''
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) => {
                                                                            clearErrors(
                                                                                `product.variants.${index}.sku` as any,
                                                                            );
                                                                            setData(
                                                                                `product.variants.${index}.sku` as any,
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            );
                                                                        }}
                                                                        className={cx(
                                                                            classes.skuInput,
                                                                            {
                                                                                'input-with-error':
                                                                                    (
                                                                                        errors as any
                                                                                    )[
                                                                                        `product.variants.${index}.sku`
                                                                                    ],
                                                                            },
                                                                        )}
                                                                    />
                                                                </FieldWrapper>
                                                            </div>

                                                            <DeleteVariantForm
                                                                variantId={
                                                                    variant.id
                                                                }
                                                                removeVariant={
                                                                    removeVariant
                                                                }
                                                            />
                                                        </div>

                                                        <div
                                                            className={
                                                                classes.inputGroup
                                                            }
                                                        >
                                                            <div
                                                                className={
                                                                    classes.inputItem
                                                                }
                                                            >
                                                                <Label
                                                                    htmlFor={`price-${variant.id}`}
                                                                    className={
                                                                        classes.label
                                                                    }
                                                                >
                                                                    Price
                                                                </Label>
                                                                <FieldWrapper
                                                                    error={
                                                                        (
                                                                            errors as any
                                                                        )[
                                                                            `product.variants.${index}.price`
                                                                        ]
                                                                    }
                                                                >
                                                                    <Input
                                                                        id={`price-${variant.id}`}
                                                                        type="number"
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
                                                                        className={cx(
                                                                            classes.priceInput,
                                                                            {
                                                                                'input-with-error':
                                                                                    (
                                                                                        errors as any
                                                                                    )[
                                                                                        `product.variants.${index}.price`
                                                                                    ],
                                                                            },
                                                                        )}
                                                                    />
                                                                </FieldWrapper>
                                                            </div>
                                                            <div>
                                                                <Label
                                                                    htmlFor={`price-${variant.id}-description`}
                                                                    className={
                                                                        classes.label
                                                                    }
                                                                >
                                                                    Select Label
                                                                </Label>
                                                                <FieldWrapper
                                                                    error={
                                                                        (
                                                                            errors as any
                                                                        )[
                                                                            `product.variants.${index}.description`
                                                                        ]
                                                                    }
                                                                >
                                                                    <Input
                                                                        id={`price-${variant.id}-description`}
                                                                        type="text"
                                                                        value={
                                                                            variant.description ||
                                                                            ''
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) => {
                                                                            clearErrors(
                                                                                `product.variants.${index}.description` as any,
                                                                            );
                                                                            setData(
                                                                                `product.variants.${index}.description` as any,
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            );
                                                                        }}
                                                                        className={cx(
                                                                            classes.descriptionInput,
                                                                            {
                                                                                'input-with-error':
                                                                                    (
                                                                                        errors as any
                                                                                    )[
                                                                                        `product.variants.${index}.description`
                                                                                    ],
                                                                            },
                                                                        )}
                                                                    />
                                                                </FieldWrapper>
                                                            </div>
                                                            <div>
                                                                <Label
                                                                    htmlFor={`price-${variant.id}-title`}
                                                                    className={
                                                                        classes.label
                                                                    }
                                                                >
                                                                    Price Label
                                                                </Label>
                                                                <FieldWrapper
                                                                    error={
                                                                        (
                                                                            errors as any
                                                                        )[
                                                                            `product.variants.${index}.title`
                                                                        ]
                                                                    }
                                                                >
                                                                    <Input
                                                                        id={`price-${variant.id}-title`}
                                                                        type="text"
                                                                        value={
                                                                            variant.title ||
                                                                            ''
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) => {
                                                                            clearErrors(
                                                                                `product.variants.${index}.title` as any,
                                                                            );
                                                                            setData(
                                                                                `product.variants.${index}.title` as any,
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            );
                                                                        }}
                                                                        className={cx(
                                                                            classes.titleInput,
                                                                            {
                                                                                'input-with-error':
                                                                                    (
                                                                                        errors as any
                                                                                    )[
                                                                                        `product.variants.${index}.title`
                                                                                    ],
                                                                            },
                                                                        )}
                                                                    />
                                                                </FieldWrapper>
                                                            </div>
                                                        </div>
                                                        {variant.image ? (
                                                            <div
                                                                className={`${classes.mediaItem}`}
                                                            >
                                                                <div
                                                                    className={`${classes.mediaCard}`}
                                                                >
                                                                    <Label
                                                                        htmlFor={`price-${variant.id}-image`}
                                                                        className={
                                                                            classes.label
                                                                        }
                                                                    >
                                                                        Image
                                                                    </Label>
                                                                    <div
                                                                        className={
                                                                            classes.imageContainer
                                                                        }
                                                                    >
                                                                        <figure
                                                                            className={`${classes.mediaFigure} ${classes.priceImage}`}
                                                                        >
                                                                            <img
                                                                                src={
                                                                                    `/products/` +
                                                                                    variant.image
                                                                                }
                                                                                alt={
                                                                                    variant?.title ||
                                                                                    ''
                                                                                }
                                                                            />
                                                                        </figure>
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
                                                                            <Tooltip>
                                                                                <TooltipTrigger
                                                                                    asChild
                                                                                >
                                                                                    <Button
                                                                                        type="button"
                                                                                        variant="outline"
                                                                                        size="icon"
                                                                                        className={
                                                                                            classes.editButton
                                                                                        }
                                                                                        aria-label="Select or change image"
                                                                                    >
                                                                                        <Pencil
                                                                                            className={
                                                                                                classes.pencilIcon
                                                                                            }
                                                                                        />
                                                                                    </Button>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                    Select
                                                                                    or
                                                                                    change
                                                                                    image
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </MediaSelectionModal>
                                                                    </div>
                                                                </div>
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
                                                                    data.product
                                                                        .id
                                                                }
                                                                mediaType="product"
                                                            >
                                                                <div
                                                                    className={
                                                                        classes.addImagePlaceholderSmall
                                                                    }
                                                                >
                                                                    <p>
                                                                        Add
                                                                        image
                                                                    </p>
                                                                </div>
                                                            </MediaSelectionModal>
                                                        )}
                                                        <div
                                                            className={`${classes.mediaItem}`}
                                                        >
                                                            <div
                                                                className={`${classes.mediaCard}`}
                                                            >
                                                                <Label
                                                                    htmlFor={`price-${variant.id}-file`}
                                                                    className={
                                                                        classes.label
                                                                    }
                                                                >
                                                                    Image
                                                                </Label>
                                                                <Input
                                                                    id={`price-${variant.id}-file`}
                                                                    type="text"
                                                                    value={
                                                                        variant
                                                                            .image
                                                                            ?.file_name ||
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setData(
                                                                            `product.variants.${index}.image` as any,
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className={
                                                                        classes.fileInput
                                                                    }
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Add other price fields here */}
                                                        <div
                                                            className={
                                                                classes.inputGroup
                                                            }
                                                        >
                                                            {variant.extended_properties &&
                                                                Object.entries(
                                                                    variant.extended_properties,
                                                                ).map(
                                                                    (
                                                                        [
                                                                            key,
                                                                            value,
                                                                        ],
                                                                        propIndex,
                                                                    ) => (
                                                                        <React.Fragment
                                                                            key={String(
                                                                                key,
                                                                            )}
                                                                        >
                                                                            {!excludeKeys.includes(
                                                                                key,
                                                                            ) && (
                                                                                <div
                                                                                    className={
                                                                                        classes.inputItem
                                                                                    }
                                                                                >
                                                                                    <Label
                                                                                        htmlFor={`price-${variant.id}-prop-${key}`}
                                                                                        className={
                                                                                            classes.label
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            key
                                                                                        }
                                                                                    </Label>
                                                                                    <FieldWrapper
                                                                                        error={
                                                                                            (
                                                                                                errors as any
                                                                                            )[
                                                                                                `product.variants.${index}.extended_properties.${propIndex}.value`
                                                                                            ]
                                                                                        }
                                                                                    >
                                                                                        <Input
                                                                                            id={`price-${variant.id}-prop-${key}`}
                                                                                            type="text"
                                                                                            value={String(
                                                                                                value ||
                                                                                                    '',
                                                                                            )}
                                                                                            onChange={(
                                                                                                e,
                                                                                            ) => {
                                                                                                clearErrors(
                                                                                                    `product.variants.${index}.extended_properties.${key}` as any,
                                                                                                );
                                                                                                setData(
                                                                                                    `product.variants.${index}.extended_properties.${key}` as any,
                                                                                                    e
                                                                                                        .target
                                                                                                        .value,
                                                                                                );
                                                                                            }}
                                                                                            className={cx(
                                                                                                classes.extendedPropInput,
                                                                                                {
                                                                                                    'input-with-error':
                                                                                                        (
                                                                                                            errors as any
                                                                                                        )[
                                                                                                            `product.variants.${index}.extended_properties.${propIndex}.value`
                                                                                                        ],
                                                                                                },
                                                                                            )}
                                                                                        />
                                                                                    </FieldWrapper>
                                                                                </div>
                                                                            )}
                                                                        </React.Fragment>
                                                                    ),
                                                                )}
                                                        </div>
                                                    </div>
                                                    <Separator
                                                        className={
                                                            classes.separator
                                                        }
                                                    />
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
