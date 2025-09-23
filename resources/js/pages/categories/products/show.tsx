import React, { useState } from 'react';
import RenderImage from '@/components/render-image';
import { Product, Price } from '@/types/model-types';
import { Head, Link } from '@inertiajs/react';
import parse, { DOMNode, Element } from 'html-react-parser';
import type { PriceProps } from '@/types/model-types';
import PriceList from './price-list';
import classes from './show.module.css';
import { useProductViewStore } from '@/zustand/productViewStore';

type Props = {
    categorySlug: string;
    product: Product;
};

const productLabelMessage = 'Please Select Product Options';

const ProductDetail = ({ categorySlug, product }: Props) => {
    // const [pricingProps, setPricingProps] = useState(
    //     product.prices?.map((price) => ({
    //         // was selectList
    //         sku: price.sku,
    //         price: price.price,
    //         description: price.description || '',
    //         image: price.image ?? '',
    //         currency: price.currency,
    //         unit: price.unit,
    //         coverage: price.coverage,
    //         coverage_value: price.coverage_value,
    //         online_minimum: price.online_minimum,
    //     })) || [],
    // );
    // const [productUOM, setProductUOM] = useState(product && product.prices?.length === 1 ? product.prices[0].unit || '' : '');
    // const [productSizeMessage, setProductSizeMessage] = useState<string>(productLabelMessage);
    // const [productSku, setProductSku] = useState(product.sku || '');
    // const [productSkuMessage, setProductSkuMessage] = useState<string>(productLabelMessage);

    // const [productQty, setProductQty] = useState<number>(1);
    // const [productImage, setProductImage] = useState<string>(product.image ?? '');
    // const [selectedThumb, setSelectedThumb] = useState<string>();
    // const [productThumbs, setProductThumbs] = useState<Price[] | undefined>([]);

    const { setProduct } = useProductViewStore();

    React.useEffect(() => {
        setProduct(product);
    }, [product]);

    return (
        <>
            <Head title={product.title} />
            <div className={classes.detail_container}>
                <div className={classes.detail_image}>
                    <div className={classes.main_image_container}>
                        <RenderImage src={`/products/${product.image}`} alt={product.title} />
                    </div>
                </div>
                <div className={classes.detail}>
                    <h1 className={classes.title}>{parse(product.title)}</h1>
                    <div className={classes.product_pricing}>
                        {product.prices && product.prices.length > 0 ? (
                            // <ul>
                            //     {product.prices.map((price) => (
                            //         <li key={price.id} className={classes.price_item}>
                            //             {price.title && <strong>{price.title}: </strong>}
                            //             {price.price} {price.currency}
                            //             {price.unit && ` per ${price.unit}`}
                            //         </li>
                            //     ))}
                            // </ul>
                            <PriceList />
                        ) : (
                            <p>No pricing information available.</p>
                        )}
                    </div>
                    <div className={classes.back_link}>
                        <Link href={`/categories/${categorySlug}`}>Back to Category</Link>
                    </div>
                </div>
            </div>
            <div className={`${classes.detail_description} ${classes.detail_description_row}`}>
                <div className={classes.title}>
                    <h2 className={classes.info_title}>Product Information</h2>
                </div>
                <div className={classes.descr}>{parse(product.description || '')}</div>
            </div>
        </>
    );
};

export default ProductDetail;
