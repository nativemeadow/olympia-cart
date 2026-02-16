import classes from './show.module.css';
import { useProductViewStore } from '@/zustand/productViewStore';

const productImageFolder = import.meta.env.PRODUCT_IMAGE_FOLDER ?? 'products';

const ThumbImages = () => {
    const { product, selectedPrice, setSelectedPrice } = useProductViewStore();

    const handleThumbClick = (event: React.MouseEvent<HTMLImageElement>) => {
        const indexStr = event.currentTarget.id.replace('thumb-', '');
        const index = parseInt(indexStr, 10);

        if (!isNaN(index) && product?.prices?.[index]) {
            setSelectedPrice(index);
        }
    };

    return (
        <div className={classes['detail_variations_grid']}>
            {product &&
                product.prices &&
                product.prices.length > 1 &&
                product.prices.map((price, index) =>
                    price.image ? (
                        <img
                            id={`thumb-${index}`}
                            key={index}
                            width={100}
                            height={70}
                            src={`/${productImageFolder}/${price.image ? (Array.isArray(price.image) ? price.image[0] : price.image) : product.image}`}
                            alt={
                                String(price.description) ||
                                `Thumbnail ${price.title}`
                            }
                            className={`${classes['detail_variations_image']} ${selectedPrice === price ? classes['detail_variations_image_selected'] : ''}`}
                            onClick={handleThumbClick}
                        />
                    ) : null,
                )}
        </div>
    );
};

export default ThumbImages;
