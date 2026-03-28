import { Head, Link, router } from '@inertiajs/react';
import { Page } from '@inertiajs/core';
import React, {
    FormEventHandler,
    PropsWithChildren,
    useEffect,
    useState,
} from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import cx from 'clsx';
import { Product, Price, ExtendedProps, Attributes } from '@/types/model-types';
import { useForm } from '@inertiajs/react';
import classes from './product-form.module.css';
import EditorComponent from '@/components/text-editor';
import { Media } from '@/types/model-types';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import MediaSelectionModal from '@/pages/dashboard/media/media-selection-modal';
import { generateSlug } from '@/utils/strings';
import '@/../css/errors.css';
import { DeletePriceForm } from './delete-price';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { ImSpinner } from 'react-icons/im';
import AlertDialogComponent from '@/components/AlertDialog';
import { Category } from '@/types/model-types';
import { CategoryHierarchy } from '@/types';
import CategoryManagement from './CategoryManagement';
import {
    CategoryExpandedProvider,
    useCategoryExpanded,
} from '@/context/CategoryExpandedContext';

const initialProduct = (): Product => ({
    id: 0,
    uuid: '',
    title: '',
    sku: '',
    slug: '',
    description: '',
    image: '',
    status: true,
    categories: [],
    prices: [],
    media: [],
    created_at: '',
    updated_at: '',
});

const excludeKeys = ['Title', 'Description', 'Image'];

