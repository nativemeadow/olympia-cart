import React, { useState } from 'react';
import classes from './show.module.css';
import { useProductViewStore } from '@/zustand/productViewStore';
import { useShoppingCartStore } from '@/zustand/shoppingCartStore';
import NumberInputSpinner from '@/components/NumberInputSpinner';
import AddToCartDModal from '@/components/AddToCartModal';
import { router } from '@inertiajs/react';

type Props = {
    categorySlug: string;
};

const PriceList = ({ categorySlug }: Props) => {
    const { product, selectedPriceIndex, selectedPrice, setSelectedPrice, productQty, setProductQty } = useProductViewStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleAddToCart = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product || !selectedPrice) {
            return;
        }

        const newItem = {
            product_id: product.id,
            item_id: selectedPrice.id,
            sku: selectedPrice.sku || product.sku,
            title: selectedPrice.title || product.title,
            price: selectedPrice.price,
            quantity: productQty,
            unit: selectedPrice.unit,
            image: selectedPrice.image || product.image,
            product_slug: product.slug,
            category_slug: categorySlug || '',
        };

        router.post(route('cart.items.add'), newItem, {
            onSuccess: (page) => {
                const { props } = page;
                // @ts-expect-error - flash is not in the type
                const message = props.flash?.success || 'Item added to cart!';
                setSuccessMessage(message);
                setIsModalOpen(true);
            },
            onError: () => {
                setSuccessMessage('Failed to add item. Please try again.');
                setIsModalOpen(true);
            },
        });
    };
    return (
        <>
            {product && (
                <form name="addToCart" onSubmit={handleAddToCart} className={classes.price_list}>
                    <div className={classes['detail_selection']}>
                        {product.prices && product.prices.length > 1 && <h4>Please Select Product Options</h4>}
                        <div className={classes.price_option}>
                            {product.prices && product.prices.length > 1 && (
                                <>
                                    <label className={classes.detail_select_label} htmlFor="price-option">
                                        Select size
                                    </label>
                                    <select
                                        id="price-option"
                                        name="price-option"
                                        value={selectedPriceIndex ?? ''}
                                        onChange={(e) => {
                                            const selectedIndex = e.target.value;
                                            setSelectedPrice(selectedIndex === '' ? null : parseInt(selectedIndex, 10));
                                        }}
                                        className={`form-control ${classes['detail_pricing_select']} form-select`}
                                    >
                                        <option value="">Select Price</option>
                                        {product.prices.map((price, index) => (
                                            <option key={index} value={index}>
                                                {price.description}
                                            </option>
                                        ))}
                                    </select>
                                </>
                            )}
                            {selectedPrice ? (
                                <div className={classes.selected_price_details}>
                                    <p>
                                        {selectedPrice.title} -
                                        <span className={classes['detail_pricing_usd_selected']}>
                                            ${selectedPrice.price.toFixed(2)} {selectedPrice.currency}
                                        </span>
                                    </p>
                                </div>
                            ) : (
                                <div className={classes.selected_price_details}>
                                    <p>Please select a price option to see details</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={classes.detail_quantity_selection}>
                        <NumberInputSpinner
                            disabled={!selectedPrice?.unit || selectedPrice.unit.length <= 0}
                            value={productQty}
                            step={1}
                            onChange={(newValue) => setProductQty(newValue)}
                        />

                        <div className={classes['quantity_selection_units']}></div>
                        <div className={classes['quantity_selection_button']}>
                            <button className="button" type="submit" disabled={!selectedPrice?.unit || selectedPrice.unit.length <= 0}>
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </form>
            )}
            <AddToCartDModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onViewCart={() => router.visit('/shopping-cart')}>
                <p>{successMessage}</p>
            </AddToCartDModal>
        </>
    );
};

export default PriceList;
