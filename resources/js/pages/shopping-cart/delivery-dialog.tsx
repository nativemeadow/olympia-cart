import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	deliveryOptionsSchema,
	DeliveryOptionsSchema,
} from '@/lib/schemas/checkoutOptionsSchema';
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	useDisclosure,
	Divider,
	Textarea,
	DatePicker,
} from '@heroui/react';
import Image from 'next/image';

import { ActionResult, Checkout } from '@/types';
import classes from './options.module.css';
import useCheckoutStore from '@/zustand/checkout';
import { formatDate, getTodayDate, addDays } from '@/lib/date-util';
import shoppingCartStore from '@/zustand/shopping-cart-store';
import { updateCheckout } from '@/app/actions/shopping-cart.actions';
import { toast } from 'react-toastify';

const initialState = {
	delivery_instructions: '',
	delivery_time: '',
};

type Props = {
	setCheckoutOption: (option: string) => void;
};

export default function DeliveryOptions({ setCheckoutOption }: Props) {
	const { onOpen, onOpenChange } = useDisclosure();
	const [isOpen, setIsOpen] = useState(false);
	const {
		option,
		date,
		instructions,
		setOption,
		setDate,
		setInstructions,
		isValid,
		getErrors,
	} = useCheckoutStore();

	const openModal = () => setIsOpen(true);
	const closeModal = () => setIsOpen(false);
	const cartId = shoppingCartStore.getState().cartId();

	const {
		register,
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<DeliveryOptionsSchema>({
		resolver: zodResolver(deliveryOptionsSchema),
		mode: 'onTouched',
		defaultValues: {
			delivery_date: date
				? formatDate(new Date(date))
				: formatDate(addDays(new Date(), 2)),
			delivery_instructions: instructions ? instructions : '',
		},
	});

	const onSubmit = async (data: DeliveryOptionsSchema) => {
		setOption('delivery');
		setDate(new Date(data.delivery_date));
		setInstructions(data.delivery_instructions);

		console.log('selected date: ', date);

		let deliveryDate: Date;

		if (data.delivery_date) {
			deliveryDate = new Date(data.delivery_date);
		} else {
			deliveryDate = new Date(); // fallback to current date if undefined
		}

		if (isValid()) {
			console.log('Delivery options saved successfully');

			const checkout: Checkout = {
				cart_id: cartId,
				status: 'PENDING',
				option: 'delivery',
				date: deliveryDate,
				time: {},
				instructions: data.delivery_instructions,
			};

			const result = await updateCheckout(checkout);
			if (result.status === 'success') {
				console.log('Checkout updated successfully:', result.data);
			} else {
				console.error('Error updating checkout:', result.error);
			}

			closeModal();
		} else {
			const validationErrors = getErrors();
			console.log('Validation errors:', validationErrors);
			// You might want to display these errors to the user
		}

		setCheckoutOption('Delivery');
	};

	return (
		<>
			<div
				className={classes.options_box}
				data-checkout-option={'delivery'}
				onClick={openModal}
			>
				<Image
					height={270}
					width={315}
					alt=''
					src='/images/delivery-icon.png'
				/>
				<div className={classes.options_details}>
					<span className={classes.options_title}>Delivery</span>
					<span className={classes.options_meta}>
						Have your order delivery to you home
					</span>
				</div>
			</div>
			<Modal
				backdrop='opaque'
				size='lg'
				isOpen={isOpen}
				onClose={closeModal}
				onOpenChange={onOpenChange}
				radius='sm'
				classNames={{
					backdrop:
						'rounded bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20',
				}}
			>
				<ModalContent>
					{(onClose) => (
						<>
							<form onSubmit={handleSubmit(onSubmit)}>
								<ModalHeader className='flex flex-col gap-1'>
									Delivery Instructions
								</ModalHeader>
								<Divider />
								<ModalBody>
									<Controller
										name='delivery_instructions'
										control={control}
										render={({ field }) => (
											<Textarea
												radius='sm'
												label='Delivery instructions are required to proceed to checkout:'
												variant='bordered'
												{...field}
												labelPlacement='outside'
												placeholder='Enter your description'
												className='w-full'
												isInvalid={
													!!errors.delivery_instructions
												}
												errorMessage={
													errors.delivery_instructions &&
													'message' in
														errors.delivery_instructions
														? errors
																.delivery_instructions
																.message
														: ''
												}
											/>
										)}
									/>
									<p>
										<span className='font-bold'>
											Please Note:&nbsp;
										</span>
										Our delivery trucks will not be able to
										go off pavement. We can either dump on
										your driveway or on the street (customer
										must be present to dump on public
										streets).
									</p>
									<div className='flex w-full flex-wrap items-end md:flex-nowrap mb-6 md:mb-0 gap-4'>
										<input
											type='date'
											{...register('delivery_date')}
											min={getTodayDate()}
											className='w-60 p-2 border rounded-md border-transparent bg-gray-100'
										/>
										{errors.delivery_date && (
											<p className='text-red-500'>
												{errors.delivery_date.message}
											</p>
										)}
									</div>
									<p>
										We try our very best to accommodate your
										requested delivery date, however, due to
										traffic conditions, weather, etc., we do
										not guarantee any delivery dates or
										times. Often times, we are able to
										deliver before your requested date. Our
										staff will contact you to confirm your
										delivery date and time within 1 business
										day. No deliveries will be made on
										weekends and Holidays.
									</p>
									<p className='font-bold'>
										Please Note: All deliveries will have a
										48-hour lead up and delivery will only
										be available Monday - Friday.
									</p>
								</ModalBody>
								<ModalFooter>
									<Button
										color='primary'
										type='submit'
										className='w-full bg-yellow-700 text-white text-xl rounded'
										radius='sm'
										disabled={isSubmitting}
									>
										{isSubmitting
											? 'Saving...'
											: 'Save Delivery Options'}
									</Button>
								</ModalFooter>
							</form>
						</>
					)}
				</ModalContent>
			</Modal>
		</>
	);
}
