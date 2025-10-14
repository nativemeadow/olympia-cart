import { Product, Price } from '@/types/model-types';

import classes from './Card.module.css';

type Props = {
    results: Product;
};

const ProductCard = ({ results }: Props) => {
    const categorySlug = results.categories && results.categories.length > 0 ? results.categories[0].slug : 'uncategorized';

    return (
        <div className={classes['card-container']}>
            <div className={classes.card}>
                <a href={`/categories/products/${categorySlug}/${results.slug}`}>
                    <img width={200} height={200} src={`/products/${results.image}`} alt={'test'} className={classes['product-image']} />
                </a>
            </div>
            <p className={classes.title}>{results.title}</p>
            <p className={classes.price}>{`Starting from ${results.prices?.[0]?.price ?? ''}`}</p>
        </div>
    );
};

export default ProductCard;
