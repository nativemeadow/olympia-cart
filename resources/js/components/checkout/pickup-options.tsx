import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Divider, Textarea, DatePicker } from '@heroui/react';

import { Checkout } from '@/types';
import classes from './options.module.css';

const PickupOptions = () => {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    return (
        <div className={classes.options_box} data-checkout-option={'pickup'} onClick={openModal}>
            <img height={270} width={315} alt="" src="/assets/in-store-pickup-icon.png" />
            <div className={classes.options_details}>
                <span className={classes.options_title}>Pickup</span>
                <span className={classes.options_meta}>Pick up your order from the store</span>
            </div>
        </div>
    );
};

export default PickupOptions;
