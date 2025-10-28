import React from 'react';
import { User } from '@/types';
import { Address } from '@/types/model-types';
import CustomerInfoStep from './customer-info-step';

type CustomerData = (User & { addresses: Address[] }) | null;
const StepOne = ({ customer }: { customer: CustomerData }) => {
    return <CustomerInfoStep customer={customer} />;
};

export default StepOne;
