'use client';

import React, { useEffect, useState } from 'react';

type InputNumberSpinnerProps = {
	disabled: boolean;
	min?: number;
	max?: number;
	step?: number;
	value: number;
	onChange?: (newValue: number) => void;
};

import classes from './NumberInputSpinner.module.css';

const InputNumberSpinner = ({
	disabled,
	min = 0,
	max = 9999,
	step = 0.1,
	value,
	onChange,
}: InputNumberSpinnerProps) => {
	const [inputValue, setInputValue] = useState(value);

	// update the input value when the value prop changes
	useEffect(() => {
		setInputValue(value);
	}, [value]);

	const handleIncrement = (
		e: React.MouseEvent<HTMLButtonElement, MouseEvent>
	) => {
		e.preventDefault();
		setInputValue(Math.min(inputValue + step, max));
		onChange?.(Math.min(inputValue + step, max));
	};

	const handleDecrement = (
		e: React.MouseEvent<HTMLButtonElement, MouseEvent>
	) => {
		e.preventDefault();
		setInputValue(Math.max(inputValue - step, min));
		onChange?.(Math.max(inputValue - step, min));
	};

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		event.preventDefault();
		const newValue = parseFloat(event.target.value);
		if (isNaN(newValue) || newValue < min || newValue > max) {
			return;
		}

		setInputValue(newValue);
		onChange?.(newValue);
	};

	//console.log('disable:', disabled);
	return (
		<div className={classes.row}>
			<div className={classes.control}>
				<div className={classes.wrapper}>
					<button
						id='decrementButton'
						className={`button ${classes.button} ${classes.button_left}`}
						disabled={disabled}
						onClick={handleDecrement}
					>
						-
					</button>
					<input
						className={classes.input}
						type='number'
						step={step}
						value={inputValue}
						onChange={handleChange}
						disabled={disabled}
					/>
					<button
						id='incrementButton'
						className={`button ${classes.button} ${classes.button_right}`}
						disabled={disabled}
						onClick={handleIncrement}
					>
						+
					</button>
				</div>
			</div>
		</div>
	);
};

export default InputNumberSpinner;
