export type CustomDate = string; // YYYY-MM-DD format

export function formatDate(date: Date | string | number): string {
    const validDate = new Date(date);

    if (isNaN(validDate.getTime())) {
        console.warn('Invalid date input, using current date');
        return new Date().toISOString().split('T')[0];
    }

    return validDate.toISOString().split('T')[0];
}

export function getTodayDate(): CustomDate {
    return formatDate(new Date());
}

// Function to Add days to current date
export function addDays(date: Date, days: number) {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + days);
    return newDate;
}