const initialPrice = (attributes?: Attributes[]): Price => {
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

const PrepareProductData = (
    product: Product,
    attributes?: Attributes[],
): Product => {
    const processedPrices = product.prices?.map((price) => {
        const initial = initialPrice(attributes);
        const newPrice: Price = {
            ...initial,
            ...price,
            extended_properties: {
                ...initial.extended_properties,
                ...price.extended_properties,
            },
        };

        newPrice.extended_properties = { ...newPrice.extended_properties };

        price.attribute_values?.forEach((attrValue) => {
            if (attrValue.attribute) {
                const attrName = attrValue.attribute.name;
                if (attrName === 'Title') {
                    newPrice.title = attrValue.value;
                } else if (attrName === 'Description') {
                    newPrice.description = attrValue.value;
                } else if (attrName === 'Image') {
                    // This assumes the value is a path that can be resolved to a media object
                    // This part might need more complex logic if you need to fetch the full Media object
                } else if (
                    newPrice.extended_properties &&
                    !excludeKeys.includes(attrName)
                ) {
                    newPrice.extended_properties[attrName] = attrValue.value;
                }
            }
        });
        return newPrice;
    });

    return {
        ...product,
        prices: processedPrices,
    };
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
        <div className="error-container">
            {children}
            {error && <div className="input-error-bubble">{error}</div>}
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
}: {
    product?: Product;
    categoryId?: number;
    attributes?: Attributes[];
    isEdit?: boolean;
    onSuccess: () => void;
    allCategories: CategoryHierarchy[];
}) => {
    const [priceStrings, setPriceStrings] = useState<{ [key: string]: string }>(
        {},
    );
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(isEdit);
    const [isSaving, setIsSaving] = useState(false);
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [errorDialogMessage, setErrorDialogMessage] = useState('');

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<ProductFormData>();

    useEffect(() => {
        const initialData = product
            ? PrepareProductData(product, attributes)
            : {
                  ...initialProduct(),
                  prices: [initialPrice(attributes)],
              };
        setData('product', initialData);
    }, [product, attributes]);

    console.log('ProductForm data:', data);
    console.log('ProductForm attributes:', attributes);

    const handleImageSelect = (image: Media, priceId?: number) => {
        if (priceId !== undefined) {
            if (!data.product.prices) return;
            const updatedPrices = data.product.prices.map((price) => {
                if (price.id === priceId) {
                    return {
                        ...price,
                        image: image,
                    };
                }
                return price;
            });

            setData('product.prices', updatedPrices);
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
                onSuccess();
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

    const addPrice = () => {
        const newPrice = {
            ...initialPrice(attributes),
            id: Date.now(), // Temporary ID for React key
        };
        setData(
            'product.prices',
            data.product?.prices
                ? [...data.product.prices, newPrice]
                : [newPrice],
        );
    };

    const removePrice = (priceId: number) => {
        if (!data.product.prices) return;
        const updatedPrices = data.product.prices.filter(
            (price) => price.id !== priceId,
        );
        setData('product.prices', updatedPrices);
    };

    const updatePrice = (
        e: React.ChangeEvent<HTMLInputElement>,
        index: number,
    ) => {
        clearErrors(`product.prices.${index}.price` as any);
        const newPriceStrings = {
            ...priceStrings,
            [index]: e.target.value,
        };
        setPriceStrings(newPriceStrings);

        const valueInCents = Math.round(parseFloat(e.target.value) * 100);
        if (!isNaN(valueInCents)) {
            setData(`product.prices.${index}.price` as any, valueInCents);
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
                                                (mediaItem) => (
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
                                                            </figure>
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
                        {/* Add fields for prices and categories here */}
                        {data.product?.prices && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Prices</CardTitle>
                                    <CardDescription
                                        className={classes.cardDescription}
                                    >
                                        <span>
                                            Manage product prices and options.
                                        </span>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    title="Add new price option"
                                                    className={
                                                        classes.addPriceButton
                                                    }
                                                    aria-label="Add new price option"
                                                    onClick={addPrice}
                                                >
                                                    <Plus
                                                        className={
                                                            classes.plusIcon
                                                        }
                                                    />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Add new price option
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
                                        {data.product?.prices?.map(
                                            (price, index) => (
                                                <div key={index}>
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
                                                                            `product.prices.${index}.sku`
                                                                        ]
                                                                    }
                                                                >
                                                                    <Input
                                                                        id={`sku-${price.id}`}
                                                                        type="text"
                                                                        value={
                                                                            price.sku ||
                                                                            ''
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) => {
                                                                            clearErrors(
                                                                                `product.prices.${index}.sku` as any,
                                                                            );
                                                                            setData(
                                                                                `product.prices.${index}.sku` as any,
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
                                                                                        `product.prices.${index}.sku`
                                                                                    ],
                                                                            },
                                                                        )}
                                                                    />
                                                                </FieldWrapper>
                                                            </div>
                                                            <div
                                                                className={
                                                                    classes.inputItem
                                                                }
                                                            >
                                                                <Label
                                                                    htmlFor={`price-${price.id}`}
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
                                                                            `product.prices.${index}.price`
                                                                        ]
                                                                    }
                                                                >
                                                                    <Input
                                                                        id={`price-${price.id}`}
                                                                        type="number"
                                                                        value={
                                                                            priceStrings[
                                                                                index
                                                                            ] ??
                                                                            (
                                                                                price.price /
                                                                                100
                                                                            ).toFixed(
                                                                                2,
                                                                            )
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            updatePrice(
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
                                                                                        `product.prices.${index}.price`
                                                                                    ],
                                                                            },
                                                                        )}
                                                                    />
                                                                </FieldWrapper>
                                                            </div>

                                                            <DeletePriceForm
                                                                priceId={
                                                                    price.id
                                                                }
                                                                removePrice={
                                                                    removePrice
                                                                }
                                                            />
                                                        </div>

                                                        <div>
                                                            <Label
                                                                htmlFor={`price-${price.id}-title`}
                                                                className={
                                                                    classes.label
                                                                }
                                                            >
                                                                Title
                                                            </Label>
                                                            <FieldWrapper
                                                                error={
                                                                    (
                                                                        errors as any
                                                                    )[
                                                                        `product.prices.${index}.title`
                                                                    ]
                                                                }
                                                            >
                                                                <Input
                                                                    id={`price-${price.id}-title`}
                                                                    type="text"
                                                                    value={
                                                                        price.title ||
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        clearErrors(
                                                                            `product.prices.${index}.title` as any,
                                                                        );
                                                                        setData(
                                                                            `product.prices.${index}.title` as any,
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
                                                                                    `product.prices.${index}.title`
                                                                                ],
                                                                        },
                                                                    )}
                                                                />
                                                            </FieldWrapper>
                                                        </div>

                                                        <div>
                                                            <Label
                                                                htmlFor={`price-${price.id}-description`}
                                                                className={
                                                                    classes.label
                                                                }
                                                            >
                                                                Description
                                                            </Label>
                                                            <FieldWrapper
                                                                error={
                                                                    (
                                                                        errors as any
                                                                    )[
                                                                        `product.prices.${index}.description`
                                                                    ]
                                                                }
                                                            >
                                                                <Input
                                                                    id={`price-${price.id}-description`}
                                                                    type="text"
                                                                    value={
                                                                        price.description ||
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        clearErrors(
                                                                            `product.prices.${index}.description` as any,
                                                                        );
                                                                        setData(
                                                                            `product.prices.${index}.description` as any,
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
                                                                                    `product.prices.${index}.description`
                                                                                ],
                                                                        },
                                                                    )}
                                                                />
                                                            </FieldWrapper>
                                                        </div>

                                                        {price.image ? (
                                                            <div
                                                                className={`${classes.mediaItem}`}
                                                            >
                                                                <div
                                                                    className={`${classes.mediaCard}`}
                                                                >
                                                                    <Label
                                                                        htmlFor={`price-${price.id}-image`}
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
                                                                                    `/${price.image?.file_path}` +
                                                                                    price
                                                                                        .image
                                                                                        ?.file_name
                                                                                }
                                                                                alt={
                                                                                    price
                                                                                        .image
                                                                                        ?.alt_text ||
                                                                                    price
                                                                                        .image
                                                                                        ?.title
                                                                                }
                                                                            />
                                                                        </figure>
                                                                        <MediaSelectionModal
                                                                            onSelect={(
                                                                                image,
                                                                            ) =>
                                                                                handleImageSelect(
                                                                                    image,
                                                                                    price.id,
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
                                                                        price.id,
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
                                                                    htmlFor={`price-${price.id}-file`}
                                                                    className={
                                                                        classes.label
                                                                    }
                                                                >
                                                                    Image
                                                                </Label>
                                                                <Input
                                                                    id={`price-${price.id}-file`}
                                                                    type="text"
                                                                    value={
                                                                        price
                                                                            .image
                                                                            ?.file_name ||
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setData(
                                                                            `product.prices.${index}.image` as any,
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
                                                            {price.extended_properties &&
                                                                Object.entries(
                                                                    price.extended_properties,
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
                                                                                        htmlFor={`price-${price.id}-prop-${key}`}
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
                                                                                                `product.prices.${index}.extended_properties.${propIndex}.value`
                                                                                            ]
                                                                                        }
                                                                                    >
                                                                                        <Input
                                                                                            id={`price-${price.id}-prop-${key}`}
                                                                                            type="text"
                                                                                            value={String(
                                                                                                value ||
                                                                                                    '',
                                                                                            )}
                                                                                            onChange={(
                                                                                                e,
                                                                                            ) => {
                                                                                                clearErrors(
                                                                                                    `product.prices.${index}.extended_properties.${key}` as any,
                                                                                                );
                                                                                                setData(
                                                                                                    `product.prices.${index}.extended_properties.${key}` as any,
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
                                                                                                            `product.prices.${index}.extended_properties.${propIndex}.value`
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
