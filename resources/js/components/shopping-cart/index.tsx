import React, { useCallback } from 'react';
import { ImCross } from 'react-icons/im';
import { Link, router } from '@inertiajs/react';
import { CartItem as CartItemType } from '@/types/model-types';
import InputNumberSpinner from '../NumberInputSpinner';
import { formatCurrency } from '@/lib/utils';
import parse from 'html-react-parser';

import classes from './cart.module.css';

const categoryPath = 'categories';
const productPath = 'products';

type Props = {
    item: CartItemType;
};

const CartItem = ({ item }: Props) => {
    const productLink = `/${categoryPath}/${productPath}/${item.category_slug || ''}/${item.product_slug || ''}`;

    const updateQuantity = useCallback(
        (newQuantity: number) => {
            router.patch(
                route('cart.items.update', { cartItem: item.id }),
                { quantity: newQuantity },
                { preserveScroll: true, only: ['cart', 'flash'] },
            );
        },
        [item.id],
    );

    const handleDelete = useCallback(() => {
        if (!item.id) return;
        router.delete(route('cart.items.destroy', { cartItem: item.id }), {
            preserveScroll: true,
            only: ['cart', 'flash'],
        });
    }, [item.id]);

    return (
        <div key={item.id || `temp-${item.sku}-${item.unit}`} className={`${classes['order-summary']}`}>
            <div className={classes.store_cart_thumbnail_wrapper}>
                <div className={classes.row}>
                    {/* Image cell */}
                    <div className={`${classes.image_cell} ${classes.image_wrapper}`}>
                        <Link className={classes.store_cart_thumbnail_link} href={productLink}>
                            <img className={classes.image} src={`/products/${item.image}`} alt={item.title} />
                        </Link>
                    </div>
                    {/* Title and quantity cell */}
                    <div className={`${classes.title_cell} ${classes.store_cart_description}`}>
                        <div className={classes.title_text}>{parse(item.title || '')}</div>

                        <InputNumberSpinner
                            disabled={false}
                            value={item.quantity}
                            step={1}
                            onChange={(newValue) => {
                                updateQuantity(newValue);
                            }}
                        />
                    </div>
                    {/* Price and subtotal cell */}
                    <div className={`${classes.cost_cell} ${classes.item_cost} `}>
                        <div className={classes.item_cost_detail}>
                            <div>{formatCurrency(item.price)}</div>
                            <span>/</span>
                            <div>{item.unit}</div>
                        </div>
                        <div className={classes.item_subtotal}>
                            Subtotal: $<span className={classes.currency}>{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                    </div>
                    {/* Delete button cell */}
                    <div className={`${classes.delete_cell} `} onClick={handleDelete}>
                        <ImCross />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartItem;
