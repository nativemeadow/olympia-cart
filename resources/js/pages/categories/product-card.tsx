import { Product } from '@/types/model-types';
import { parser } from '@/utils/html-parse';
import { Link } from '@inertiajs/react';
import filterPricing from './product-pricing';
import { ProductType } from '@/types';

import classes from './product-card.module.css';

const categoryPath = 'categories';

type Props = {
    product: ProductType;
    categorySlug: string;
};

const ProductCard = (props: Props) => {
    const { product, categorySlug } = props;

    return (
        <div className={classes.card}>
            <div className={classes.card_container}>
                <div className={classes.card_image}>
                    <Link
                        href={`/${categoryPath}/products/${categorySlug}/${product.slug}`}
                    >
                        <img
                            src={`/products/${product.image}`}
                            alt={
                                product.title !== undefined ? product.title : ''
                            }
                        />
                    </Link>
                </div>
                <div className={classes.card_content}>
                    <h2 className={classes.card_title}>
                        <Link
                            href={`/${categoryPath}/products/${categorySlug}/${product.slug}`}
                        >
                            {parser(product.title.toUpperCase())}
                        </Link>
                    </h2>
                    <div className={classes.card_price_info}>
                        <ul className={classes.card_pricing}>
                            {filterPricing(product, categoryPath, categorySlug)}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
