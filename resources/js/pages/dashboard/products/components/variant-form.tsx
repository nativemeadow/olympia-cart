import React, { useState } from 'react';
import {
    ProductVariant,
    Media,
    Attributes,
    ExtendedProps,
} from '@/types/model-types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import cx from 'clsx';
import classes from '../product-form.module.css';
import { DeleteVariantForm } from '../delete-variant';
import MediaSelectionModal from '@/pages/dashboard/media/media-selection-modal';

const excludeKeys = ['Title', 'Description', 'Image'];

// This is a simplified FieldWrapper. You might want to move the original to a shared location.
const FieldWrapper: React.FC<{ children: React.ReactNode; error?: string }> = ({
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

type VariantFormProps = {
    variant: ProductVariant;
    index: number;
    setData: (key: string, value: any) => void;
    clearErrors: (...args: any[]) => void;
    errors: any; // Consider using a more specific type for Inertia errors
    removeVariant: (variantId: number) => void;
    handleImageSelect: (image: Media, variantId: number) => void;
    productId: number;
};

const VariantForm: React.FC<VariantFormProps> = ({
    variant,
    index,
    setData,
    clearErrors,
    errors,
    removeVariant,
    handleImageSelect,
    productId,
}) => {
    const [variantPriceString, setVariantPriceString] = useState<string>(
        (variant.price / 100).toFixed(2),
    );
    const [isModalOpen, setIsModalOpen] = useState(false);

    const updatePrice = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVariantPriceString(e.target.value);
        const valueInCents = Math.round(parseFloat(e.target.value) * 100);
        if (!isNaN(valueInCents)) {
            setData(`product.variants.${index}.price`, valueInCents);
        }
    };

    return (
        <div key={variant.id || index}>
            <div className={classes.inputSkuPrice}>
                <div className={classes.priceFields}>
                    <div className={classes.inputItem}>
                        <Label htmlFor="sku" className={classes.label}>
                            Sku
                        </Label>
                        <FieldWrapper
                            error={errors[`product.variants.${index}.sku`]}
                        >
                            <Input
                                id={`sku-${variant.id}`}
                                type="text"
                                value={variant.sku || ''}
                                onChange={(e) => {
                                    clearErrors(
                                        `product.variants.${index}.sku`,
                                    );
                                    setData(
                                        `product.variants.${index}.sku`,
                                        e.target.value,
                                    );
                                }}
                                className={cx(classes.skuInput, {
                                    'input-with-error':
                                        errors[`product.variants.${index}.sku`],
                                })}
                            />
                        </FieldWrapper>
                    </div>

                    <DeleteVariantForm
                        variantId={variant.id}
                        removeVariant={removeVariant}
                    />
                </div>

                <div className={classes.inputGroup}>
                    <div className={classes.inputItem}>
                        <Label
                            htmlFor={`price-${variant.id}`}
                            className={classes.label}
                        >
                            Price
                        </Label>
                        <FieldWrapper
                            error={errors[`product.variants.${index}.price`]}
                        >
                            <Input
                                id={`price-${variant.id}`}
                                type="number"
                                value={variantPriceString}
                                onChange={updatePrice}
                                className={cx(classes.priceInput, {
                                    'input-with-error':
                                        errors[
                                            `product.variants.${index}.price`
                                        ],
                                })}
                            />
                        </FieldWrapper>
                    </div>
                    <div>
                        <Label
                            htmlFor={`price-${variant.id}-description`}
                            className={classes.label}
                        >
                            Select Label
                        </Label>
                        <FieldWrapper
                            error={
                                errors[`product.variants.${index}.description`]
                            }
                        >
                            <Input
                                id={`price-${variant.id}-description`}
                                type="text"
                                value={variant.description || ''}
                                onChange={(e) => {
                                    clearErrors(
                                        `product.variants.${index}.description`,
                                    );
                                    setData(
                                        `product.variants.${index}.description`,
                                        e.target.value,
                                    );
                                }}
                                className={cx(classes.descriptionInput, {
                                    'input-with-error':
                                        errors[
                                            `product.variants.${index}.description`
                                        ],
                                })}
                            />
                        </FieldWrapper>
                    </div>
                    <div>
                        <Label
                            htmlFor={`price-${variant.id}-title`}
                            className={classes.label}
                        >
                            Price Label
                        </Label>
                        <FieldWrapper
                            error={errors[`product.variants.${index}.title`]}
                        >
                            <Input
                                id={`price-${variant.id}-title`}
                                type="text"
                                value={variant.title || ''}
                                onChange={(e) => {
                                    clearErrors(
                                        `product.variants.${index}.title`,
                                    );
                                    setData(
                                        `product.variants.${index}.title`,
                                        e.target.value,
                                    );
                                }}
                                className={cx(classes.titleInput, {
                                    'input-with-error':
                                        errors[
                                            `product.variants.${index}.title`
                                        ],
                                })}
                            />
                        </FieldWrapper>
                    </div>
                </div>
                {variant.media && variant.media.length > 0 ? (
                    variant.media.map((mediaItem, mediaIndex) => {
                        return (
                            <React.Fragment key={mediaItem.id}>
                                <div
                                    className={`${classes.mediaItem} ${classes.variantMediaItem} `}
                                >
                                    <div className={`${classes.mediaCard}`}>
                                        <Label
                                            htmlFor={`price-${variant.id}-image-${mediaItem.id}`}
                                            className={classes.label}
                                        >
                                            Image
                                        </Label>
                                        <div className={classes.imageContainer}>
                                            <figure
                                                className={`${classes.mediaFigure} ${classes.priceImage}`}
                                            >
                                                <img
                                                    src={`/${mediaItem.file_path}/${mediaItem.file_name}`}
                                                    alt={variant?.title || ''}
                                                />
                                            </figure>
                                            <MediaSelectionModal
                                                onSelect={(image) =>
                                                    handleImageSelect(
                                                        image,
                                                        variant.id,
                                                    )
                                                }
                                                entityId={productId}
                                                mediaType="product"
                                                isOpen={isModalOpen}
                                                onOpenChange={setIsModalOpen}
                                            >
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
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
                                                        Select or change image
                                                    </TooltipContent>
                                                </Tooltip>
                                            </MediaSelectionModal>
                                        </div>
                                    </div>
                                </div>
                                <div className={`${classes.mediaItem}`}>
                                    <div className={`${classes.mediaCard}`}>
                                        <Label
                                            htmlFor={`price-${variant.id}-file`}
                                            className={classes.label}
                                        >
                                            Image
                                        </Label>
                                        <Input
                                            id={`price-${variant.id}-file`}
                                            type="text"
                                            disabled
                                            value={
                                                variant.media?.[0]?.file_name ||
                                                ''
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    `product.variants.${index}.media.0.file_name`,
                                                    e.target.value,
                                                )
                                            }
                                            className={classes.fileInput}
                                        />
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })[0] /**  this is the primary image for the variant */
                ) : (
                    <MediaSelectionModal
                        onSelect={(image) =>
                            handleImageSelect(image, variant.id)
                        }
                        entityId={productId}
                        mediaType="product"
                        isOpen={isModalOpen}
                        onOpenChange={setIsModalOpen}
                    >
                        <div className={classes.addImagePlaceholderSmall}>
                            <p>Add image</p>
                        </div>
                    </MediaSelectionModal>
                )}

                <div className={classes.inputGroup}>
                    {variant.extended_properties &&
                        Object.entries(variant.extended_properties)
                            .filter(([key]) => !excludeKeys.includes(key))
                            .map(([key, value]) => (
                                <React.Fragment key={String(key)}>
                                    <div className={classes.inputItem}>
                                        <Label
                                            htmlFor={`price-${variant.id}-prop-${key}`}
                                            className={classes.label}
                                        >
                                            {key}
                                        </Label>
                                        <FieldWrapper
                                            error={
                                                errors[
                                                    `product.variants.${index}.extended_properties.${key}`
                                                ]
                                            }
                                        >
                                            <Input
                                                id={`price-${variant.id}-prop-${key}`}
                                                type="text"
                                                value={String(value || '')}
                                                onChange={(e) => {
                                                    clearErrors(
                                                        `product.variants.${index}.extended_properties.${key}`,
                                                    );
                                                    setData(
                                                        `product.variants.${index}.extended_properties.${key}`,
                                                        e.target.value,
                                                    );
                                                }}
                                                className={cx(
                                                    classes.extendedPropInput,
                                                    {
                                                        'input-with-error':
                                                            errors[
                                                                `product.variants.${index}.extended_properties.${key}`
                                                            ],
                                                    },
                                                )}
                                            />
                                        </FieldWrapper>
                                    </div>
                                </React.Fragment>
                            ))}
                </div>
            </div>
            <Separator className={classes.separator} />
        </div>
    );
};

export default VariantForm;
