import React from 'react';
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
import { Product, Media } from '@/types/model-types';
import classes from '../product-form.module.css';
import EditorComponent from '@/components/text-editor';
import MediaSelectionModal from '@/pages/dashboard/media/media-selection-modal';
import { generateSlug } from '@/utils/strings';
import { FieldWrapper } from '../product-form';

type ProductDetailsProps = {
    product: Product;
    setData: (key: string, value: any) => void;
    errors: any;
    clearErrors: (...args: any[]) => void;
    isSlugManuallyEdited: boolean;
    setIsSlugManuallyEdited: (value: boolean) => void;
    handleImageSelect: (image: Media) => void;
    isMainImageModalOpen: boolean;
    setIsMainImageModalOpen: (value: boolean) => void;
};

const ProductDetails: React.FC<ProductDetailsProps> = ({
    product,
    setData,
    errors,
    clearErrors,
    isSlugManuallyEdited,
    setIsSlugManuallyEdited,
    handleImageSelect,
    isMainImageModalOpen,
    setIsMainImageModalOpen,
}) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>Manage Product details.</CardDescription>
            </CardHeader>
            <CardContent className={classes.card_content}>
                <div>
                    <Label htmlFor="title" className={classes.label}>
                        Title
                    </Label>
                    <FieldWrapper error={errors['product.title']}>
                        <Input
                            id="title"
                            type="text"
                            value={product.title}
                            onChange={(e) => {
                                clearErrors('product.title');
                                const newTitle = e.target.value;
                                setData('product.title', newTitle);
                                if (!isSlugManuallyEdited) {
                                    clearErrors('product.slug');
                                    setData(
                                        'product.slug',
                                        generateSlug(newTitle),
                                    );
                                }
                            }}
                            className={cx(classes.input, {
                                'input-with-error': errors['product.title'],
                            })}
                        />
                    </FieldWrapper>
                </div>
                <div>
                    <Label htmlFor="sku" className={classes.label}>
                        SKU
                    </Label>
                    <FieldWrapper error={errors['product.sku']}>
                        <Input
                            id="sku"
                            type="text"
                            value={product.sku}
                            onChange={(e) => {
                                clearErrors('product.sku');
                                setData('product.sku', e.target.value);
                            }}
                            className={cx(classes.input, {
                                'input-with-error': errors['product.sku'],
                            })}
                        />
                    </FieldWrapper>
                </div>
                <div>
                    <Label htmlFor="slug" className={classes.label}>
                        Slug
                    </Label>
                    <FieldWrapper error={errors['product.slug']}>
                        <Input
                            id="slug"
                            type="text"
                            value={product.slug}
                            onChange={(e) => {
                                clearErrors('product.slug');
                                setData('product.slug', e.target.value);
                                setIsSlugManuallyEdited(true);
                            }}
                            className={cx(classes.input, {
                                'input-with-error': errors['product.slug'],
                            })}
                        />
                    </FieldWrapper>
                </div>
                <div>
                    <Label htmlFor="status" className={classes.label}>
                        Status
                    </Label>
                    <FieldWrapper error={errors['product.status']}>
                        <RadioGroup
                            onValueChange={(value) => {
                                clearErrors('product.status');
                                setData('product.status', value === '1');
                            }}
                            value={product.status ? '1' : '0'}
                            className={cx(classes.radioGroup, {
                                'input-with-error': errors['product.status'],
                            })}
                        >
                            <div className={classes.radioItem}>
                                <RadioGroupItem value="1" id="status-active" />
                                <Label htmlFor="status-active">Active</Label>
                            </div>
                            <div className={classes.radioItem}>
                                <RadioGroupItem value="0" id="status-draft" />
                                <Label htmlFor="status-draft">Draft</Label>
                            </div>
                        </RadioGroup>
                    </FieldWrapper>
                </div>
                <div>
                    <Label htmlFor="description" className={classes.label}>
                        Description
                    </Label>
                    <FieldWrapper error={errors['product.description']}>
                        <EditorComponent
                            id="description"
                            initialValue={product.description || ''}
                            handleEditorChange={(content: string) => {
                                clearErrors('product.description');
                                setData('product.description', content);
                            }}
                        />
                    </FieldWrapper>
                </div>
                <Separator className="my-6" />
                <div className={classes.imageContainer}>
                    <h2>Image</h2>
                    {product.media && product.media.length > 0 ? (
                        <>
                            {product.media.map((mediaItem: Media) => (
                                <div
                                    key={mediaItem.id}
                                    className={classes.mediaItem}
                                >
                                    <div className={classes.mediaCard}>
                                        <figure className={classes.mediaFigure}>
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
                                                onSelect={handleImageSelect}
                                                entityId={product.id}
                                                mediaType="product"
                                                isOpen={isMainImageModalOpen}
                                                onOpenChange={
                                                    setIsMainImageModalOpen
                                                }
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className={
                                                        classes.changeImageButton
                                                    }
                                                >
                                                    Change Image
                                                </Button>
                                            </MediaSelectionModal>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <MediaSelectionModal
                            onSelect={(image) => handleImageSelect(image)}
                            entityId={product.id}
                            mediaType="product"
                            isOpen={isMainImageModalOpen}
                            onOpenChange={setIsMainImageModalOpen}
                        >
                            <div className={classes.addImagePlaceholder}>
                                <p>Add image</p>
                            </div>
                        </MediaSelectionModal>
                    )}
                </div>

                {product.media ? (
                    <div>
                        <Label htmlFor="image" className={classes.label}>
                            Image File
                        </Label>
                        <FieldWrapper error={errors['product.image']}>
                            <Input
                                id="image"
                                name="image"
                                type="text"
                                disabled
                                value={product.image || ''}
                                onChange={(e) =>
                                    setData('product.image', e.target.value)
                                }
                                className={cx(classes.input, {
                                    'input-with-error': errors['product.image'],
                                })}
                            />
                        </FieldWrapper>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
};

export default ProductDetails;
