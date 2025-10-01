import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DatePicker } from '@heroui/react';
import { TimeInput } from '@heroui/react';
import { Time } from '@internationalized/date';
import {
	PickupOptionsSchema,
	pickupOptionsSchema,
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
} from '@heroui/react';
import Image from 'next/image';
import { isDateUnavailable } from './available-dates';
import useCheckoutStore from '@/zustand/checkout';
import { formatDate, getTodayDate } from '@/lib/date-util';
import classes from './options.module.css';
import { addHoursAndMinutes } from '@/lib/util';
import { ActionResult, Checkout } from '@/types';
import shoppingCartStore from '@/zustand/shopping-cart-store';
import { useCartStore } from '@/components/ShoppingCartProvider';
import { updateCheckout } from '@/app/actions/shopping-cart.actions';
import { toast } from 'react-toastify';

const initialState = {
	pickup_date: {
		year: 0,
		month: 0,
		day: 0,
	},
	pickup_time: '',
};

type Props = {
	setCheckoutOption: (option: string) => void;
};

export default function PickupOptions({ setCheckoutOption }: Props) {
	const [isOpen, setIsOpen] = useState(false);
	const {
		option,
		date,
		time,
		setOption,
		setDate,
		setTime,
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
	} = useForm<PickupOptionsSchema>({
		resolver: zodResolver(pickupOptionsSchema),
		mode: 'onTouched',
		defaultValues: {
			pickup_date: date
				? formatDate(new Date(date))
				: formatDate(new Date()),
			pickup_time: time
				? `${time.hour.toString().padStart(2, '0')}:${time.minute
						.toString()
						.padStart(2, '0')}`
				: '08:00',
		},
	});

	const onSubmit = async (data: PickupOptionsSchema) => {
		setOption('pickup');
		setDate(new Date(data.pickup_date));
		setTime({
			hour: parseInt(data.pickup_time.split(':')[0]),
			minute: parseInt(data.pickup_time.split(':')[1]),
		});

		let pickupDateTime: Date | undefined;
		if (date && time) {
			pickupDateTime = addHoursAndMinutes(date, time?.hour, time?.minute);
		} else {
			pickupDateTime = new Date(); // fallback to current date if undefined
		}

		if (isValid()) {
			console.log('Pickup options saved successfully');

			const checkout: Checkout = {
				cart_id: cartId,
				status: 'PENDING',
				option: 'pickup',
				date: pickupDateTime,
				time: {},
				instructions: '',
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
		setCheckoutOption('store pickup');
	};

	return (
		<>
			<div
				className={classes.options_box}
				data-checkout-option={'store-pickup'}
				onClick={openModal}
			>
				<Image
					height={270}
					width={315}
					alt=''
					src='/images/in-store-pickup-icon.png'
				/>
				<div className={classes.options_details}>
					<span className={classes.options_title}>
						In-Store Pickup
					</span>
					<span className={classes.options_meta}>
						Pickup at our location
					</span>
				</div>
			</div>

			<Modal
				size='lg'
				backdrop='opaque'
				isOpen={isOpen}
				onClose={closeModal}
				onOpenChange={(open) => setIsOpen(open)}
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
									In-Store Pickup
								</ModalHeader>
								<Divider />
								<ModalBody>
									<p>
										Your order will be available at our
										location for pickup.
									</p>
									<div className='flex w-full flex-wrap items-end md:flex-nowrap mb-6 md:mb-0 gap-4'>
										<input
											type='date'
											{...register('pickup_date')}
											min={getTodayDate()}
											className='w-60 p-2 border rounded-md border-transparent bg-gray-100'
										/>
										{errors.pickup_date && (
											<p className='text-red-500'>
												{errors.pickup_date.message}
											</p>
										)}
									</div>
									<div>
										<Controller
											name='pickup_time'
											control={control}
											defaultValue='08:00' // Set default value here
											render={({ field }) => (
												<TimeInput
													label='Event Time'
													labelPlacement='outside'
													value={
														field.value
															? new Time(
																	parseInt(
																		field.value.split(
																			':'
																		)[0]
																	),
																	parseInt(
																		field.value.split(
																			':'
																		)[1]
																	)
															  )
															: undefined
													}
													onChange={(
														value: Time | null
													) => {
														if (value) {
															field.onChange(
																`${value.hour
																	.toString()
																	.padStart(
																		2,
																		'0'
																	)}:${value.minute
																	.toString()
																	.padStart(
																		2,
																		'0'
																	)}`
															);
														} else {
															field.onChange('');
														}
													}}
												/>
											)}
										/>
									</div>
									<p>
										We try our very best to accommodate your
										requested pickup date and time, however,
										due to traffic conditions, weather,
										etc., we do not guarantee any pickup
										dates or times. Our staff will contact
										you to confirm your pickup date and time
										within 1 business day.
									</p>
									<p>
										Please Note: In-store pickup orders will
										have a 24-hour lead time for processing.
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
											: 'Save Pickup Options'}
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
