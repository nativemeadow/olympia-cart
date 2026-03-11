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
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import cx from 'clsx';
import { Product, Price, ExtendedProps, Attributes } from '@/types/model-types';
import { useForm } from '@inertiajs/react';
import { InputError } from '@/components/ui/input-error';
import classes from './product-form.module.css';
import EditorComponent from '@/components/text-editor';
import { Media } from '@/types/model-types';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import MediaSelectionModal from '@/pages/dashboard/media/media-selection-modal';

type PageProps<T = {}> = T & {
    auth: any;
    flash: any;
};

const initialProduct = (): Product => ({
    id: 0,
    title: '',
    uuid: '',
    description: '',
    sku: '',
    slug: '',
    status: false,
    created_at: '',
    updated_at: '',
    prices: [initialPrice()],
    categories: [],
    media: [],
});

const initialPrice = (attributes?: Attributes[]): Price => {
    const extended_properties = attributes?.reduce((acc, attr) => {
        acc[attr.name] = attr.data_type === 'decimal' ? 0 : '';
        return acc;
    }, {} as ExtendedProps);

    const product = {
        id: 0,
        product_id: 0,
        sku: '',
        price: 0,
        title: '',
        description: '',
        extended_properties: extended_properties || {},
        price_image: null as Media | null,
    };

    return product;
};

const excludeKeys = ['Image', 'Title', 'Description'];

const PrepareProductData = (
    product: Product,
    attributes?: Attributes[],
): Product => {
    product.prices?.forEach((price) => {
        attributes?.forEach((attr) => {
            if (
                price.extended_properties &&
                !price.extended_properties[attr.name]
            ) {
                price.extended_properties[attr.name] =
                    attr.data_type === 'decimal' ? 0 : '';
            }
        });
    });
    console.log('Prepared product data:', product);
    return product;
};

type ProductFormData = {
    product: Product;
};

