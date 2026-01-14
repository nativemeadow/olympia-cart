import React, { useState } from 'react';
import RenderImage from '@/components/render-image';
import { Product } from '@/types/model-types';
import { Head, Link } from '@inertiajs/react';
import parse from 'html-react-parser';
import { parser } from '@/utils/html-parse';
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

    const filterPricing = () => {
        const filterPrices =
            product &&
            product.prices.filter((value, index, array) => {
                return (
                    index === array.findIndex((t) => t.price === value.price)
                );
            });

        return filterPrices?.map((price, key) => {
            return (
                <li
                    key={key}
                    id={`price-${price.id}`}
                    className={classes.options_item}
                >
                    <span>${Number(price.price / 100).toFixed(2)}</span>
                    &nbsp;/&nbsp;
                    {parser(String(price['unit'] || 'Each'))}
                </li>
            );
        });
    };

    return (
        <div className={classes.detail}>
            <Head title={product.title} />
            <div className={classes.detail_container}>
                <div className={classes.detail_image}>
                    <div>
                        <RenderImage
                            className={classes.main_image_container}
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
                    <ul className={classes.detail_pricing}>
                        {filterPricing()}
                    </ul>
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
        </div>
    );
};

export default ProductDetail;
