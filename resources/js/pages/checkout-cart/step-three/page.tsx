import React from 'react';
import { User } from '@/types';
import { Address, CustomerData } from '@/types/model-types';
import { Checkout } from '@/types';
import useCheckout from '@/zustand/checkoutStore';
import { useShoppingCartStore } from '@/zustand/shoppingCartStore';

const StepThree = ({ customer }: { customer: CustomerData }) => {
    return <div>Step Three </div>;
};

export default StepThree;
