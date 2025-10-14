import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Divider, Textarea, DatePicker } from '@heroui/react';

import { Checkout } from '@/types';
import classes from './options.module.css';

const DeliveryOptions = () => {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    return (
        <div className={classes.options_box} data-checkout-option={'delivery'} onClick={openModal}>
            <img height={270} width={315} alt="" src="/assets/delivery-icon.png" />
            <div className={classes.options_details}>
                <span className={classes.options_title}>Delivery</span>
                <span className={classes.options_meta}>Have your order delivery to you home</span>
            </div>
        </div>
    );
};

export default DeliveryOptions;
