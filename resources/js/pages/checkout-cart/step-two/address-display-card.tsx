import React from 'react';
import { Address } from '@/types/model-types';
import { Badge } from '@/components/ui/badge';

import classes from './address-display-card.module.css';

interface AddressDisplayCardProps {
    address: Address;
    title: string;
    isSameAsShipping?: boolean;
}

const AddressDisplayCard: React.FC<AddressDisplayCardProps> = ({
    address,
    title,
    isSameAsShipping = false,
}) => {
    return (
        <div className={classes.address_card}>
            <h3 className={classes.card_title}>{title}</h3>
            {isSameAsShipping ? (
                <Badge className="mb-2">Same as Shipping</Badge>
            ) : null}
            <p>{`${address.street1}${address.street2 ? `, ${address.street2}` : ''}`}</p>
            <p>{`${address.city}, ${address.state} ${address.zip}`}</p>
            <p>{address.phone}</p>
        </div>
    );
};

export default AddressDisplayCard;