const ProductForm = ({
    product,
    attributes,
    isEdit = false,
    onSuccess,
}: {
    product?: Product;
    attributes?: Attributes[];
    isEdit?: boolean;
    onSuccess: () => void;
}) => {
    const { data, setData, post, put, processing, errors, reset } =
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

    const [editingPriceImage, setEditingPriceImage] = useState<number | null>(
        null,
    );

    const handleImageSelect = (image: Media) => {
        if (editingPriceImage !== null) {
            if (!data.product.prices) return;
            const updatedPrices = data.product.prices.map((price) => {
                if (price.id === editingPriceImage) {
                    return {
                        ...price,
                        price_image: image,
                        extended_properties: {
                            ...price.extended_properties,
                            Image: String(image.id),
                        },
                    };
                }
                return price;
            });

            setData('product.prices', updatedPrices);
            setEditingPriceImage(null);
        } else {
            setData('product.media', [image]);
        }
    };

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

    if (!data.product) {
        return <div>Loading...</div>; // Or a spinner component
    }

    return (
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
                                <Input
                                    id="title"
                                    type="text"
                                    value={data.product.title}
                                    onChange={(e) =>
                                        setData('product.title', e.target.value)
                                    }
                                    className={classes.input}
                                />
                                <InputError
                                    message={errors['product.title'] || ''}
                                />
                            </div>
                            <div>
                                <Label htmlFor="sku" className={classes.label}>
                                    SKU
                                </Label>
                                <Input
                                    id="sku"
                                    type="text"
                                    value={data.product.sku}
                                    onChange={(e) =>
                                        setData('product.sku', e.target.value)
                                    }
                                    className={classes.input}
                                />
                                <InputError
                                    message={errors['product.sku'] || ''}
                                />
                            </div>
                            <div>
                                <Label htmlFor="slug" className={classes.label}>
                                    Slug
                                </Label>
                                <Input
                                    id="slug"
                                    type="text"
                                    value={data.product.slug}
                                    onChange={(e) =>
                                        setData('product.slug', e.target.value)
                                    }
                                    className={classes.input}
                                />
                                <InputError
                                    message={errors['product.slug'] || ''}
                                />
                            </div>
                            <div>
                                <Label
                                    htmlFor="description"
                                    className={classes.label}
                                >
                                    Description
                                </Label>
                                <EditorComponent
                                    id="description"
                                    initialValue={
                                        data.product.description || ''
                                    }
                                    handleEditorChange={(content: string) =>
                                        setData('product.description', content)
                                    }
                                />
                                <InputError
                                    message={
                                        errors['product.description'] || ''
                                    }
                                />
                            </div>
                            <div className={classes.imageContainer}>
                                <h2>Image</h2>
                                {data.product.media &&
                                data.product.media.length > 0 ? (
                                    <>
                                        {data.product.media.map((mediaItem) => (
                                            <div
                                                key={mediaItem.id}
                                                className={classes.mediaItem}
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
                                                            productId={
                                                                data.product.id
                                                            }
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
                                                        </MediaSelectionModal>
                                                    </figure>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <MediaSelectionModal
                                        onSelect={handleImageSelect}
                                        productId={data.product.id}
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
                                    <Input
                                        id="image"
                                        type="text"
                                        disabled
                                        value={data.product.image || ''}
                                        onChange={(e) =>
                                            setData(
                                                'product.image',
                                                e.target.value,
                                            )
                                        }
                                        className={classes.input}
                                    />
                                    <InputError
                                        message={errors['product.image'] || ''}
                                    />
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>
                </div>
                <div className={classes.right_column}>
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
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        title="Add new price option"
                                        className={classes.addPriceButton}
                                        aria-label="Add new price option"
                                        onClick={addPrice}
                                    >
                                        <Plus className={classes.plusIcon} />
                                    </Button>
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
                                            <div key={`price-${price.id}`}>
                                                <div key={price.id}>
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
                                                                <Input
                                                                    id={`sku-${price.id}`}
                                                                    type="text"
                                                                    value={
                                                                        price.sku ||
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setData(
                                                                            `product.prices.${index}.sku` as any,
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className={
                                                                        classes.skuInput
                                                                    }
                                                                />
                                                                <InputError
                                                                    message={
                                                                        (
                                                                            errors as any
                                                                        )[
                                                                            `product.prices.${index}.sku`
                                                                        ] || ''
                                                                    }
                                                                />
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
                                                                <Input
                                                                    id={`price-${price.id}`}
                                                                    type="number"
                                                                    value={Number(
                                                                        price.price /
                                                                            100,
                                                                    ).toFixed(
                                                                        2,
                                                                    )}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setData(
                                                                            `product.prices.${index}.price` as any,
                                                                            parseFloat(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                        )
                                                                    }
                                                                    className={
                                                                        classes.priceInput
                                                                    }
                                                                />
                                                                <InputError
                                                                    message={
                                                                        (
                                                                            errors as any
                                                                        )[
                                                                            `product.prices.${index}.price`
                                                                        ] || ''
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            title="Remove price option"
                                                            className={
                                                                classes.removePriceButton
                                                            }
                                                            aria-label="Remove price option"
                                                            onClick={() =>
                                                                removePrice(
                                                                    price.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2
                                                                className={
                                                                    classes.trashIcon
                                                                }
                                                            />
                                                        </Button>
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
                                                        <Input
                                                            id={`price-${price.id}-title`}
                                                            type="text"
                                                            value={
                                                                price.title ||
                                                                ''
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    `product.prices.${index}.title` as any,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className={
                                                                classes.titleInput
                                                            }
                                                        />
                                                        <InputError
                                                            message={
                                                                (errors as any)[
                                                                    `product.prices.${index}.title`
                                                                ] || ''
                                                            }
                                                        />
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
                                                        <Input
                                                            id={`price-${price.id}-description`}
                                                            type="text"
                                                            value={
                                                                price.description ||
                                                                ''
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    `product.prices.${index}.description` as any,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className={
                                                                classes.descriptionInput
                                                            }
                                                        />
                                                        <InputError
                                                            message={
                                                                (errors as any)[
                                                                    `product.prices.${index}.description`
                                                                ] || ''
                                                            }
                                                        />
                                                    </div>

                                                    {price.price_image ? (
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
                                                                                `/${price.price_image?.file_path}` +
                                                                                price
                                                                                    .price_image
                                                                                    ?.file_name
                                                                            }
                                                                            alt={
                                                                                price
                                                                                    .price_image
                                                                                    ?.alt_text ||
                                                                                price
                                                                                    .price_image
                                                                                    ?.title
                                                                            }
                                                                        />
                                                                    </figure>
                                                                    <MediaSelectionModal
                                                                        onSelect={
                                                                            handleImageSelect
                                                                        }
                                                                        productId={
                                                                            data
                                                                                .product
                                                                                .id
                                                                        }
                                                                    >
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="icon"
                                                                            className={
                                                                                classes.editButton
                                                                            }
                                                                            aria-label="Select or change image"
                                                                            onClick={() =>
                                                                                setEditingPriceImage(
                                                                                    price.id,
                                                                                )
                                                                            }
                                                                        >
                                                                            <Pencil
                                                                                className={
                                                                                    classes.pencilIcon
                                                                                }
                                                                            />
                                                                        </Button>
                                                                    </MediaSelectionModal>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <MediaSelectionModal
                                                            onSelect={
                                                                handleImageSelect
                                                            }
                                                            productId={
                                                                data.product.id
                                                            }
                                                        >
                                                            <div
                                                                className={
                                                                    classes.addImagePlaceholderSmall
                                                                }
                                                            >
                                                                <p>Add image</p>
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
                                                                    data.product
                                                                        .prices?.[
                                                                        index
                                                                    ]
                                                                        .price_image
                                                                        ?.file_name ||
                                                                    ''
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        `product.prices.${index}.price_image` as any,
                                                                        e.target
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
                                                                                <Input
                                                                                    id={`price-${price.id}-prop-${key}`}
                                                                                    type="text"
                                                                                    value={String(
                                                                                        value ||
                                                                                            '',
                                                                                    )}
                                                                                    onChange={(
                                                                                        e,
                                                                                    ) =>
                                                                                        setData(
                                                                                            `product.prices.${index}.extended_properties.${key}` as any,
                                                                                            e
                                                                                                .target
                                                                                                .value,
                                                                                        )
                                                                                    }
                                                                                    className={
                                                                                        classes.extendedPropInput
                                                                                    }
                                                                                />
                                                                                <InputError
                                                                                    message={
                                                                                        (
                                                                                            errors as any
                                                                                        )[
                                                                                            `product.prices.${index}.extended_properties.${propIndex}.value`
                                                                                        ] ||
                                                                                        ''
                                                                                    }
                                                                                />
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
    );
};

export default ProductForm;
