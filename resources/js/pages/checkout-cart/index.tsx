import { useEffect } from 'react';
import Checkout from './checkout';

const CheckoutPage = () => {
    useEffect(() => {
        const main = document.querySelector('main');
        if (main) {
            main.classList.add('full-width');
            return () => {
                main.classList.remove('full-width');
            };
        }
    }, []);

    return <Checkout />;
};

export default CheckoutPage;
