import React from 'react';
import { Product } from '@/types/model-types';
import ProductCard from './product-card';
import classes from './product-list.module.css';
import { ProductType } from '@/types';

type Props = {
    products: ProductType[];
    categorySlug: string;
};

const Products = ({ products, categorySlug }: Props) => {
    console.log('Rendering Products component with products:', products);

    return (
        <div className={classes.products_grid}>
            {products.map((product) => (
                <React.Fragment key={product.id}>
                    <ProductCard
                        product={product}
                        categorySlug={categorySlug}
                    />
                </React.Fragment>
            ))}
        </div>
    );
};

export default Products;
