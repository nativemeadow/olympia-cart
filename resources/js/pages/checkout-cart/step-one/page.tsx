import React from 'react';
import { User } from '@/types';
import { Address, CustomerData } from '@/types/model-types';
import CustomerInfoStep from './customer-info-step';

const StepOne = ({ customer }: { customer: CustomerData }) => {
    return <CustomerInfoStep customer={customer} />;
};

export default StepOne;
