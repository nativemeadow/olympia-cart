import { Product } from '@/types/model-types';
import { parser } from '@/utils/html-parse';
import { Link } from '@inertiajs/react';
import filterPricing from './product-pricing';
import { ProductType } from '@/types';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import classes from './product-card.module.css';

const productImageFolder =
    import.meta.env.VITE_PRODUCT_IMAGE_FOLDER ?? 'products';
const categoryPath = 'categories';

type Props = {
    product: ProductType;
    categorySlug: string;
};

const ProductCard = (props: Props) => {
    const { product, categorySlug } = props;

    return (
        <Card className={classes.card}>
            <CardContent>
                <div className={classes.card_image_container}>
                    <Link
                        href={`/${categoryPath}/products/${categorySlug}/${product.slug}`}
                    >
                        <img
                            className={classes.card_image}
                            src={`/${productImageFolder}/${product.image}`}
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
            </CardContent>
        </Card>
    );
};

export default ProductCard;
