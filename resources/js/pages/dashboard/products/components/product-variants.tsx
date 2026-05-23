import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Plus } from 'lucide-react';
import cx from 'clsx';
import { ProductVariant, Attributes, Media } from '@/types/model-types';
import classes from '../product-form.module.css';
import VariantForm from './variant-form';

type ProductVariantsProps = {
    variants: ProductVariant[];
    setData: (key: string, value: any) => void;
    errors: any;
    clearErrors: (...args: any[]) => void;
    addVariant: () => void;
    removeVariant: (variantId: number) => void;
    handleImageSelect: (image: Media, variantId: number) => void;
    productId: number;
};

const ProductVariants: React.FC<ProductVariantsProps> = ({
    variants,
    setData,
    errors,
    clearErrors,
    addVariant,
    removeVariant,
    handleImageSelect,
    productId,
}) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Variants</CardTitle>
                <CardDescription className={classes.cardDescription}>
                    <span>Manage product variants and options.</span>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                title="Add new variant option"
                                className={classes.addPriceButton}
                                aria-label="Add new variant option"
                                onClick={addVariant}
                            >
                                <Plus className={classes.plusIcon} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Add new variant option</TooltipContent>
                    </Tooltip>
                </CardDescription>
            </CardHeader>
            <CardContent
                className={cx(classes.card_content, classes.pricesCardContent)}
            >
                <>
                    {variants.map((variant, index) => (
                        <VariantForm
                            key={variant.id || index}
                            variant={variant}
                            index={index}
                            setData={setData}
                            clearErrors={clearErrors}
                            errors={errors}
                            removeVariant={removeVariant}
                            handleImageSelect={handleImageSelect}
                            productId={productId}
                        />
                    ))}
                </>
            </CardContent>
        </Card>
    );
};

export default ProductVariants;
