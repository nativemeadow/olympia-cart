import React, { useEffect } from 'react';
import Checkout from './checkout';

const CheckoutPage = () => {
    useEffect(() => {
        const main = document.querySelector('main');
        if (main) {
            main.classList.add('category-list');
            return () => {
                main.classList.remove('category-list');
            };
        }
    }, []);

    return <Checkout />;
};

export default CheckoutPage;
