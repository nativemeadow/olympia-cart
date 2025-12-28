import { Product } from '@/types/model-types';
import { parser } from '@/utils/html-parse';
import { Link } from '@inertiajs/react';
import { ProductType } from '@/types';
import { PriceVariantType } from '@/types';

import classes from './product-card.module.css';

const DisplayPricing = (
    product: ProductType,
    pathNames: string,
    categorySlug: string | undefined,
) => {
    const filterPrices = ((product?.prices as PriceVariantType[]) ?? []).filter(
        (value, index, array) => {
            return index === array.findIndex((t) => t.price === value.price);
        },
    );

    return filterPrices?.map((price, key) => {
        return (
            <Link
                key={`link-${Math.random()}-${product.sku}`}
                href={`/${pathNames}/products/${categorySlug}/${product.slug}`}
            >
                <li key={key} id={`price-${key}`}>
                    <span className={classes['product-card-pricing-usd']}>
                        {Number(price.price / 100).toFixed(2)}
                    </span>
                    &nbsp;/
                    {parser(String(price.unit || ''))}
                </li>
            </Link>
        );
    });
};

export default DisplayPricing;
