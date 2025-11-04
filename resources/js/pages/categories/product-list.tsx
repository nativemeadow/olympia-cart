import React from 'react';
import { Product } from '@/types/model-types';
import ProductCard from './product-card';
import classes from './product-list.module.css';

type Props = {
    products: Product[];
    categorySlug: string;
};

const Products = ({ products, categorySlug }: Props) => {
    return (
        <div className={classes.products_grid}>
            {products.map((product) => (
                <div key={product.id} className={classes.card_width}>
                    <ProductCard
                        product={product}
                        categorySlug={categorySlug}
                    />
                </div>
            ))}
        </div>
    );
};

export default Products;
