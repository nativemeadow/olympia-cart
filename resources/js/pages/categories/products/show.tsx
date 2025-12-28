import React, { useState } from 'react';
import RenderImage from '@/components/render-image';
import { Product } from '@/types/model-types';
import { Head, Link } from '@inertiajs/react';
import parse from 'html-react-parser';
import PriceList from './price-list';
import ThumbImages from './thumb-images';
import { ProductType } from '@/types';

import { useProductViewStore } from '@/zustand/productViewStore';

import classes from './show.module.css';

type Props = {
    productData: {
        data: ProductType;
    };
    categorySlug: string;
};

const productLabelMessage = 'Please Select Product Options';

const ProductDetail = ({ categorySlug, productData }: Props) => {
    const product: ProductType = productData.data;
    const { setProduct, productImage, hasMultipleImages } =
        useProductViewStore();

    React.useEffect(() => {
        setProduct(categorySlug, product);

        return () => {
            setProduct(null, null);
        };
    }, [product, setProduct]);

    return (
        <>
            <Head title={product.title} />
            <div className={classes.detail_container}>
                <div className={classes.detail_image}>
                    <div className={classes.main_image_container}>
                        <RenderImage
                            src={`/products/${productImage}`}
                            alt={product.title}
                        />
                    </div>
                    <div className={classes.attribute_label}>
                        {hasMultipleImages && <span>Select Size</span>}
                    </div>
                    {product.prices && product.prices.length > 1 && (
                        <ThumbImages />
                    )}
                </div>

                <div className={classes.detail}>
                    <h1 className={classes.title}>{parse(product.title)}</h1>
                    <div className={classes.product_pricing}>
                        {product.prices && product.prices.length > 0 ? (
                            <PriceList categorySlug={categorySlug} />
                        ) : (
                            <p>No pricing information available.</p>
                        )}
                    </div>
                    <div className={classes.back_link}>
                        <Link href={`/categories/${categorySlug}`}>
                            Back to Category
                        </Link>
                    </div>
                </div>
            </div>
            <div
                className={`${classes.detail_description} ${classes.detail_description_row}`}
            >
                <div className={classes.title}>
                    <h2 className={classes.info_title}>Product Information</h2>
                </div>
                <div className={classes.descr}>
                    {parse(product.description || '')}
                </div>
            </div>
        </>
    );
};

export default ProductDetail;
