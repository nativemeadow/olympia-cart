import {
    DateValue,
    today,
    getLocalTimeZone,
    Time,
} from '@internationalized/date';

// Helper function to check for US holidays (simplified)
function isUSHoliday(date: Date): boolean {
    const month = date.getMonth() + 1; // getMonth() is zero-based
    const day = date.getDate();

    // Simplified check for some major US holidays
    return (
        (month === 1 && day === 1) || // New Year's Day
        (month === 7 && day === 4) || // Independence Day
        (month === 12 && day === 25) || // Christmas Day
        (month === 11 && day >= 22 && day <= 28 && date.getDay() === 4) // Thanksgiving (4th Thursday of November)
    );
}

export function isDateUnavailable(date: DateValue): boolean {
    const timeZone = getLocalTimeZone();
    const currentDate = today(timeZone);
    const nextDay = currentDate.add({ days: 1 });
    const currentDatePlusOne = nextDay.toDate(timeZone);
    const currentTime = new Time(
        new Date().getHours(),
        new Date().getMinutes(),
    );
    const noonTime = new Time(12, 0);

    const checkDate = date.toDate(timeZone);

    // Check if the date is less than the current date plus one day
    if (checkDate < currentDatePlusOne) {
        return true;
    }

    // Check if it's tomorrow and current time is after 12:00 PM
    if (
        checkDate.getTime() === currentDatePlusOne.getTime() &&
        currentTime.compare(noonTime) > 0
    ) {
        return true;
    }

    // Check if it's Sunday
    if (checkDate.getDay() === 0) {
        return true;
    }

    // Check if it's a US holiday
    if (isUSHoliday(checkDate)) {
        return true;
    }

    return false;
}
