import React from 'react';
import { CustomerData } from '@/types/model-types';
import useCheckout from '@/zustand/checkoutStore';
import AddressDisplayCard from './address-display-card';
import classes from './address-display-card.module.css';

function StepTwo({ customer }: { customer: CustomerData }) {
    const { checkout } = useCheckout();

    console.log('StepTwo render - checkout:', checkout, 'customer:', customer);

    const { delivery_address, billing_address, billing_same_as_shipping } =
        checkout || {};

    return (
        <>
            <h1 className="mb-4 text-2xl font-bold">
                Step 2: Shipping & Delivery Options
            </h1>

            <div className={classes.address_grid}>
                {delivery_address && (
                    <AddressDisplayCard
                        title={
                            checkout?.delivery_address_id ===
                                checkout?.billing_address_id && billing_address
                                ? 'Delivery & Billing Address'
                                : 'Shipping Address'
                        }
                        address={delivery_address}
                    />
                )}
                {checkout?.delivery_address_id !==
                    checkout?.billing_address_id && billing_address ? (
                    <AddressDisplayCard
                        title="Billing Address"
                        address={billing_address}
                        isSameAsShipping={billing_same_as_shipping}
                    />
                ) : null}
            </div>
        </>
    );
}

export default StepTwo;
