/**
 * Formats a phone number string into the (nnn) nnn-nnnn format.
 *
 * This function accepts phone numbers in several common formats and attempts
 * to convert them to a standardized North American format. It works by stripping
 * all non-digit characters before applying the formatting.
 *
 * Handled input formats include:
 * - +1nnnnnnnnnn (e.g., +12223334444)
 * - nnnnnnnnnn (e.g., 2223334444)
 * - Various formats with separators (e.g., (222) 333-4444, 222-333-4444, 222 333 4444)
 *
 * If the input string cannot be parsed into a 10-digit number (after potentially
 * stripping a +1 prefix), the original string is returned as a fallback.
 *
 * @param phoneNumber The phone number string to format. Can be null or undefined.
 * @returns The formatted phone number as a string, an empty string for
 *          null/undefined/empty input, or the original string if formatting is not possible.
 */
export const formatPhoneNumber = (
    phoneNumber: string | null | undefined,
): string => {
    // Return an empty string for null, undefined, or empty input to avoid errors.
    if (!phoneNumber) {
        return '';
    }

    // First, remove all non-digit characters from the input string.
    const digitsOnly = phoneNumber.replace(/\D/g, '');

    // Check for the North American country code '1' and remove it if present.
    let normalizedNumber = digitsOnly;
    if (normalizedNumber.length === 11 && normalizedNumber.startsWith('1')) {
        normalizedNumber = normalizedNumber.substring(1);
    }

    // If we have a 10-digit number, format it and return.
    if (normalizedNumber.length === 10) {
        return normalizedNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }

    // If after cleaning, the number isn't 10 digits, it's an invalid or
    // unhandled format. Return the original input as a safe fallback.
    return phoneNumber;
};

// --- Example Usage ---
// You can run this file with a TypeScript runner (like ts-node) to see the output.

const numbersToTest = [
    '+12223334444',
    '5556667777',
    '(888) 999-0000',
    '12345',
    'not a phone number',
    null,
    '999-888-7777',
    '111 222 3333',
];

console.log('--- Phone Number Formatting Test ---');
numbersToTest.forEach((num) => {
    console.log(
        `Input: ${String(num).padEnd(20)} Output: "${formatPhoneNumber(
            num as string,
        )}"`,
    );
});
