import React, { useCallback, useEffect, useState } from 'react';
import classes from './show.module.css';
import { useProductViewStore } from '@/zustand/productViewStore';
import NumberInputSpinner from '@/components/NumberInputSpinner';

const PriceList = () => {
    const { product, selectedPriceIndex, selectedPrice, setSelectedPrice, setProductQty, productQty } = useProductViewStore();
    const [selectDetails, setSelectDetails] = useState(<></>);

    const handleUpdateQty = useCallback(
        (value: number) => {
            setProductQty(value);
        },
        [setProductQty],
    );

    useEffect(() => {
        let selection = <></>;
        selection = (
            <div className={classes.detail_quantity_selection}>
                <NumberInputSpinner
                    disabled={!selectedPrice?.unit || selectedPrice.unit.length <= 0}
                    value={productQty}
                    step={1}
                    onChange={(newValue) => handleUpdateQty(newValue)}
                />

                <div className={classes['quantity_selection_units']}></div>
                <div className={classes['quantity_selection_button']}>
                    <button className="button" type="submit" disabled={!selectedPrice?.unit || selectedPrice.unit.length <= 0}>
                        Add to Cart
                    </button>
                </div>
            </div>
        );
        setSelectDetails(selection);
    }, [selectedPrice?.unit, productQty, selectedPrice?.image, setProductQty, handleUpdateQty]);

    return (
        <>
            {product && (
                <form name="addToCart" onSubmit={(e) => e.preventDefault()} className={classes.price_list}>
                    <div className={classes['detail_selection']}>
                        <h4>Please Select Product Options</h4>
                        <div className={classes.price_option}>
                            {product.prices && product.prices.length! > 1 && (
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
                            {selectedPrice && (
                                <div className={classes.selected_price_details}>
                                    <p>
                                        {selectedPrice.title} -
                                        <span className={classes['detail_pricing_usd_selected']}>
                                            ${selectedPrice.price.toFixed(2)} {selectedPrice.currency}
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    {selectDetails}
                </form>
            )}
        </>
    );
};

export default PriceList;
