import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(
    value: number | string,
    locale: string = 'en-US', // Default locale
    currency: string = 'USD', // Default currency
): string {
    // Convert the input to a number
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    // Check if the input is a valid number
    if (isNaN(numericValue)) {
        throw new Error('Invalid input: The value must be a valid number or numeric string.');
    }

    // Use Intl.NumberFormat to format the number as localized currency
    const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2, // Ensure proper rounding to 2 decimals
    });

    return formatter.format(numericValue);
}
